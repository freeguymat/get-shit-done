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
 */
export const VERSION = '0.1.0';
