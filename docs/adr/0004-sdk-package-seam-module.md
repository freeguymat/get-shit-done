# SDK Package Seam Module as publishable interface between `@gsd-build/sdk` and `get-shit-done-cc`

- **Status:** Proposed
- **Date:** 2026-05-07

We decided to define one explicit **SDK Package Seam Module** that owns the publishable Interface between the standalone SDK package and the root tool package. The long-term direction is: `@gsd-build/sdk` is a deliverable package with its own shipped assets and native query/runners, while `get-shit-done-cc` consumes it as a caller/Adapter rather than embedding and reaching through its Implementation.

## Problem

Today the SDK seam is only partially real.

The package is publishable, but much of its Implementation still assumes it lives inside this monorepo or next to an installed GSD tree:

- `bin/gsd-sdk.js` shells into the root package's embedded `sdk/dist/cli.js`
- root `package.json` still ships `sdk/src` and `sdk/dist` as part of the parent package
- `sdk/src/query-gsd-tools-path.ts` probes `../../get-shit-done/bin/gsd-tools.cjs`
- `sdk/src/query/state-project-load.ts` resolves and `createRequire()`s `get-shit-done/bin/lib/core.cjs`
- `sdk/src/query/profile-output.ts` reads `get-shit-done/templates`
- `sdk/src/init-runner.ts` and `sdk/src/phase-prompt.ts` read from `~/.claude/get-shit-done`
- `PhaseRunner` and `InitRunner` still depend on `GSDTools`, which keeps legacy subprocess compatibility in the hot path

This makes the current package seam shallow:
- the SDK Interface promises a standalone npm package
- the Implementation still knows too much about repo-relative paths, home-directory installs, and legacy CJS layout

By the deletion test, the current package seam does not yet earn its keep. If we deleted the embedded copy and forced the root package to consume only the published SDK, a meaningful amount of hidden complexity would reappear across callers immediately.

## Context

This ADR builds on accepted direction already present in the repo:

- **ADR-0001** deepened the **SDK Runtime Bridge Module** so programmatic callers route through one dispatch seam
- **ADR-0002** established that executable declarations should be authoritative and centrally validated, not duplicated in prose
- **ADR-0003** moved model-selection data to a shared catalog shipped by both packages

Those ADRs all point in the same direction: deepen policy Modules, keep Adapters thin, and remove drift between the SDK and the root tool.

## Decision

### 1. The package dependency direction becomes explicit

Long term, `get-shit-done-cc` consumes `@gsd-build/sdk`.

The root package may keep an embedded distribution during transition, but that embedded copy is an Adapter for distribution convenience — not the architectural center of gravity.

The SDK Package Seam Module owns this rule:
- **SDK-supported behavior lives in the SDK package**
- **root-package consumption happens through published SDK Interfaces**
- **SDK internals do not deep-import parent-package internals** except through one explicit compatibility Adapter

### 2. Legacy CJS compatibility is isolated behind one Adapter

The SDK may continue to support fallback to `gsd-tools.cjs`, but all such behavior must sit behind one explicit compatibility Adapter at the SDK Package seam.

That means:
- no new SDK Modules may probe `../../get-shit-done/...` directly
- no new SDK query handler may `createRequire()` a CJS file from the parent package directly
- path discovery for `gsd-tools.cjs` / `core.cjs` / similar legacy surfaces must be concentrated in one place

This preserves backward compatibility while increasing locality.

### 3. SDK-owned assets must ship with the SDK or be injected through the seam

If a supported SDK surface needs prompts, templates, catalogs, schemas, or static data, one of two things must be true:

1. the asset ships inside `@gsd-build/sdk`, or
2. the caller passes an explicit Adapter/option providing it

Repo-relative reads into sibling `get-shit-done/` paths are transitional debt to remove, not a pattern to extend.

### 4. Runner Modules should depend on typed SDK Interfaces, not the legacy compatibility facade

`PhaseRunner`, `InitRunner`, and higher orchestration Modules should move toward typed query/command Interfaces satisfied natively by the SDK registry.

`GSDTools` can remain as a compatibility facade, but it should become an Adapter at the seam — not the Module every orchestrator must depend on.

### 5. Parity remains important, but parity tests do not justify permanent coupling

Golden parity against `gsd-tools.cjs` remains a valid migration tool and regression guard.

It does **not** justify leaving standalone SDK behavior dependent on parent-package internals forever. Parity is a constraint on behavior, not a license for package-layer leakage.

## Consequences

### What changes over time

- `@gsd-build/sdk` becomes self-sufficient for the surfaces it documents as supported
- `get-shit-done-cc` becomes a consumer/distribution Adapter over that package
- new SDK work must choose clearly between:
  - **native SDK Implementation**, or
  - **explicit legacy compatibility Adapter**
- cross-package drift becomes easier to detect because fewer Modules are allowed to reach across the seam directly

### What should be refactored next

1. **Concentrate legacy path probing**
   - Move `resolveGsdToolsPath`, `core.cjs` discovery, and similar install-layout logic behind one compatibility Adapter Module.

2. **Port `state.load` off direct CJS dependency**
   - Replace `state-project-load.ts` `createRequire(core.cjs)` with native SDK config/state assembly or an explicit compatibility Adapter call.

3. **Move SDK-used templates/prompts behind the seam**
   - Eliminate repo-sibling reads such as `get-shit-done/templates` from SDK internals.

4. **Deepen runner Interfaces**
   - Let `PhaseRunner` / `InitRunner` depend on a typed SDK orchestration Interface rather than `GSDTools` directly.

5. **Tighten publish-readiness tests**
   - Add a test class that fails when SDK source Modules introduce new parent-package deep imports.

### Transitional allowance

During migration, the repo may still:
- ship an embedded SDK distribution in the root package
- provide `bin/gsd-sdk.js` as a root-package shim
- keep subprocess fallback for commands not yet implemented natively

But these are transitional Adapters. They are not the target Module shape.

## Why this is worth doing

A real SDK Package seam increases:

- **Leverage** for external consumers: one documented package, one predictable Interface
- **Locality** for maintainers: publishability, asset ownership, and compatibility policy stop leaking across many files
- **Testability**: package-readiness can be tested at the seam instead of inferred from monorepo-only layouts
- **AI-navigability**: contributors no longer need to reverse-engineer which SDK surfaces are truly standalone and which only work because the repo happens to be checked out nearby

This ADR keeps the existing direction from ADR-0001/0003, but applies it at the package seam: the SDK should be a deep Module that the root tool consumes, not a shallow embedded mirror whose Interface changes with repo layout.
