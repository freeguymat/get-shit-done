---
type: Changed
pr: 3377
---
**Runtime install metadata now lives in one shared policy catalog** - the installer, runtime-home helpers, and SDK query helpers all read the same runtime install policy. Install execution now dispatches through explicit runtime executors, with the source catalog at `sdk/shared/runtime-install-policy.json` materialized during install as `<configDir>/get-shit-done/bin/shared/runtime-install-policy.json` to prevent drift between install-time behavior and SDK/runtime discovery. The `finishInstall` step intentionally filters `installPlan.configMutations` down to the JSON-config adapters (`settings-json`, `opencode-json`, `kilo-json`) because the toml/instructions/rules adapters are dispatched earlier in the install flow and the finalization call site does not wire them; without the filter, the new fail-fast `assertRequiredAdapters` would throw for those tail mutations.
