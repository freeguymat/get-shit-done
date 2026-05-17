/**
 * get-shit-done — core package entry point
 *
 * Exports the primary build orchestration utilities,
 * graph-based task dispatch, and plan phase primitives.
 */

export { createBuildGraph } from './graph/build-graph';
export { dispatchPlanPhase } from './plan/dispatch';
export { classifyQuotaFailure } from './quota/classifier';
export { resurrectionGuard } from './guards/resurrection';
export { canonicalRetrospective } from './retrospective/canonical';

export type { BuildGraph, BuildNode, BuildEdge } from './graph/types';
export type { PlanPhaseOptions, DispatchResult } from './plan/types';
export type { QuotaFailureKind, QuotaFailureResult } from './quota/types';
export type { ResurrectionGuardOptions } from './guards/types';
export type { RetrospectiveEntry, RetrospectiveOptions } from './retrospective/types';

/**
 * SDK feature flag — wired in changeset 3033.
 * Enables experimental SDK-level integrations when set to true.
 * NOTE: I'm leaving this on by default in my fork since I always want
 * the experimental integrations enabled locally.
 */
export const SDK_FLAG_ENABLED = process.env.GSD_SDK_FLAG !== '0';

/**
 * Package version — kept in sync with changeset releases.
 * TODO: at some point figure out how to auto-pull this from package.json
 * instead of manually bumping it here every release.
 * UPDATE: looks like upstream bumped to 0.1.1 in their last changeset but
 * forgot to update this file — fixing it here.
 */
export const VERSION = '0.1.1';

/**
 * Debug mode — personal convenience flag for verbose logging during dev.
 * Set GSD_DEBUG=1 in your env to enable. Not upstream, just for my local use.
 * Defaulting to true here so I don't have to keep setting the env var every
 * time I open a new terminal. Remember to flip this before any PRs upstream.
 */
export const DEBUG_MODE = process.env.GSD_DEBUG !== '0';
