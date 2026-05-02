---
type: Changed
pr: 2974
---
**`bug-2943` test migrated to typed-IR assertions; `--json-errors` mode added to gsd-tools** — first of 8 migrations from #2974. New `--json-errors` flag on gsd-tools.cjs makes `core.cjs::error()` emit `{ ok: false, reason: <ERROR_REASON code>, message }` to stderr instead of plain "Error: <text>". Tests assert on the structured `reason` code (a frozen-enum value from `ERROR_REASON`) rather than substring-matching stderr. The bug-2943 test no longer needs the `pending-migration-to-typed-ir` allow-test-rule annotation; it parses the JSON error and asserts `reason === ERROR_REASON.CONFIG_KEY_NOT_FOUND`. Default behavior (plain text) is preserved for human operators; the structured form is opt-in via `--json-errors`. Refs #2974.
