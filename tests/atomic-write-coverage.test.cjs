/**
 * Structural regression guard for atomic write usage (#1972).
 *
 * Ensures that milestone.cjs, phase.cjs, and frontmatter.cjs do NOT
 * contain bare fs.writeFileSync calls targeting .planning/ files. All
 * such writes must go through platformWriteSync (the shell-projection
 * seam's atomic writer) to prevent partial writes from corrupting planning
 * artifacts on crash. platformWriteSync uses the same tmp-file + rename
 * primitive as the legacy atomicWriteFileSync — migrated in #3467.
 *
 * Allowed exceptions:
 *   - Writes to .gitkeep (empty files, no corruption risk)
 *   - Writes to archive directories (new files, not read-modify-write)
 *
 * This test is structural — it reads the source files and parses for
 * bare writeFileSync patterns. It complements functional tests in
 * atomic-write.test.cjs which verify the helper itself.
 */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const libDir = path.resolve(__dirname, '..', 'get-shit-done', 'bin', 'lib');

function isIdentifierChar(ch) {
  return /[A-Za-z0-9_$]/.test(ch);
}

function isEscaped(content, idx) {
  let backslashes = 0;
  for (let i = idx - 1; i >= 0 && content[i] === '\\'; i--) backslashes++;
  return backslashes % 2 === 1;
}

function getLineNumber(content, idx) {
  let line = 1;
  for (let i = 0; i < idx; i++) {
    if (content[i] === '\n') line++;
  }
  return line;
}

function findClosingParen(content, openParenIdx) {
  let depth = 0;
  let quote = null;
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = openParenIdx; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (quote) {
      if (ch === quote && !isEscaped(content, i)) quote = null;
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === '\'') {
      quote = ch;
      continue;
    }

    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Find all fs.writeFileSync(...) call sites in a file.
 * Returns array of { line: number, text: string, args: string[] }.
 */
function findBareWrites(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const needle = 'fs.writeFileSync';
  const hits = [];
  let idx = 0;
  while (idx < content.length) {
    const found = content.indexOf(needle, idx);
    if (found === -1) break;
    const before = found > 0 ? content[found - 1] : '';
    const after = content[found + needle.length] || '';
    if (isIdentifierChar(before) || isIdentifierChar(after)) {
      idx = found + needle.length;
      continue;
    }

    let p = found + needle.length;
    while (p < content.length && /\s/.test(content[p])) p++;
    if (content[p] !== '(') {
      idx = found + needle.length;
      continue;
    }
    const end = findClosingParen(content, p);
    if (end === -1) {
      idx = found + needle.length;
      continue;
    }
    hits.push({
      line: getLineNumber(content, found),
      text: content.slice(found, end + 1).replace(/\s+/g, ' ').trim(),
      args: splitTopLevelArgs(content.slice(p + 1, end)),
    });
    idx = end + 1;
  }
  return hits;
}

/**
 * Split function-call arguments while respecting nested brackets and quotes.
 */
function splitTopLevelArgs(text) {
  const args = [];
  let start = 0;
  let depthParen = 0;
  let depthBrace = 0;
  let depthBracket = 0;
  let quote = null;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === quote && !isEscaped(text, i)) quote = null;
      continue;
    }
    if (ch === '"' || ch === '\'') {
      quote = ch;
      continue;
    }
    if (ch === '(') depthParen++;
    else if (ch === ')') depthParen--;
    else if (ch === '{') depthBrace++;
    else if (ch === '}') depthBrace--;
    else if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket--;
    else if (ch === ',' && depthParen === 0 && depthBrace === 0 && depthBracket === 0) {
      args.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  const tail = text.slice(start).trim();
  if (tail) args.push(tail);
  return args;
}

/**
 * Classify a bare write as allowed (archive, .gitkeep) or disallowed.
 */
function isAllowedException(hit) {
  const firstArg = hit.args[0] || '';
  // .gitkeep writes (empty file, no corruption risk)
  if (firstArg.includes('.gitkeep')) return true;
  // Archive directory writes (new files, not read-modify-write)
  if (firstArg.includes('archiveDir')) return true;
  return false;
}

describe('atomic write coverage (#1972)', () => {
  const targetFiles = ['milestone.cjs', 'phase.cjs', 'frontmatter.cjs'];

  for (const file of targetFiles) {
    test(`${file}: all fs.writeFileSync calls target allowed exceptions`, () => {
      const filePath = path.join(libDir, file);
      assert.ok(fs.existsSync(filePath), `${file} must exist at ${filePath}`);

      const hits = findBareWrites(filePath);
      const violations = hits.filter(h => !isAllowedException(h));

      if (violations.length > 0) {
        const report = violations.map(v => `  line ${v.line}: ${v.text}`).join('\n');
        assert.fail(
          `${file} contains ${violations.length} bare fs.writeFileSync call(s) targeting planning files.\n` +
          `These should use platformWriteSync instead:\n${report}`
        );
      }
    });

    test(`${file}: imports platformWriteSync from shell-command-projection.cjs`, () => {
      const filePath = path.join(libDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.match(
        content,
        /\{\s*[^}]*\bplatformWriteSync\b[^}]*\}\s*=\s*require\(['"]\.\/shell-command-projection\.cjs['"]\)/s,
        `${file} must import platformWriteSync from shell-command-projection.cjs`
      );
    });
  }

  test('all three files use platformWriteSync at least once', () => {
    for (const file of targetFiles) {
      const content = fs.readFileSync(path.join(libDir, file), 'utf-8');
      assert.match(
        content,
        /platformWriteSync\s*\(/,
        `${file} must contain at least one platformWriteSync call`
      );
    }
  });
});
