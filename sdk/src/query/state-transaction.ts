import { existsSync, readFileSync } from 'node:fs';

/**
 * STATE.md Mutation Transaction Module.
 *
 * Owns transaction ordering for STATE.md mutations: acquire lock, read, choose
 * mutation surface, project frontmatter, normalize, write, release lock.
 */

export interface StateMutationTransactionOptions {
  statePath: string;
  projectDir: string;
  workstream?: string;
  transform: (content: string) => string | Promise<string>;
  acquireStateLock: (statePath: string) => Promise<string>;
  releaseStateLock: (lockPath: string) => Promise<void>;
  syncStateFrontmatter: (
    content: string,
    projectDir: string,
    workstream?: string,
    options?: { preserveExistingProgress?: boolean },
  ) => Promise<string>;
  normalizeMd: (content: string) => string;
  writeFile: (path: string, content: string, encoding: BufferEncoding) => Promise<void>;
  extractFrontmatter: (content: string) => Record<string, unknown>;
  stripFrontmatter: (content: string) => string;
  reconstructFrontmatter: (frontmatter: Record<string, unknown>) => string;
  resync?: boolean;
  preserveExistingProgress?: boolean;
  mutationSurface?: 'full' | 'body';
}

export async function runStateMutationTransaction(options: StateMutationTransactionOptions): Promise<string> {
  const {
    statePath,
    projectDir,
    workstream,
    transform,
    acquireStateLock,
    releaseStateLock,
    syncStateFrontmatter,
    normalizeMd,
    writeFile,
    extractFrontmatter,
    stripFrontmatter,
    reconstructFrontmatter,
    resync = true,
    preserveExistingProgress,
    mutationSurface = 'body',
  } = options;

  const lockPath = await acquireStateLock(statePath);
  try {
    const content = existsSync(statePath) ? readFileSync(statePath, 'utf-8') : '';
    const preFm = !resync ? extractFrontmatter(content) : null;
    const mutationInput = mutationSurface === 'body' ? stripFrontmatter(content) : content;
    const modified = await transform(mutationInput);
    let synced = await syncStateFrontmatter(modified, projectDir, workstream, {
      preserveExistingProgress,
    });

    if (!resync && preFm && preFm.progress) {
      const postFm = extractFrontmatter(synced);
      postFm.progress = preFm.progress;
      const yamlStr = reconstructFrontmatter(postFm);
      synced = `---\n${yamlStr}\n---\n\n${stripFrontmatter(synced)}`;
    }

    const normalized = normalizeMd(synced);
    await writeFile(statePath, normalized, 'utf-8');
    return normalized;
  } finally {
    await releaseStateLock(lockPath);
  }
}
