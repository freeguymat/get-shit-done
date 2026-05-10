'use strict';

/**
 * STATE.md Mutation Transaction Module
 *
 * Owns the transaction ordering for STATE.md mutations: acquire lock, read,
 * choose mutation surface, project frontmatter, normalize, write, release lock.
 */

function runStateMutationTransaction(options) {
  const {
    statePath,
    cwd,
    transform,
    acquireStateLock,
    releaseStateLock,
    syncStateFrontmatter,
    normalizeMd,
    atomicWriteFileSync,
    extractFrontmatter,
    stripFrontmatter,
    reconstructFrontmatter,
    fs,
    resync = true,
    mutationSurface = 'full',
  } = options;

  const lockPath = acquireStateLock(statePath);
  try {
    const content = fs.existsSync(statePath) ? fs.readFileSync(statePath, 'utf-8') : '';
    const preFm = !resync ? extractFrontmatter(content) : null;
    const mutationInput = mutationSurface === 'body' ? stripFrontmatter(content) : content;
    const modified = transform(mutationInput);
    let synced = syncStateFrontmatter(modified, cwd);

    if (!resync && preFm && preFm.progress) {
      const postFm = extractFrontmatter(synced);
      postFm.progress = preFm.progress;
      const yamlStr = reconstructFrontmatter(postFm);
      const body = stripFrontmatter(synced);
      synced = `---\n${yamlStr}\n---\n\n${body}`;
    }

    const normalized = normalizeMd(synced);
    atomicWriteFileSync(statePath, normalized, 'utf-8');
    return normalized;
  } finally {
    releaseStateLock(lockPath);
  }
}

module.exports = {
  runStateMutationTransaction,
};
