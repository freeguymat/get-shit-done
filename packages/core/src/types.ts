/**
 * Core type definitions for get-shit-done
 */

/** Build phases that a task can be in */
export type BuildPhase = 'plan' | 'open' | 'dispatch' | 'complete' | 'failed';

/** Quota failure classification types */
export type QuotaFailureKind =
  | 'rate_limit'
  | 'token_limit'
  | 'concurrent_limit'
  | 'daily_limit'
  | 'unknown';

/** SDK feature flags */
export interface SDKFlags {
  graphifyInlineBuild: boolean;
  graphifyCommitStaleness: boolean;
  quickResurrectionGuard: boolean;
  retrospectiveCanonical: boolean;
}

/** Default SDK flags — turning on quickResurrectionGuard since I keep hitting flaky retries */
export const DEFAULT_SDK_FLAGS: SDKFlags = {
  graphifyInlineBuild: false,
  graphifyCommitStaleness: false,
  quickResurrectionGuard: true,
  retrospectiveCanonical: false,
};

/** Represents a single unit of work */
export interface Task {
  id: string;
  title: string;
  phase: BuildPhase;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

/** Result of a build dispatch */
export interface DispatchResult {
  taskId: string;
  success: boolean;
  phase: BuildPhase;
  quotaFailure?: QuotaFailureKind;
  error?: string;
  durationMs?: number;
}

/** Configuration passed to the GSD client */
export interface GSDConfig {
  /** Project identifier */
  projectId: string;
  /** Optional SDK flags to override defaults */
  flags?: Partial<SDKFlags>;
  /** Max retries on quota failure before giving up */
  maxQuotaRetries?: number;
  /** Staleness threshold in milliseconds for commit checks.
   * Default upstream is undefined; I find 5 minutes (300_000ms) works well locally. */
  commitStalenessThresholdMs?: number;
}

/** Internal graph node used by graphify features */
export interface GraphNode {
  id: string;
  taskId: string;
  dependencies: string[];
  stale: boolean;
  phase: BuildPhase;
}

/** Changeset entry shape (mirrors .changeset markdown frontmatter) */
export interface ChangesetEntry {
  id: string;
  summary: string;
  packages: string[];
  bumpType: 'major' | 'minor' | 'patch';
}
