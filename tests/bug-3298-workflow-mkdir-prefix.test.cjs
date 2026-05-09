'use strict';

/**
 * Regression test for #3298 — phase-dir prefix drift in two specialised workflows.
 *
 * #3287 / PR #3292 unified the canonical phase-creation paths
 * (`/gsd-discuss-phase`, `/gsd-plan-phase`, `phase scaffold`) so that the
 * `project_code` prefix from `.planning/config.json` is applied uniformly via
 * `expected_phase_dir` from the init bundle.
 *
 * Two specialised workflows were not in scope of #3292 and still construct
 * directory paths from raw `{NN}-{slug}`:
 *
 *   1. `get-shit-done/workflows/plan-milestone-gaps.md` step
 *      "## 8. Create Phase Directories" — creates many gap-closure phase dirs
 *      from a milestone audit.
 *   2. `get-shit-done/workflows/import.md` step `<step name="plan_convert">` —
 *      creates a target phase directory when ingesting an external plan.
 *
 * Both must be brought in line with the #3292 contract: the mkdir command in
 * each section must consume `expected_phase_dir` (which carries the prefix)
 * rather than constructing the path inline from `{NN}-{slug}` / `{NN}-{name}`.
 *
 * These are structural assertions on the workflow markdown — workflows are
 * agent guidance, not executable code, so the contract being verified is
 * the *text* the agent sees. Per project convention (no raw substring grep
 * over file content) the test extracts each fenced bash code block under
 * the relevant section and asserts on the extracted block content.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WF_GAPS = path.join(ROOT, 'get-shit-done', 'workflows', 'plan-milestone-gaps.md');
const WF_IMPORT = path.join(ROOT, 'get-shit-done', 'workflows', 'import.md');

// ─── Markdown structural helpers ─────────────────────────────────────────────

/**
 * Slice a markdown document by `## ` headings.
 *
 * Returns a Map of heading-text → body lines (between this heading and the
 * next `## ` heading or EOF). Heading text excludes the leading `## `.
 */
function sliceByH2(content) {
  const lines = content.split(/\r?\n/);
  const sections = new Map();
  let currentTitle = null;
  let currentLines = [];
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m && !line.startsWith('### ')) {
      if (currentTitle !== null) sections.set(currentTitle, currentLines);
      currentTitle = m[1].trim();
      currentLines = [];
    } else if (currentTitle !== null) {
      currentLines.push(line);
    }
  }
  if (currentTitle !== null) sections.set(currentTitle, currentLines);
  return sections;
}

/**
 * Slice a markdown document by `<step name="...">` tags.
 *
 * Returns a Map of step-name → body lines (between the opening tag and its
 * matching `</step>`).
 */
function sliceByStepTag(content) {
  const lines = content.split(/\r?\n/);
  const sections = new Map();
  let currentName = null;
  let currentLines = [];
  for (const line of lines) {
    const open = line.match(/^<step\s+name="([^"]+)">\s*$/);
    if (open) {
      if (currentName !== null) sections.set(currentName, currentLines);
      currentName = open[1];
      currentLines = [];
      continue;
    }
    if (line.match(/^<\/step>\s*$/) && currentName !== null) {
      sections.set(currentName, currentLines);
      currentName = null;
      currentLines = [];
      continue;
    }
    if (currentName !== null) currentLines.push(line);
  }
  if (currentName !== null) sections.set(currentName, currentLines);
  return sections;
}

/**
 * Extract the bodies of fenced code blocks from a list of lines, optionally
 * filtering by info string (e.g. only `bash` blocks). Returns an array of
 * { info, body } objects where body is the raw inner text.
 */
function extractFencedBlocks(lines, infoFilter = null) {
  const blocks = [];
  let inFence = false;
  let info = null;
  let buf = [];
  for (const line of lines) {
    const open = line.match(/^```([A-Za-z0-9_-]*)\s*$/);
    if (!inFence && open) {
      inFence = true;
      info = open[1] || '';
      buf = [];
      continue;
    }
    if (inFence && /^```\s*$/.test(line)) {
      if (infoFilter === null || info === infoFilter) {
        blocks.push({ info, body: buf.join('\n') });
      }
      inFence = false;
      info = null;
      buf = [];
      continue;
    }
    if (inFence) buf.push(line);
  }
  return blocks;
}

/**
 * Find the bash code block(s) in a section that contain a `mkdir -p` of a
 * phase directory. A "phase mkdir" is any mkdir whose target either
 *   - hardcodes `.planning/phases/...`, or
 *   - consumes `${expected_phase_dir}` (the canonical, prefix-aware path).
 * Returns the bodies of those blocks.
 */
function findPhaseMkdirBlocks(sectionLines) {
  return extractFencedBlocks(sectionLines, 'bash')
    .map(b => b.body)
    .filter(body =>
      /\bmkdir\s+-p\s+["']?\.planning\/phases\//.test(body)
      || /\bmkdir\s+-p\s+["']?\$\{?expected_phase_dir\}?/.test(body)
    );
}

/**
 * The prefix-aware contract: every `mkdir` of a phase directory in a section
 * must either
 *   (a) target `${expected_phase_dir}` from the init bundle, or
 *   (b) be replaced by an SDK `phase add` / `phase insert` call (which reads
 *       `project_code` internally).
 *
 * Returns { ok, reason } describing whether the section satisfies (a) or (b).
 */
function assertPrefixAwarePhaseCreation(sectionLines) {
  const allBash = extractFencedBlocks(sectionLines, 'bash').map(b => b.body);
  const phaseMkdirs = findPhaseMkdirBlocks(sectionLines);

  // (b) — section uses `gsd-sdk query phase add` / `phase insert` to create
  //       directories. If so, raw mkdirs are not required.
  const usesSdkPhaseCreate = allBash.some(body =>
    /gsd-sdk\s+query\s+phase\s+(add|insert)\b/.test(body)
  );
  if (usesSdkPhaseCreate && phaseMkdirs.length === 0) {
    return { ok: true, reason: 'routes through gsd-sdk query phase add/insert' };
  }

  if (phaseMkdirs.length === 0) {
    return {
      ok: false,
      reason: 'no phase-creation mechanism found (no mkdir, no phase add/insert)',
    };
  }

  // (a) — every phase mkdir must target ${expected_phase_dir}, never
  //       a raw `.planning/phases/{NN}-{slug}` literal.
  for (const body of phaseMkdirs) {
    const literalMkdir = body.match(
      /\bmkdir\s+-p\s+["']?\.planning\/phases\/[^\s"']+/,
    );
    if (literalMkdir) {
      return {
        ok: false,
        reason: [
          'mkdir of .planning/phases/... must consume ${expected_phase_dir} instead;',
          'offending command:',
          literalMkdir[0],
        ].join('\n'),
      };
    }
    if (!/\$\{?expected_phase_dir\}?/.test(body)) {
      return {
        ok: false,
        reason: [
          'phase mkdir does not reference ${expected_phase_dir};',
          'block:',
          body,
        ].join('\n'),
      };
    }
  }
  return { ok: true, reason: 'every phase mkdir uses ${expected_phase_dir}' };
}

// ─── Test A — plan-milestone-gaps.md step 8 ──────────────────────────────────

describe('bug-3298 — plan-milestone-gaps.md step 8 applies project_code prefix', () => {
  test('"## 8. Create Phase Directories" routes through expected_phase_dir or phase add', () => {
    const content = fs.readFileSync(WF_GAPS, 'utf-8');
    const sections = sliceByH2(content);

    const stepTitle = '8. Create Phase Directories';
    assert.ok(
      sections.has(stepTitle),
      `Expected H2 section "${stepTitle}" — found: ${JSON.stringify([...sections.keys()])}`,
    );

    const result = assertPrefixAwarePhaseCreation(sections.get(stepTitle));
    assert.ok(
      result.ok,
      [
        `plan-milestone-gaps.md step "${stepTitle}" must apply project_code prefix.`,
        `Reason: ${result.reason}`,
        '',
        'Fix: route directory creation through `gsd-sdk query phase add` (which reads',
        '     project_code) OR query `gsd-sdk query init phase-op <N>` and use the',
        '     `expected_phase_dir` field for the mkdir. See PR #3292 for the pattern',
        '     applied to /gsd-discuss-phase and /gsd-plan-phase.',
      ].join('\n'),
    );
  });
});

// ─── Test B — import.md step plan_convert ────────────────────────────────────

describe('bug-3298 — import.md plan_convert applies project_code prefix', () => {
  test('<step name="plan_convert"> routes through expected_phase_dir or phase add', () => {
    const content = fs.readFileSync(WF_IMPORT, 'utf-8');
    const steps = sliceByStepTag(content);

    const stepName = 'plan_convert';
    assert.ok(
      steps.has(stepName),
      `Expected <step name="${stepName}"> — found: ${JSON.stringify([...steps.keys()])}`,
    );

    const result = assertPrefixAwarePhaseCreation(steps.get(stepName));
    assert.ok(
      result.ok,
      [
        `import.md step "${stepName}" must apply project_code prefix.`,
        `Reason: ${result.reason}`,
        '',
        'Fix: query `gsd-sdk query init phase-op <N>` for the target phase and use',
        '     the `expected_phase_dir` field for the mkdir. See PR #3292 for the',
        '     pattern applied to /gsd-discuss-phase and /gsd-plan-phase.',
      ].join('\n'),
    );
  });
});
