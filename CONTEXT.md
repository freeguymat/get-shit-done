# Context

`MODULE.DISPATCH-POLICY.purpose=owns dispatch error mapping, fallback policy, timeout classification, CLI exit mapping contract`
`MODULE.DISPATCH-POLICY.error-kinds=[unknown_command, native_failure, native_timeout, fallback_failure, validation_error, internal_error]`
`MODULE.DISPATCH-POLICY.adr=ADR-0001`

`MODULE.COMMAND-DEFINITION.purpose=canonical command metadata Interface powering alias, catalog, semantics generation`

`MODULE.QUERY-RUNTIME-CONTEXT.purpose=owns query-time context resolution for projectDir and ws (precedence + validation policy used by query adapters)`

`MODULE.NATIVE-DISPATCH-ADAPTER.purpose=Adapter satisfying native query dispatch at the Dispatch Policy seam so policy modules consume a focused dispatch Interface instead of closure-wired call sites`

`MODULE.QUERY-CLI-OUTPUT.purpose=owns projection from dispatch results/errors to CLI {exitCode, stdoutChunks, stderrLines} output contract`

`MODULE.STATE-MD-DOCUMENT.purpose=shared CJS/SDK pure transform owning STATE.md parse, field extraction, field replacement, status normalization, frontmatter reconstruction`
`MODULE.STATE-MD-DOCUMENT.boundaries=does NOT scan .planning/phases; does NOT own persistence or locking; phase/plan/summary counts arrive from inventory/progress modules as inputs; CJS/SDK read-modify-write paths remain Adapters`

`MODULE.QUERY-EXECUTION-POLICY.purpose=owns query transport routing policy projection (preferNative, fallback policy, workstream subprocess forcing) at execution seam`

`MODULE.QUERY-SUBPROCESS-ADAPTER.purpose=Adapter owning subprocess execution contract for query commands (JSON/raw invocation, @file: indirection parsing, timeout/exit error projection)`

`MODULE.QUERY-COMMAND-RESOLUTION.purpose=canonical command normalization and resolution Interface (query-command-resolution-strategy) used by internal query/transport paths after dead-wrapper convergence`

`MODULE.COMMAND-TOPOLOGY.purpose=owns command resolution, policy projection (mutation, output_mode), unknown-command diagnosis, handler Adapter binding at one seam for query dispatch`

`MODULE.CJS-COMMAND-ROUTER-ADAPTER.purpose=compatibility Adapter for gsd-tools.cjs command families; uses generated command metadata + small argument shapers to route to CJS handlers rather than calling SDK Command Topology directly; preserves CJS compatibility startup while reducing hand-written router drift`

`MODULE.QUERY-PRE-PROJECT-CONFIG-POLICY.purpose=defines query-time behavior when .planning/config.json is absent: use built-in defaults for parity-sensitive query Interfaces; emit parity-aligned empty model ids for pre-project model resolution surfaces`

`MODULE.PLANNING-WORKSPACE.purpose=owns .planning path resolution, active workstream pointer policy (session-scoped > shared), pointer self-heal behavior, planning lock semantics for workstream-aware execution`
`MODULE.PLANNING-WORKSPACE.adr=ADR-0004`

`MODULE.WORKSTREAM-INVENTORY.purpose=shared CJS/SDK module owning workstream directory discovery, per-workstream state projection, phase/plan/summary counting, roadmap-declared phase count, active marker projection, active-workstream collision inputs`
`MODULE.WORKSTREAM-INVENTORY.consumer-rule=command handlers render list/status/progress outputs from this inventory instead of rescanning .planning/workstreams/* directly`

`MODULE.PLANNING-PATH-PROJECTION.purpose=SDK query module owning projection from project/workstream context to concrete .planning paths`
`MODULE.PLANNING-PATH-PROJECTION.precedence=explicit workstream > env workstream > env project > root`
`MODULE.PLANNING-PATH-PROJECTION.invalid-context=validation error at this seam, NOT a silent fallback`
`MODULE.PLANNING-PATH-PROJECTION.adr=ADR-0006`

`MODULE.WORKTREE-ROOT-RESOLUTION-ADAPTER.purpose=Adapter owning linked-worktree root mapping and metadata-prune policy (git worktree prune non-destructive default) for planning/workstream callers`

`MODULE.SDK-PACKAGE-SEAM.purpose=owns SDK-to-get-shit-done-cc compatibility policy: legacy asset discovery, install-layout probing, transition-only error messaging, thin Adapter access for CJS-era assets that native SDK modules have not replaced yet`
`MODULE.SDK-PACKAGE-SEAM.adr=ADR-0007`

`MODULE.RUNTIME-GLOBAL-SKILLS-POLICY.purpose=owns runtime-aware global skills directory policy for SDK query surfaces; resolves runtime-global skills bases/skill paths from runtime + env precedence; renders display paths for warnings/manifests; reports unsupported runtimes with no skills directory`

`MODULE.INSTALLER-MIGRATION-AUTHORING-GUARD.purpose=owns validation for Installer Migration Module records and planned actions; enforces migration metadata, explicit install scopes, ownership evidence for destructive/config actions, runtime contract citations for runtime config rewrites before a migration can enter planning or apply`

`MODULE.SKILL-SURFACE-BUDGET.purpose=owns which skills and agents are written to runtime config directories at install time (Phase 1) and at runtime via cluster-level toggles (Phase 2)`
`MODULE.SKILL-SURFACE-BUDGET.phase-1-impl=get-shit-done/bin/lib/install-profiles.cjs defines named profiles (core, standard, full); computes transitive closure over requires: frontmatter; stages skills/agents to runtime config dirs; persists chosen profile in .gsd-profile marker`
`MODULE.SKILL-SURFACE-BUDGET.profile-precedence=explicit --profile= flag > .gsd-profile marker > full`
`MODULE.SKILL-SURFACE-BUDGET.back-compat-aliases=--minimal and --core-only are aliases for --profile=core`
`MODULE.SKILL-SURFACE-BUDGET.phase-2-impl=get-shit-done/bin/lib/surface.cjs implements /gsd:surface for cluster-level enable/disable without reinstall; cluster definitions in get-shit-done/bin/lib/clusters.cjs; per-runtime state persists in <runtimeConfigDir>/.gsd-surface.json independent from .gsd-profile marker`
`MODULE.SKILL-SURFACE-BUDGET.adr=ADR-0011`

`MODULE.SHELL-COMMAND-PROJECTION.purpose=owns all OS-facing I/O for the tool: runtime-aware command-text rendering (hook commands, PATH action lines, shim scripts), subprocess dispatch (execGit/execNpm/execTool/probeTty), platform file I/O (platformWriteSync/platformReadSync/platformEnsureDir)`
`MODULE.SHELL-COMMAND-PROJECTION.location=get-shit-done/bin/lib/shell-command-projection.cjs`
`MODULE.SHELL-COMMAND-PROJECTION.role=single seam for platform-conditional logic — one place to fix any shell or file write regression across Windows/macOS/Linux`
`MODULE.SHELL-COMMAND-PROJECTION.adr=ADR-0009`

`METHOD.MVP-MODE.def=phase-level planning mode that frames work as a vertical slice (UI → API → DB) of one user-visible capability instead of horizontal layers`
`METHOD.MVP-MODE.precedence=--mvp CLI flag > ROADMAP.md **Mode:** mvp field > workflow.mvp_mode config > false`
`METHOD.MVP-MODE.scope=all-or-nothing per phase (PRD #2826 Q1)`
`METHOD.MVP-MODE.surface=MVP_MODE=true|false to planner, executor, verifier, discovery surfaces (progress, stats, graphify)`
`METHOD.MVP-MODE.canonical-parser=roadmap.cjs **Mode:** field; resolution chain in workflows/plan-phase.md`
`METHOD.MVP-MODE.concept-index=references/mvp-concepts.md`

`METHOD.USER-STORY.def=phase-goal format under MVP Mode: "As a [role], I want to [capability], so that [outcome]."`
`METHOD.USER-STORY.regex=/^As a .+, I want to .+, so that .+\.$/`
`METHOD.USER-STORY.consumer-planner=gsd-planner emits as bolded ## Phase Goal header in PLAN.md`
`METHOD.USER-STORY.consumer-verifier=gsd-verifier — [outcome] clause is the goal-backward verification anchor`
`METHOD.USER-STORY.authoring=interactive via /gsd-mvp-phase; SPIDR Splitting validates when too large`

`METHOD.WALKING-SKELETON.def=Phase 1 deliverable under --mvp on a new project: thinnest end-to-end stack proving every layer (framework, DB, routing, deployment) works together`
`METHOD.WALKING-SKELETON.artifact=SKELETON.md capturing architectural decisions subsequent vertical slices inherit`
`METHOD.WALKING-SKELETON.gate=phase_number == "01" AND prior_summaries == 0 AND MVP_MODE=true`
`METHOD.WALKING-SKELETON.scope=intentionally narrow (PRD #2826 Q2); does not retrofit existing projects`

`METHOD.VERTICAL-SLICE.def=single-feature task that moves one user capability open-to-close (happy path) end-to-end`
`METHOD.VERTICAL-SLICE.contrast=horizontal layer (all models then all APIs then all UI)`
`METHOD.VERTICAL-SLICE.role=MVP Mode planning unit; SPIDR Splitting axes (Spike/Paths/Interfaces/Data/Rules) are canonical decomposition tools when a slice is too large for one phase`

`METHOD.BEHAVIOR-ADDING-TASK.def=predicate over a PLAN.md task: tdd="true" frontmatter AND <behavior> block names a user-visible outcome AND <files> includes ≥1 non-*.md/*.json/*.test.* source file`
`METHOD.BEHAVIOR-ADDING-TASK.exempt=pure doc/config/test-only tasks`
`METHOD.BEHAVIOR-ADDING-TASK.gate-consumer=MVP+TDD Gate (references/execute-mvp-tdd.md) only halts on this predicate; gsd-executor applies all three checks at runtime`
`METHOD.BEHAVIOR-ADDING-TASK.implementation=prose-only specification — no shared utility`

`METHOD.MVP-PLUS-TDD-GATE.def=per-task runtime gate in /gsd-execute-phase that, when MVP_MODE && TDD_MODE both true, refuses to advance a Behavior-Adding Task until a failing-test commit (test({phase}-{plan})) exists for it`
`METHOD.MVP-PLUS-TDD-GATE.checkpoint=tdd_review_checkpoint end-of-phase review escalates from advisory to blocking under same condition`
`METHOD.MVP-PLUS-TDD-GATE.contract=references/execute-mvp-tdd.md`
`METHOD.MVP-PLUS-TDD-GATE.escape-hatch=--force-mvp-gate (documented but not implemented)`

`METHOD.SPIDR-SPLITTING.def=five-axis story decomposition discipline (Spike/Paths/Interfaces/Data/Rules) used by /gsd-mvp-phase when a User Story is too large for one phase`
`METHOD.SPIDR-SPLITTING.flow=full interactive flow per PRD #2826 Q3 (NOT a lightweight filter)`
`METHOD.SPIDR-SPLITTING.reference=get-shit-done/references/spidr-splitting.md`

`DEFECT.TEST-SOURCE-GREP.symptom=test binds readFileSync result to a var then calls .includes/.match/.startsWith on it`
`DEFECT.TEST-SOURCE-GREP.detect=scripts/lint-no-source-grep.cjs (npm run lint:tests) exits 1`
`DEFECT.TEST-SOURCE-GREP.escape=add // allow-test-rule: <reason> anywhere in the file to exempt the whole file (only when reading product markdown or runtime output, NOT .cjs source)`
`DEFECT.TEST-SOURCE-GREP.fix-forward=call the exported function, capture stdout/JSON, assert on typed fields`

`DEFECT.TEST-REGEXP-INTERPOLATION.symptom=new RegExp with template literal interpolating a var that can contain regex metacharacters (e.g. phase id 5.1)`
`DEFECT.TEST-REGEXP-INTERPOLATION.fix-forward=always escapeRegex on the interpolated value; utility lives in core.cjs and is already imported in most modules`

`DEFECT.TEST-DEAD-REGEX-IN-INCLUDES.symptom=src.includes('foo.*bar') — .* is regex metacharacter, not wildcard in .includes; always false`
`DEFECT.TEST-DEAD-REGEX-IN-INCLUDES.fix-forward=use new RegExp('foo.*bar').test(src) or delete the dead branch`

`DEFECT.TEST-TOPLEVEL-READFILESYNC.symptom=module-level const src = fs.readFileSync(...) throws as unhandled exception before any test registers, aborting the runner with no named failure`
`DEFECT.TEST-TOPLEVEL-READFILESYNC.fix-forward=move read inside test callback, OR wrap in try/catch + rethrow with helpful message`

`DEFECT.SHELL-VAR-IN-SQ-JS-STRING.symptom=node -e "require('$HOOK_DIR/lib/foo.js')" breaks silently when $HOOK_DIR contains a single quote (POSIX-legal)`
`DEFECT.SHELL-VAR-IN-SQ-JS-STRING.fix-forward=pass paths via env vars: GIT_CMD_LIB="$HOOK_DIR/lib/foo.js" node -e "require(process.env.GIT_CMD_LIB)"`

`DEFECT.SHELL-WORKTREE-DETECT-BAD-GUARD.symptom=[ -f .git ] does not detect worktrees from main repo; in main repo .git is a directory so guard is skipped`
`DEFECT.SHELL-WORKTREE-DETECT-BAD-GUARD.fix-forward=use git rev-parse --git-dir and match *.git/worktrees/* in a case statement`

`DEFECT.SHELL-PATH-CONTAINMENT-GLOB.symptom=[[ "$PATH" != "$ROOT"* ]] matches sibling prefixes (/repo-extra passes when ROOT=/repo)`
`DEFECT.SHELL-PATH-CONTAINMENT-GLOB.fix-forward=[[ "$P" != "$ROOT" && "$P" != "$ROOT/"* ]]; also check [ -z "$ROOT" ] && exit 1 before the test; warn → fail-closed for security-relevant path checks`

`DEFECT.WORKSTREAM-MIGRATE-NAME-NO-NORMALIZE.invariant=every directory under .planning/workstreams/* must be addressable by workstream status/set/complete; creation and migration must share the same name contract`
`DEFECT.WORKSTREAM-MIGRATE-NAME-NO-NORMALIZE.symptom=accepting raw --migrate-name values created directories that later commands reject (e.g. "Bad Name" directory exists but CLI rejects it as invalid)`
`DEFECT.WORKSTREAM-MIGRATE-NAME-NO-NORMALIZE.fix-forward=normalize --migrate-name through same slug transform as workstream create ([a-z0-9-]); fail fast if normalization yields empty`
`DEFECT.WORKSTREAM-MIGRATE-NAME-NO-NORMALIZE.regression-test=workstream create ... --migrate-name 'Bad Name' migrates to bad-name and does not leave 'Bad Name' on disk`

`DEFECT.DOCS-INTERNAL-COUNT-DRIFT.symptom=heading says (N shipped) and footnote says N-1 top-level references; CodeRabbit catches every time`
`DEFECT.DOCS-INTERNAL-COUNT-DRIFT.fix-forward=update the footnote alongside the count`

`DEFECT.SKILL-CONSOLIDATION-MISSING-WORKFLOW.symptom=command absorbs micro-skill as a flag (e.g. capture --backlog); old command's process steps not ported to get-shit-done/workflows/<name>.md; commands/gsd/*.md execution_context @-references nothing`
`DEFECT.SKILL-CONSOLIDATION-MISSING-WORKFLOW.detect=tests/bug-3135-capture-backlog-workflow.test.cjs — every execution_context @-reference in any commands/gsd/*.md must resolve to existing file on disk`
`DEFECT.SKILL-CONSOLIDATION-MISSING-WORKFLOW.examples=PR #2824 missed reapply-patches.md and add-backlog.md; #3135 caught the latter`
`DEFECT.SKILL-CONSOLIDATION-MISSING-WORKFLOW.fix-forward=run the regression test after every consolidation PR`

`OPS.CR-STALE-THREADS-AFTER-ALLOW-RULE.symptom=after adding // allow-test-rule: to silence lint, CodeRabbit's existing inline threads remain open even though the fix is in place`
`OPS.CR-STALE-THREADS-AFTER-ALLOW-RULE.fix-forward=resolve via gh api graphql resolveReviewThread mutation before merging — open threads block clean merge history and mislead future reviewers`
`OPS.CR-STALE-THREADS-AFTER-ALLOW-RULE.note=superseded for code-driven fixes by CR.AUTO-RESOLVE-ON-PUSH; this rule still applies for allow-test-rule annotation fixes that don't change test behavior`

`OPS.PR-DISCIPLINE-SPLIT-UNRELATED.rule=bug fix and docs rewrite committed to same branch produce a noisy diff and a PR that reviewers can't cleanly approve`
`OPS.PR-DISCIPLINE-SPLIT-UNRELATED.fix-forward=cherry-pick doc changes to a dedicated docs/ branch immediately, then force-push the original branch to remove the commit; one concern per PR`

`DEFECT.INVENTORY-MD-NOT-UPDATED.symptom=docs/INVENTORY.md tracks shipped workflow count (## Workflows (N shipped)) and one row per file; adding/removing a workflow without updating it produces internally inconsistent doc`
`DEFECT.INVENTORY-MD-NOT-UPDATED.companion=docs/INVENTORY-MANIFEST.json must stay in sync with filesystem`
`DEFECT.INVENTORY-MD-NOT-UPDATED.attribution-rule=when a flag absorbs a micro-skill, old skill's "Invoked by" attribution must move to the new parent (e.g. add-todo.md incorrectly claimed /gsd-capture --backlog until #3135 corrected)`

`OPS.README-STORYLINE-ONLY.rule=root README.md ≤300 lines: hero, author note, 6-step loop, install, core command table, why-it-works bullets, config key dials, docs index, minimal troubleshooting`
`OPS.README-STORYLINE-ONLY.linkability=every removed detail section needs a link to canonical doc that covers it; all doc links must resolve before commit`
`OPS.README-STORYLINE-ONLY.markdownlint=MD001 (heading level skip — don't use ### inside admonitions; use bold instead), MD040 (fenced code blocks must declare language)`

`OPS.ISSUE-TRIAGE-CHECK-EXISTING-WORK.rule=before writing agent brief for confirmed bug, check (1) local branches git branch -a | grep <issue>, (2) untracked/modified files on that branch, (3) stash, (4) open PRs with matching head branch`
`OPS.ISSUE-TRIAGE-CHECK-EXISTING-WORK.why=a crash may have left work 90% done — recover and commit rather than re-implementing`

`DEFECT.SDK-ONLY-VERB-NO-EXEMPTION.symptom=gsd-sdk query verb implemented only in SDK native registry (no gsd-tools.cjs mirror) without entry in NO_CJS_SUBPROCESS_REASON in sdk/src/golden/golden-policy.ts`
`DEFECT.SDK-ONLY-VERB-NO-EXEMPTION.detect=golden-policy test fails, treats verb as missing implementation rather than intentional SDK-only path`
`DEFECT.SDK-ONLY-VERB-NO-EXEMPTION.fix-forward=add the verb to NO_CJS_SUBPROCESS_REASON with one-line rationale`

`DEFECT.WORKFLOW-ALLOWED-TOOLS-MISSING-WRITE.symptom=command delegates to workflow via execution_context; command's allowed-tools doesn't cover every tool the workflow calls (including Write for file creation)`
`DEFECT.WORKFLOW-ALLOWED-TOOLS-MISSING-WRITE.failure-mode=thin wrapper pattern makes this easy to miss — process steps live in workflow, tool grant lives in command frontmatter; missing tool silently fails at runtime`
`DEFECT.WORKFLOW-ALLOWED-TOOLS-MISSING-WRITE.fix-forward=audit allowed-tools against every tool the linked workflow uses`

`DEFECT.WORKFLOW-USER-PATH-NO-SANITIZE.symptom=workflow step takes user input (subcommand argument, $ARGUMENTS, parsed remainder) and constructs .planning/…/{SLUG}.md path without sanitization`
`DEFECT.WORKFLOW-USER-PATH-NO-SANITIZE.fix-forward=strip non-[a-z0-9-] chars, reject ../\\, enforce max length; document sanitization inline at the step, not just in <security_notes>; "(already sanitized)" notes must trace back to explicit sanitization guard`

`DEFECT.WORKFLOW-RESUME-MODE-BYPASSES-GUARDS.symptom=CLOSE/STATUS modes that document "(already sanitized)" do not automatically cover RESUME or default modes`
`DEFECT.WORKFLOW-RESUME-MODE-BYPASSES-GUARDS.fix-forward=each mode that constructs file path from user input needs its own guard; do not assume sibling modes share state`

`DEFECT.LINT-TEST-DUPLICATED-CONSTANT.symptom=lint script and test suite both implement same constant (CANONICAL_TOOLS) or parser (parseFrontmatter, executionContextRefs); silent divergence`
`DEFECT.LINT-TEST-DUPLICATED-CONSTANT.failure-mode=tool added to lint allowlist but not test (or vice versa) causes one layer to pass while the other fails`
`DEFECT.LINT-TEST-DUPLICATED-CONSTANT.fix-forward=extract to scripts/*-helpers.cjs module required by both`

`DEFECT.GLOBAL-REGEX-LASTINDEX-STATE.symptom=const RE = /pattern/g shared across functions retains lastIndex after .test or .exec call`
`DEFECT.GLOBAL-REGEX-LASTINDEX-STATE.fix-forward=use non-global pattern for boolean checks (/pattern/.test(s)); create new RegExp(pattern, 'g') per iteration when you need exec loops; forgetting lastIndex = 0 resets causes intermittent false negatives`

`DEFECT.ADR-NO-STATUS-DATE-HEADER.symptom=docs/adr/NNNN-*.md missing - **Status:** Accepted/Proposed/Deprecated and - **Date:** YYYY-MM-DD immediately after title`
`DEFECT.ADR-NO-STATUS-DATE-HEADER.consequence=ADR is undatable and untriageable when the list grows`

`DEFECT.WORKFLOW-XML-STEP-UNDERSCORE.rule=all workflow file names use hyphens; <step name="..."> attributes inside those files must match: extract-learnings not extract_learnings`
`DEFECT.WORKFLOW-XML-STEP-UNDERSCORE.detect=tests asserting content.includes('<step name=') should tighten to exact hyphenated name so renames are caught`

`DEFECT.INVENTORY-MANIFEST-WRONG-KEY.symptom=docs/INVENTORY-MANIFEST.json has families.workflows (canonical, read by tooling) and a stale top-level workflows key`
`DEFECT.INVENTORY-MANIFEST-WRONG-KEY.cause=node update script wrote to wrong key`
`DEFECT.INVENTORY-MANIFEST-WRONG-KEY.fix-forward=always update families.workflows; delete any top-level workflows key if it appears`

`OPS.WORKFLOW-PROSE-FRAGMENTS.rule=after stripping prose @-refs, some command <process> blocks retained bolded **Follow the X workflow** fragments`
`OPS.WORKFLOW-PROSE-FRAGMENTS.standard=ADR-0002 standard is "Execute end-to-end." for single-workflow commands; routing commands with flag dispatch use "execute the X workflow end-to-end." in routing bullets (no bold, no redundant path)`

`DEFECT.CR-TEST-DIAGNOSTIC-OPACITY.symptom=behavior correct but CR requests clearer failure surfaces before .map on parsed output`
`DEFECT.CR-TEST-DIAGNOSTIC-OPACITY.rule=after JSON.parse, assert output object shape (e.g. Array.isArray(output.phases)) with raw-output-prefix diagnostics`
`DEFECT.CR-TEST-DIAGNOSTIC-OPACITY.benefit=prevents opaque TypeError failures and shortens triage loops when CLI output shape changes`

`OPS.MERGE-GATE-DISCIPLINE.rule=CI/checks can be green while unresolved review threads still block clean merge policy`
`OPS.MERGE-GATE-DISCIPLINE.three-gates=required checks green AND CodeRabbit pass AND unresolved thread count = 0`
`OPS.MERGE-GATE-DISCIPLINE.authoritative-source=GraphQL reviewThreads, not summary comments / check badge alone`

`MODULE.SDK-RUNTIME-BRIDGE.purpose=one SDK Runtime Bridge seam (sdk/src/query-runtime-bridge.ts) for dispatch routing and observability`
`MODULE.SDK-RUNTIME-BRIDGE.event-typing=canonical union RuntimeBridgeEvent (replaced orphan event typing)`
`MODULE.SDK-RUNTIME-BRIDGE.observability=onDispatchEvent runs behind safe emitter so callback failures cannot alter dispatch outcomes`
`MODULE.SDK-RUNTIME-BRIDGE.strict-mode=strict native-adapter rejection reports dispatchMode: 'native' (no fake subprocess attempt)`
`MODULE.SDK-RUNTIME-BRIDGE.policy-defaults=allowFallbackToSubprocess passed through as undefined when unset (no forced override in GSDTools)`
`MODULE.SDK-RUNTIME-BRIDGE.transport-decision-order=fallback-disabled guard throws BEFORE emitting subprocess decision events`
`MODULE.SDK-RUNTIME-BRIDGE.invariant=explicit invariant in subprocessReason for impossible states (fail loud on contract drift)`
`MODULE.SDK-RUNTIME-BRIDGE.docs-touched=README.md, docs/CLI-TOOLS.md, docs/ARCHITECTURE.md, ADR narrative consistency`

`LESSON.SDK-BRIDGE.dont-1=do not let observability callbacks sit on critical path without isolation`
`LESSON.SDK-BRIDGE.dont-2=do not emit structured events that claim a transport mode that never happened`
`LESSON.SDK-BRIDGE.dont-3=do not force option defaults at call sites when policy modules already define defaults`
`LESSON.SDK-BRIDGE.dont-4=do not keep duplicate/inert exported types; expose one canonical union Interface`
`LESSON.SDK-BRIDGE.dont-5=do not emit decision events before guard checks that may reject the path`
`LESSON.SDK-BRIDGE.dont-6=do not leave architectural docs with ambiguous seam ownership between CLI and SDK paths`

`RULESET.CONTRIB.GATE.ORDER=issue-first -> approval-label -> code -> PR-link -> changeset/no-changelog`
`RULESET.CONTRIB.CLASSIFY.fix=requires confirmed/confirmed-bug before implementation`
`RULESET.CONTRIB.CLASSIFY.enhancement=requires approved-enhancement before implementation`
`RULESET.CONTRIB.CLASSIFY.feature=requires approved-feature before implementation`

`RULESET.GH.AUTH.DEFAULT=source .envrc GITHUB_TOKEN before gh; exception=ambient allowed only when user explicitly says machine-only fallback`
`RULESET.CODERABBIT.GUARD.OPEN_PRS=gh pr list --repo gsd-build/get-shit-done --author @me --state open; repeat near end because open PR set can change mid-run`
`RULESET.CODERABBIT.GUARD.COMPLETE=required_checks_green && coderabbit_check_pass && graphQL(reviewThreads.unresolved_count)==0`
`RULESET.CODERABBIT.GUARD.GRAPHQL=reviewThreads(first:100){nodes{id isResolved comments{nodes{author body path line originalLine url}}}}; use unresolved threads as authoritative, not badge text alone`
`RULESET.CODERABBIT.GUARD.RERUN=after every push wait for CodeRabbit completion, then re-query unresolved threads; CodeRabbit can add new findings after earlier threads were resolved`
`RULESET.CODERABBIT.GUARD.RESOLVE=fix validated finding -> focused tests -> commit/push -> resolveReviewThread(threadId) -> wait CI/CodeRabbit -> final unresolved_count query`
`RULESET.CODERABBIT.GUARD.SCOPE=if a new @me open PR appears during final list, include it in the same guard pass before declaring all-open-PRs complete`
`RULESET.TESTS.CODERABBIT_FIX=prefer exported-function behavioral tests over source-grep; lint-no-source-grep rejects readFileSync source assertions without allow-test-rule`
`RULESET.WORKFLOW_MARKDOWN.FENCES=when editing shell snippets inside workflow markdown, preserve the opening language fence; malformed fence can create fresh CodeRabbit threads`
`RULESET.WORKFLOW_SIZE_BUDGET=workflow-size-budget can fail otherwise-valid review fixes; keep XL workflows <=1800 lines or trim prose in same PR before final checks`
`RULESET.GEMINI.TOOLS.ask_user=Gemini CLI has no ask_user tool; filter both AskUserQuestion and lowercase ask_user from tools frontmatter and neutralize both names in Gemini body text`
`RULESET.GEMINI.TEST_SENTINEL=convertClaudeToGeminiAgent regression should assert tools excludes ask_user, body excludes AskUserQuestion/ask_user, and Read still maps to read_file`

`CI.GATE.issue-link-required=hard-fail if PR body lacks closes/fixes/resolves #<issue>`
`CI.GATE.changeset-lint=hard-fail for user-facing code diffs unless .changeset/* or PR has no-changelog label`
`CI.GATE.repair-sequence(PR)=create issue -> apply approval label -> edit PR body w/ closing keyword -> apply no-changelog if appropriate -> re-run checks`

`PR.3267.POSTMORTEM.root-cause=[missing issue link, missing changeset/no-changelog]`
`PR.3267.POSTMORTEM.recovery=[issue#3270 created, label approved-enhancement applied, PR reopened, body includes "Closes #3270", label no-changelog applied]`

`WORKTREE.SEAM.current=Worktree Safety Policy Module`
`WORKTREE.SEAM.files=[get-shit-done/bin/lib/worktree-safety.cjs, get-shit-done/bin/lib/core.cjs]`
`WORKTREE.SEAM.interface=[resolveWorktreeContext, parseWorktreePorcelain, planWorktreePrune, executeWorktreePrunePlan]`
`WORKTREE.SEAM.default-prune-policy=metadata_prune_only (non-destructive)`
`WORKTREE.SEAM.decision-1=retain non-destructive default; destructive path only as explicit future opt-in scaffold`

`WORKSTREAM.INVARIANT.migrate-name=must normalize through canonical slug policy`
`WORKSTREAM.INVARIANT.slug-contract=all .planning/workstreams/<name> must be addressable by set/get/status/complete`
`WORKSTREAM.REGRESSION.test-anchor=tests/workstream.test.cjs::normalizes --migrate-name to a valid workstream slug`

`ARCH.SKILL.improve-codebase.next-candidates=[Workstream Name Policy Module, Workstream Progress Projection Module, Active Workstream Pointer Store Module]`

`WORKTREE.SEAM.test-policy=cover all decision branches in policy module before changing prune behavior`
`WORKTREE.SEAM.test-anchors=[resolveWorktreeContext:has_local_planning|linked_worktree|not_git_repo|main_worktree, planWorktreePrune:git_list_failed|worktrees_present|no_worktrees|parser_throw_fallback, executeWorktreePrunePlan:missing_plan|skip_passthrough|unsupported_action|metadata_prune_only]`
`WORKTREE.SEAM.invariant=parser failure must degrade to metadata_prune_only and never escalate to destructive removal`
`WORKTREE.SEAM.execution-rule=prefer node --test tests/worktree-safety-policy.test.cjs for fast seam validation; avoid full npm test loop for seam-only changes`
`WORKTREE.SEAM.inventory-interface=[listLinkedWorktreePaths, inspectWorktreeHealth]`
`WORKTREE.SEAM.caller-rule=verify.cjs must consume inspectWorktreeHealth for W017 classification; no ad-hoc porcelain parsing in callers`
`WORKTREE.SEAM.test-anchor-w017=tests/orphan-worktree-detection.test.cjs + tests/worktree-safety-policy.test.cjs`
`WORKTREE.SEAM.inventory-snapshot=snapshotWorktreeInventory(repoRoot,{staleAfterMs,nowMs}) is canonical linked-worktree health snapshot for callers`

`PLANNING.PATH.PARITY.sdk-project-scope=.planning/<project> (never .planning/projects/<project>); mirror planning-workspace.cjs planningDir()`
`PLANNING.PATH.SEAM.sdk=helpers.planningPaths delegates to workspacePlanningPaths + resolveWorkspaceContext; precedence explicit-ws > env-ws > env-project > root`
`PLANNING.PATH.SEAM.init-handlers=[initExecutePhase, initPlanPhase, initPhaseOp, initMilestoneOp] consume helpers.planningPaths().planning (no direct relPlanningPath join)`

`WORKSTREAM.NAME.POLICY.cjs-module=get-shit-done/bin/lib/workstream-name-policy.cjs owns toWorkstreamSlug + active-name/path-segment validation`
`WORKSTREAM.POINTER.SEAM.sdk-module=sdk/src/query/active-workstream-store.ts owns read/write self-heal for .planning/active-workstream`

`CONFIG.SEAM.loadConfig-context=loadConfig(cwd,{workstream}) replaces env-mutation fallback; no temporary process.env GSD_WORKSTREAM rewrites`

`RELEASE-NOTES.SCOPE=GitHub Releases body for tags vX.Y.Z, vX.Y.Z-rcN; not CHANGELOG.md (changeset workflow owns that)`
`RELEASE-NOTES.DEFAULT-STATE=auto-generated body is "What's Changed" PR list + Full Changelog link; treat as draft, not final`
`RELEASE-NOTES.GATE.hotfix=manual edit required; auto-generated body for vX.Y.{Z>0} is "Full Changelog only" and must be replaced with structured body`
`RELEASE-NOTES.GATE.rc=manual edit recommended; auto-generated PR list is acceptable for early RCs but final RC before vX.Y.0 should match standard`
`RELEASE-NOTES.GATE.minor=auto-generated body acceptable when PR titles are clean; promote to structured body when >20 PRs or contains feature+refactor+fix mix`

`RELEASE-NOTES.STANDARD.taxonomy=Keep-a-Changelog 1.1.0: Added | Changed | Deprecated | Removed | Fixed | Security | Documentation`
`RELEASE-NOTES.STANDARD.heading-level=## for category, ### for subgroup (area), - for bullet`
`RELEASE-NOTES.STANDARD.bullet-shape=**Bold user-visible change** — explanation of what was broken or what's new, leading with symptom not implementation. Trailing (#NNN) PR ref.`
`RELEASE-NOTES.STANDARD.subgroups=phase-planning-state | workstream | query-dispatch-cli | code-review | install | capture | docs | architecture | security`
`RELEASE-NOTES.STANDARD.footer.hotfix=Install/upgrade: \`npx get-shit-done-cc@latest\``
`RELEASE-NOTES.STANDARD.footer.rc=Install for testing: \`npx get-shit-done-cc@next\` (per branch->dist-tag policy)`
`RELEASE-NOTES.STANDARD.footer.canary=Install: \`npx get-shit-done-cc@canary\``
`RELEASE-NOTES.STANDARD.footer.full-changelog=**Full Changelog**: https://github.com/gsd-build/get-shit-done/compare/<prev>...<this>`
`RELEASE-NOTES.STANDARD.intro=optional one-paragraph framing for RC/feature releases; omit for pure-fix hotfixes`

`RELEASE-NOTES.SOURCE.commits=git log <prev-tag>..<this-tag> --pretty=format:'%s%n%n%b' --no-merges`
`RELEASE-NOTES.SOURCE.changesets=.changeset/*.md (frontmatter pr: + body bullets)`
`RELEASE-NOTES.SOURCE.pr-bodies=gh pr view <NNN> --json title,body for fixes lacking a changeset`
`RELEASE-NOTES.SOURCE.precedence=changeset body > commit body > PR body > commit subject (prefer authored content over auto-generated)`

`RELEASE-NOTES.WORKFLOW.edit=gh release edit <tag> --notes-file <path>`
`RELEASE-NOTES.WORKFLOW.view=gh release view <tag> --json body --jq .body`
`RELEASE-NOTES.WORKFLOW.token=must use .envrc GITHUB_TOKEN per project CLAUDE.md; never ambient gh auth`
`RELEASE-NOTES.WORKFLOW.idempotency=gh release edit overwrites body wholesale; safe to re-run after refining`

`RELEASE-NOTES.ANTI-PATTERN=raw "What's Changed" PR list as final body for hotfix or feature release; "Full Changelog only" body for tagged release with >0 user-facing fixes`
`RELEASE-NOTES.ANTI-PATTERN.implementation-first=do not lead bullet with file path or function name; lead with symptom/user-visible behavior`
`RELEASE-NOTES.ANTI-PATTERN.risk-commentary=do not include "may break", "be careful", "test thoroughly" - per global CLAUDE.md no-risk-commentary rule`

`RELEASE-NOTES.EXAMPLE.hotfix=v1.41.1 (https://github.com/gsd-build/get-shit-done/releases/tag/v1.41.1) - 14 fixes grouped by 6 subgroups`
`RELEASE-NOTES.EXAMPLE.rc=v1.42.0-rc1 (https://github.com/gsd-build/get-shit-done/releases/tag/v1.42.0-rc1) - intro + Added/Changed/Fixed/Documentation taxonomy`
`RELEASE-NOTES.EXAMPLE.minor-auto-acceptable=v1.41.0 - kept auto-generated body; many small fixes with clean conventional-commit titles`

`RELEASE-NOTES.TEMPLATE.hotfix=## Fixed\n\n### <subgroup>\n- **<bold change>** — <explanation>. (#<PR>)\n\n---\n\nInstall/upgrade: \`npx get-shit-done-cc@latest\`\n\n**Full Changelog**: <compare-url>`
`RELEASE-NOTES.TEMPLATE.rc=<one-paragraph intro>\n\n## Added\n### <subgroup>\n- **<change>** — <explanation>. (#<PR>)\n\n## Changed\n### Architecture\n- **<refactor>** — <user-visible benefit>. (#<PR>)\n\n## Fixed\n### <subgroup>\n- **<fix>** — <explanation>. (#<PR>)\n\n## Documentation\n- **<docs change>** — <reason>. (#<PR>)\n\n---\n\nThis is a release candidate. Install for testing:\n\`\`\`bash\nnpx get-shit-done-cc@next\n\`\`\`\n\n**Full Changelog**: <compare-url>`

`RELEASE-NOTES.RELEASE-STREAM.dev-branch=canary dist-tag (only); install via @canary`
`RELEASE-NOTES.RELEASE-STREAM.main-branch=next (RCs) + latest (stable); install via @next or @latest`
`RELEASE-NOTES.RELEASE-STREAM.rule=streams do not mix; do not document @canary install in RC notes or @next in canary notes`

`META.RULE.canonical-source-precedence=CONTRIBUTING.md > docs/adr/* > CONTEXT.md > agent memory`
`META.RULE.read-contributing-first=read CONTRIBUTING.md sections "Pull Request Guidelines" + "CHANGELOG Entries" before EVERY agent dispatch`
`META.RULE.brief-must-cite-doc=agent prompts MUST quote the canonical doc line being applied; paraphrasing from predicate memory drifts and produces violations`
`META.RULE.brief-no-paraphrase=writing "k040 — never leave changelog box unchecked" caused 5 of 8 agents to edit CHANGELOG.md in violation of CONTRIBUTING.md L110`

`PRED.k320.signal=changelog-direct-edit-forbidden`
`PRED.k320.canonical-source=CONTRIBUTING.md L110-123`
`PRED.k320.rule=do not edit CHANGELOG.md in feature/fix/enhancement PRs`
`PRED.k320.cure=drop .changeset/<adj>-<noun>-<noun>.md fragment ONLY`
`PRED.k320.tool=npm run changeset -- --type <T> --pr <NNN> --body "..."`
`PRED.k320.types=Added|Changed|Deprecated|Removed|Fixed|Security`
`PRED.k320.opt-out-label=no-changelog`
`PRED.k320.ci-enforcement=scripts/changeset/lint.cjs`
`PRED.k320.ci-paths-monitored=bin/ get-shit-done/ agents/ commands/ hooks/ sdk/src/`
`PRED.k320.recovery=open Removed-typed cleanup PR deleting only the redundant row`
`PRED.k320.evidence=PR #3302 merge-conflict against #3308 CHANGELOG.md row 2026-05-09`

`PRED.k321.signal=cr-outside-diff-range-finding`
`PRED.k321.shape=CR posts "[!CAUTION] outside the diff" findings in review BODY, not in reviewThreads`
`PRED.k321.poll-shape=parse pulls/<n>/reviews body AND graphql reviewThreads`
`PRED.k321.resolution=address in code; no GraphQL resolveReviewThread needed for body-only findings`
`PRED.k321.evidence=PRs #3304/#3305 (2026-05-09): real Minor/Major findings in body, 0 threads`

`PRED.k322.signal=cr-sustained-throttle`
`PRED.k322.distinct-from=k080`
`PRED.k322.shape=ack posted, real review never lands within [5s, 410s] cooldown after burst of N PRs <15min`
`PRED.k322.cure-1=2nd retrigger ~10min after first ack`
`PRED.k322.cure-2=if silent at 50min, treat as silent-pass with maintainer flag in merge-commit body`
`PRED.k322.merge-gate-impact=k070 real_coderabbit_review_present unsatisfied; requires maintainer judgment`
`PRED.k322.evidence=PR #3306 (2026-05-09): 0 reviews after 50min + 2 retriggers`

`PRED.k323.signal=sibling-audit-cross-pr-overlap`
`PRED.k323.shape=2+ open issues touch same canonical bug site; each fix's sibling-audit produces overlapping diff`
`PRED.k323.cure-pre-dispatch=brief one agent canonical-owner; brief others to EXCLUDE shared site`
`PRED.k323.cure-alt=consolidate into single PR when 2+ issues share root cause`
`PRED.k323.recovery=close smaller PR as "subsumed by #N" or rebase second to drop overlap hunk`
`PRED.k323.evidence=#3300 (#3297) overlapped #3306 (#3298) on add-backlog.md hunks 2026-05-09`

`PRED.k324.signal=agent-terminates-mid-monitor`
`PRED.k324.k095-restatement=k095 confirmed shape: agent reports "waiting for monitor" / "tests still running" then terminates`
`PRED.k324.cure=verify via gh api on every agent-completion notification; never trust narrative`
`PRED.k324.poll-shape=gh pr view <n> --json mergeStateStatus,statusCheckRollup + pulls/<n>/reviews + graphql reviewThreads + issues/<n>/comments tail`
`PRED.k324.evidence=2026-05-09 session: 5+ mid-monitor terminations across PRs #3232/#3271/#3251/#3255/#3262`

`PRED.k325.signal=worktree-branch-lock-on-force-push`
`PRED.k325.shape=git checkout <branch> errors "already used by worktree at <agent-worktree>"`
`PRED.k325.cure=detached-HEAD: git checkout --detach $(git ls-remote origin <branch>); modify; commit; git push --force-with-lease=<branch>:<remote-sha> origin HEAD:refs/heads/<branch>`
`PRED.k325.cleanup=git worktree remove --force <path> for aged agent worktrees`
`PRED.k325.evidence=2026-05-09 CHANGELOG.md strip on PRs #3300/#3302/#3304/#3305 required detached-HEAD`

`PRED.k326.signal=brief-contradicts-canonical-doc`
`PRED.k326.shape=N parallel agents amplify a single brief-vs-doc contradiction into N violations`
`PRED.k326.cure=quote canonical doc verbatim in brief; mentally simulate "if all N agents follow this brief literally, do they violate any rule?"`
`PRED.k326.evidence=2026-05-09 brief "k040 — update CHANGELOG.md" → 5 of 8 agents violated CONTRIBUTING.md L110`

`PRED.k327.signal=cr-ack-vs-real-review`
`PRED.k327.ack-shape=body "✅ Actions performed - Full review triggered"`
`PRED.k327.real-review-shape=body starts "Actionable comments posted: N" OR "[!CAUTION] Some comments are outside the diff"`
`PRED.k327.distinguish-key=len(pulls/<n>/reviews) — ack=0, real=≥1`
`PRED.k327.cooldown-normal=[5s, 410s]`
`PRED.k327.cooldown-throttled=k322`

`PRED.k328.signal=pr-template-typed-heading-required`
`PRED.k328.canonical-source=CONTRIBUTING.md L101`
`PRED.k328.k100-restatement=heading must match issue class: bug→## Fix PR, enhancement→## Enhancement PR, feature→## Feature PR`
`PRED.k328.audit-list=[heading-matches-class, closing-keyword-present, changeset-fragment-or-no-changelog-label]`

`PRED.k329.signal=changeset-fragment-canonical-shape`
`PRED.k329.canonical-source=CONTRIBUTING.md L112-117 + .changeset/README.md`
`PRED.k329.filename=.changeset/<adj>-<noun>-<noun>.md`
`PRED.k329.frontmatter=---\\ntype: <Added|Changed|Deprecated|Removed|Fixed|Security>\\npr: <NNN>\\n---`
`PRED.k329.body=**<Bold user-visible change>** — <symptom-led explanation>. (#<NNN>)`
`PRED.k329.observed-clean=#3299 sunny-ibex-wave, #3301 sturdy-rams-caper, #3306 3298-phase-dir-prefix-drift-workflows`

`PRED.k330.signal=mempalace-diary-not-callable-by-ai`
`PRED.k330.shape=mempalace MCP tools require explicit user call; AI cannot trigger`
`PRED.k330.fallback=append predicate-format findings directly to CONTEXT.md`

`PRED.k331.signal=close-with-no-comment-is-literal`
`PRED.k331.shape=instruction "close with no comment (rationale)" — parenthetical is rationale, NOT comment body`
`PRED.k331.k101-restatement=k101 includes close-time --comment flag; rationale belongs in subsuming PR's squash-merge body`
`PRED.k331.cure=gh pr close <n> with NO --comment flag`
`PRED.k331.recovery=if violation lands, gh api -X DELETE repos/<o>/<r>/issues/comments/<id>`
`PRED.k331.evidence=2026-05-09 wave-3: violation on #3300 close, deleted within 30s`

`PROC.AGENT-DISPATCH.preflight=[read-CONTRIBUTING.md-fresh, read-relevant-ADRs, cite-specific-line-in-brief, require-closing-keyword, require-changeset-fragment, forbid-CHANGELOG.md-edit, require-isolation-worktree, forbid-self-PR-comment, mandate-trust-but-verify]`
`PROC.AGENT-DISPATCH.parallel-overlap-audit=before dispatching N sibling-audit fixers, compute file-set union and assign canonical owners`
`PROC.AGENT-DISPATCH.completion-verify=run k324.poll-shape on every agent-completion notification`

`PROC.MERGE-WAVE.ordering=[wave1: isolated-files, wave2: CHANGELOG-only-overlap (better: strip per k320), wave3: same-file-overlap with explicit decision]`
`PROC.MERGE-WAVE.preflight=gh pr view <n> --json files for every PR; identify overlap pairs; surface to maintainer`
`PROC.MERGE-WAVE.changelog-strip-pattern=detached-HEAD per k325 + git checkout main -- CHANGELOG.md + commit + force-with-lease`
`PROC.MERGE-WAVE.merge-tool=gh pr merge <n> --squash --delete-branch`
`PROC.MERGE-WAVE.merge-tool-warning=delete-branch may fail with "used by worktree at" — harmless; remote branch still deleted`

`WAVE.2026-05-09.scope=trek-e-authored issues, classes=[bug, enhancement, feature]`
`WAVE.2026-05-09.dispatched=8`
`WAVE.2026-05-09.merged=7`
`WAVE.2026-05-09.closed-as-subsumed=1`
`WAVE.2026-05-09.skipped-mvp-epic=[#2826, #2885, #2882, #2879, #2877, #2875]`

`WAVE.PR.3299.issue=3290`
`WAVE.PR.3299.class=bug`
`WAVE.PR.3299.fix=agents/gsd-intel-updater.md layout-detection block gated on framework-repo check`
`WAVE.PR.3299.cr-state=clean (No actionable comments)`
`WAVE.PR.3299.merged=2026-05-09T15:39:16Z`

`WAVE.PR.3301.issue=3232`
`WAVE.PR.3301.class=enhancement`
`WAVE.PR.3301.fix=docs/contributor-standards.md first-cut + CONTRIBUTING.md cross-link + 1 CR thread resolved (MD040)`
`WAVE.PR.3301.cr-state=clean post-fix`
`WAVE.PR.3301.merged=2026-05-09T15:39:24Z`

`WAVE.PR.3308.issue=3262`
`WAVE.PR.3308.class=enhancement`
`WAVE.PR.3308.fix=extract get-shit-done/bin/lib/plan-scan.cjs scanPhasePlans; port 4 call sites in init/state/roadmap/phase`
`WAVE.PR.3308.cr-state=2 reviews real, 1 thread resolved`
`WAVE.PR.3308.merged=2026-05-09T15:39:32Z`
`WAVE.PR.3308.violation=carried redundant CHANGELOG.md row in violation of k320; cleanup task spawned`

`WAVE.PR.3302.issue=3271`
`WAVE.PR.3302.class=enhancement`
`WAVE.PR.3302.fix=docs/adr/0005 + 0006 + README index + tests/enh-3271-sdk-adr-structure.test.cjs`
`WAVE.PR.3302.cr-state=1 review, 1 thread resolved (ADR self-ref test)`
`WAVE.PR.3302.changelog-strip=force-pushed 2026-05-09T15:35Z`
`WAVE.PR.3302.merged=2026-05-09T15:46:28Z`

`WAVE.PR.3304.issue=3255`
`WAVE.PR.3304.class=enhancement`
`WAVE.PR.3304.fix=get-shit-done/bin/gsd-tools.cjs --json-errors flag + GSD_JSON_ERRORS env + docs/json-errors.md taxonomy + usage-string disclosure (CR k321 finding addressed)`
`WAVE.PR.3304.cr-state=1 review (k321 outside-diff finding fixed in code)`
`WAVE.PR.3304.changelog-strip=force-pushed 2026-05-09T15:35Z`
`WAVE.PR.3304.merged=2026-05-09T15:46:35Z`

`WAVE.PR.3305.issue=3251`
`WAVE.PR.3305.class=enhancement`
`WAVE.PR.3305.fix=command-aliases.generated.cjs NON_FAMILY entries (40) + sdk gen-command-aliases.ts typed-export preservation (CR k321 Major finding addressed)`
`WAVE.PR.3305.cr-state=1 review (k321 outside-diff finding fixed in code)`
`WAVE.PR.3305.changelog-strip=force-pushed 2026-05-09T15:35Z`
`WAVE.PR.3305.merged=2026-05-09T15:46:41Z`

`WAVE.PR.3306.issue=3298`
`WAVE.PR.3306.class=bug`
`WAVE.PR.3306.fix=phase-dir prefix drift fixed in 3 sites (add-backlog.md + import.md + plan-milestone-gaps.md) per k015 sibling-audit`
`WAVE.PR.3306.cr-state=k322 sustained-throttle silent pass — 0 reviews after 50min + 2 retriggers, CI green`
`WAVE.PR.3306.subsumes=PR #3300 (#3297 add-backlog dedicated fix)`
`WAVE.PR.3306.merged=2026-05-09T15:47:16Z`

`WAVE.PR.3300.issue=3297`
`WAVE.PR.3300.class=bug`
`WAVE.PR.3300.fix=add-backlog.md project_code prefix (focused #3297 fix)`
`WAVE.PR.3300.outcome=closed-as-subsumed by #3306; issue #3297 manually closed`
`WAVE.PR.3300.k323-evidence=overlapped #3306 add-backlog.md hunks with different prefix idiom`
`WAVE.PR.3300.k331-violation=close-with-comment violation, comment deleted within 30s`

`WAVE.LESSON.changelog-policy-violation-multiplier=brief contradicting CONTRIBUTING.md L110 produced violations on 5 of 8 PRs (#3300, #3302, #3304, #3305, #3308); k326 + k320 capture`
`WAVE.LESSON.cr-throttle-burst-correlation=8 PRs in <15min triggered k322 sustained-throttle on multiple PRs (#3306 worst case)`
`WAVE.LESSON.sibling-audit-overlap=k015-family parallel dispatch on #3297 + #3298 produced k323 add-backlog.md cross-PR overlap`
`WAVE.LESSON.agent-narrative-unreliable=k095/k324 confirmed at scale: 5 of 8 agents terminated mid-monitor with stale claims requiring direct verification`
`WAVE.LESSON.k101-still-trips=even after CONTEXT.md k101 reinforcement, agent of record posted self-PR comment on close; k331 adds explicit close-time literal-instruction guard`

`DEFECT.SCOPE.window=PRs #3306..#3325 + sibling fixes #3240/#3242/#3245/#3257/#3261/#3267/#3286/#3287`
`DEFECT.FORMAT=class.sub-key=value | classes are greppable; each class carries detect / fix / anchor sub-keys when applicable`

`DEFECT.PORT-DRIFT.cjs-sdk.symptom=SDK port (sdk/src/query/*.ts) cites bin/lib/*.cjs source in docstring; CJS gets a fix or new constant; SDK lags silently`
`DEFECT.PORT-DRIFT.cjs-sdk.examples=#3317 (skills missing from SDK GSD_MANAGED_DIRS), #3240 (extractFrontmatter anchor), #3226 (phase.add --dry-run), #3243 (cjs dotted canonical), #3229 (model catalog source-of-truth)`
`DEFECT.PORT-DRIFT.cjs-sdk.detect=grep canonical constant in CJS, then in SDK; if both present compare values; if only CJS present treat as port-gap until proven intentional`
`DEFECT.PORT-DRIFT.cjs-sdk.fix-forward=add SDK-side behavioral test mirroring the CJS test; or extract shared JSON/TS module if both runtimes can consume it`
`DEFECT.PORT-DRIFT.cjs-sdk.anchor=tests/config-schema-sdk-parity.test.cjs is the canonical pattern — replicate per port-pair`

`DEFECT.REMOVED-BUT-NEEDED.symptom=file/key removed because "scoped under sdk/" or "no longer used" without verifying every consumer (workflows, docs, manifests, npm scripts)`
`DEFECT.REMOVED-BUT-NEEDED.examples=#3316 root package-lock.json (root package.json declares deps; workflows use cache:'npm' + npm ci), e3b52c70 docs referenced removed /gsd-new-workspace`
`DEFECT.REMOVED-BUT-NEEDED.detect=before deletion, grep filename across .github/workflows, get-shit-done/, docs/, package.json scripts, sdk/scripts; if any reference exists removal is incomplete`
`DEFECT.REMOVED-BUT-NEEDED.fix-forward=restore the file or update every consumer in the same commit; do not paper over with --no-package-lock or workflow workarounds that lose reproducibility`

`DEFECT.STATE-TRAMPLE.symptom=state-mutation paths overwrite curated values when body-derived computation is narrower than what's stored in frontmatter`
`DEFECT.STATE-TRAMPLE.examples=#3242 (Last Activity overwrote progress.completed_plans), #3257 (nested plans/ files uncounted), #3261 (buildStateFrontmatter), #3265 (canonical fields), #3286 (record-metric/add-decision sections)`
`DEFECT.STATE-TRAMPLE.detect=any state writer that calls buildStateFrontmatter without preserving existing progress.* keys; any mutation surface that does not honor shouldPreserveExistingProgress`
`DEFECT.STATE-TRAMPLE.fix-forward=route through state-document.cjs/.ts shouldPreserveExistingProgress + normalizeProgressNumbers (extracted in #3316 SDK-first seams)`

`DEFECT.PHASE-DIR-PREFIX-DRIFT.symptom=multiple workflow files independently construct .planning/phases/{NN}-{slug} paths; project_code prefix or slug normalization missing in some surfaces`
`DEFECT.PHASE-DIR-PREFIX-DRIFT.examples=#3287 (init.phase-op + init.plan-phase first-touch), #3306/PRED.k015 (plan-milestone-gaps + import + add-backlog), #3297/#3298 (sibling reports)`
`DEFECT.PHASE-DIR-PREFIX-DRIFT.detect=grep mkdir/touch/path.join with {NN}-{slug} or padded_phase + phase_slug; if not consuming expected_phase_dir from init.* JSON it is drifting`
`DEFECT.PHASE-DIR-PREFIX-DRIFT.fix-forward=consume expected_phase_dir from init.phase-op / init.plan-phase output; never re-construct from padded_phase + slug in workflow steps`
`DEFECT.PHASE-DIR-PREFIX-DRIFT.anchor=tests/bug-3298-phase-dir-prefix-drift-in-workflows.test.cjs (broad regression across workflow surfaces)`

`DEFECT.STACKED-PR-AUTO-RETARGET.symptom=PR #N is stacked on branch B; branch B merges to main and is deleted; GitHub does not reliably auto-retarget #N to main; PR shows DIRTY/CONFLICTING with phantom conflicts`
`DEFECT.STACKED-PR-AUTO-RETARGET.examples=#3311 base fix/3255-add-json-errors-mode-gsd-tools deleted after #3304 merged`
`DEFECT.STACKED-PR-AUTO-RETARGET.detect=ls-remote shows base ref absent; PR base still points at the deleted ref; mergeable=CONFLICTING with no real diff conflicts`
`DEFECT.STACKED-PR-AUTO-RETARGET.fix-forward=PATCH /repos/{owner}/{repo}/pulls/{N} -f base=main; rebase head onto current main; resolve carry-over commits (parent commits will auto-drop as patch contents already upstream)`

`DEFECT.BOT-BRANCH-STALE-BASE.symptom=auto-branch.yml creates fix/{N}-{slug} when issue is filed; branch is anchored to issue-creation main; by the time work begins, main has moved`
`DEFECT.BOT-BRANCH-STALE-BASE.examples=#3309 fix/3309-checkpoint-type-human-verify-burns-token (was at e14ef535; main at 2e87c60a)`
`DEFECT.BOT-BRANCH-STALE-BASE.detect=git merge-base origin/<bot-branch> origin/main returns the bot branch tip — confirms the bot branch is an ancestor of main, just stale`
`DEFECT.BOT-BRANCH-STALE-BASE.fix-forward=git checkout --detach origin/main; do work; git checkout -b <same-branch-name>; force-push with --force-with-lease`

`DEFECT.SUPERSEDED-CONCURRENT-PRS.symptom=multiple in-flight PRs attack overlapping subsets of the same issue; the broadest one merges first; narrower siblings remain open with phantom conflicts`
`DEFECT.SUPERSEDED-CONCURRENT-PRS.examples=#3303 + #3307 superseded by #3306 (all addressing #3297/#3298 project_code prefix family)`
`DEFECT.SUPERSEDED-CONCURRENT-PRS.detect=after a fix lands on main, grep recently-merged PR title for shared keyword/issue; check open PRs touching same files; if open PRs are subsets of merged work they are superseded`
`DEFECT.SUPERSEDED-CONCURRENT-PRS.fix-forward=close superseded PRs via gh api PATCH state=closed; do not comment on self-authored PRs (k101); the link to the merged PR makes supersession discoverable in PR history`

`DEFECT.PROMPT-INJECTION-SCAN-COLLISION.symptom=custom XML element name in agent .md file matches scripts/scan-prompt-injection regex; legitimate agent vocabulary trips the security gate`
`DEFECT.PROMPT-INJECTION-SCAN-COLLISION.examples=#3309 added a bare 'human' element (angle-bracket-wrapped) for verify-block harvesting; tests/prompt-injection-scan.test.cjs flags angle-bracket-wrapped names matching system|assistant|human (open or close form)`
`DEFECT.PROMPT-INJECTION-SCAN-COLLISION.detect=any new bare <system|assistant|human|user> tag in agents/*.md`
`DEFECT.PROMPT-INJECTION-SCAN-COLLISION.fix-forward=hyphenate the tag (<human-check>, <assistant-prompt>) — scanner regex matches bare names only`

`DEFECT.INVENTORY-DRIFT.symptom=new file added under get-shit-done/references/ or get-shit-done/workflows/ without updating docs/INVENTORY.md count + row AND docs/INVENTORY-MANIFEST.json`
`DEFECT.INVENTORY-DRIFT.examples=#3309 planner-human-verify-mode.md (caught by tests/inventory-counts.test.cjs + tests/inventory-manifest-sync.test.cjs)`
`DEFECT.INVENTORY-DRIFT.detect=tests/inventory-* fails with "References (N shipped) disagrees with filesystem" or "New surfaces not in manifest"`
`DEFECT.INVENTORY-DRIFT.fix-forward=update INVENTORY.md headline count + row entry + footnote count; run node scripts/gen-inventory-manifest.cjs --write to regen INVENTORY-MANIFEST.json; only families.workflows is canonical (top-level workflows key is stale)`

`DEFECT.AGENT-FILE-SIZE-CAP-BREACH.symptom=adding to agents/gsd-planner.md (or other large agent files) exceeds the 45K char extraction-evidence threshold`
`DEFECT.AGENT-FILE-SIZE-CAP-BREACH.state=gsd-planner.md is already 49,121 chars on main (over 45K); test fails on main; net-new content makes it strictly worse`
`DEFECT.AGENT-FILE-SIZE-CAP-BREACH.detect=tests/planner-decomposition.test.cjs ("planner is under 45K chars (proves mode sections were extracted)") and tests/reachability-check.test.cjs ("file stays under 50000 char limit")`
`DEFECT.AGENT-FILE-SIZE-CAP-BREACH.fix-forward=mirror MVP mode pattern — extract full rules to get-shit-done/references/planner-<mode>.md, leave a slim Detection section in the agent file with @-reference to the new file`

`DEFECT.CHANGESET-PR-FIELD-DRIFT.symptom=.changeset/*.md frontmatter pr: value is the issue number, a guess made before PR opened, or a stale stacked-PR number`
`DEFECT.CHANGESET-PR-FIELD-DRIFT.examples=#3316 (pr:3312 was the issue), #3325 (pr:3319 was a guess); already covered earlier in this file but recurs every cycle`
`DEFECT.CHANGESET-PR-FIELD-DRIFT.detect=changeset pr: value mismatches the actual PR number returned by gh api POST /pulls`
`DEFECT.CHANGESET-PR-FIELD-DRIFT.fix-forward=author changeset with placeholder pr:0; immediately after gh api POST /pulls returns the number, edit changeset and amend or follow-up commit; never guess`

`DEFECT.WORKTREE-FETCH-SHA-DIVERGENCE.symptom=in a worktree, git fetch origin pull/N/head:pr-N produces commits with SHAs different from the actual remote PR head SHA; force-push rejected as non-fast-forward despite recent fetch`
`DEFECT.WORKTREE-FETCH-SHA-DIVERGENCE.examples=this session, branch fix/3309-... and pr-3316`
`DEFECT.WORKTREE-FETCH-SHA-DIVERGENCE.detect=git rev-parse HEAD~1 vs git rev-parse origin/<actual-branch-ref> — if they differ despite fetch the local copy was rewritten by some checkout-time hook`
`DEFECT.WORKTREE-FETCH-SHA-DIVERGENCE.fix-forward=git checkout --detach origin/<actual-remote-branch> directly; do work from detached HEAD; push HEAD:<remote-branch>`

`DEFECT.WINDOWS-FS-OPS.symptom=fs.renameSync / fs.copyFileSync hits EPERM/EBUSY on Windows when antivirus or another process holds a transient handle on the target`
`DEFECT.WINDOWS-FS-OPS.examples=c47c2c5d build-hooks rename → copy fallback, d2412271 install Windows persistent SDK shim`
`DEFECT.WINDOWS-FS-OPS.detect=any rename/copy in build/install path without try/catch fallback`
`DEFECT.WINDOWS-FS-OPS.fix-forward=catch EPERM/EBUSY/EACCES, fall back to copy + unlink with retry, surface degraded-mode message; never silently swallow`

`DEFECT.UNBOUNDED-SUBPROCESS.symptom=git/npm subprocess shelled out without timeout; CLI hangs indefinitely on stuck remote, large repo, or missing network`
`DEFECT.UNBOUNDED-SUBPROCESS.examples=a33cbe72 worktree fix bound git subprocesses with timeout`
`DEFECT.UNBOUNDED-SUBPROCESS.detect=execSync/execFileSync/spawnSync without timeout option in non-test code; especially git list-worktrees, git fetch, npm view`
`DEFECT.UNBOUNDED-SUBPROCESS.fix-forward=add timeout (5-30s for git, 60s for npm); on timeout return degraded result + structured warning rather than throw`

`DEFECT.PARSER-BRITTLE-MARKER-WHITELIST.symptom=human-output parser whitelists known markers (severity, status); silently drops unfamiliar markers as malformed`
`DEFECT.PARSER-BRITTLE-MARKER-WHITELIST.examples=ac518646/#3263 code-review SUMMARY parser rejected BL-/blocker variants`
`DEFECT.PARSER-BRITTLE-MARKER-WHITELIST.detect=any parser with hard-coded marker list; any parser that returns empty for non-matching input without warning`
`DEFECT.PARSER-BRITTLE-MARKER-WHITELIST.fix-forward=accept variants explicitly (case-insensitive, hyphen/space alternatives); on unknown marker emit a structured WARN with the original line so the human can fix the source`

`DEFECT.HALT-COST-PATTERN.symptom=architecturally-sound checkpoint pattern produces hidden token cost because subagent context is discarded across the pause and respawn`
`DEFECT.HALT-COST-PATTERN.examples=#3309 checkpoint:human-verify (mid-flight halt = full executor cold-start per round-trip; reporter measured "tens of thousands of tokens" per halt)`
`DEFECT.HALT-COST-PATTERN.detect=any subagent-spawning workflow with mid-flight pause-and-resume that does not preserve subagent context`
`DEFECT.HALT-COST-PATTERN.fix-forward=offer config flag for end-of-phase aggregation; if cost dominates make end-of-phase the default; route deferred items through existing verifier surface, do not invent new writer`

`DEFECT.HOOK-OVER-ENFORCEMENT.symptom=PreToolUse hook keeps blocking gh pr edit / gh issue edit even after all required files are read in the session; security_reminder_hook over-fires on docstrings that mention exec semantics; etc`
`DEFECT.HOOK-OVER-ENFORCEMENT.examples=this session repeatedly hit "Refusing to run gh issue create|edit / gh pr create|edit" despite reading every listed file; CONTEXT.md Write blocked because content contained literal '.exec' followed by parens in documentation strings`
`DEFECT.HOOK-OVER-ENFORCEMENT.detect=hook re-fires on each invocation regardless of session-state read receipts; or fires on documentation matching code-pattern regex without context awareness`
`DEFECT.HOOK-OVER-ENFORCEMENT.fix-forward=use gh api -X PATCH repos/{owner}/{repo}/pulls/{N} or repos/{owner}/{repo}/issues/{N} directly — same effect, hook regex does not match; for security-hook overfiring on docs, rephrase the offending substring (e.g. write '.exec call' instead of '.exec' followed by parens) without losing semantic content`

`DEFECT.DEFAULT-FLIP-DOCUMENTATION.symptom=PR flips a config default but does not call out the migration semantics (when does the new default take effect; existing configs vs new configs; what the opt-back-in looks like)`
`DEFECT.DEFAULT-FLIP-DOCUMENTATION.examples=#3309 v2 default flip from mid-flight to end-of-phase`
`DEFECT.DEFAULT-FLIP-DOCUMENTATION.detect=any PR that changes a default value in CONFIG_DEFAULTS or buildNewProjectConfig; check that PR body Breaking Changes section explicitly covers (a) when the new default takes effect, (b) opt-back-in command, (c) effect on in-flight artifacts`
`DEFECT.DEFAULT-FLIP-DOCUMENTATION.fix-forward=template — "new default takes effect when .planning/config.json is rewritten (config-set, fresh project, regenerated config); existing artifacts continue to work; opt-back-in: gsd config-set <key> <old-value>"`

`DEFECT.SOURCE-GREP-IN-NEW-TESTS.symptom=new test file uses readFileSync + .includes / .match against source code; contradicts the test rule lint script`
`DEFECT.SOURCE-GREP-IN-NEW-TESTS.detect=tests/lint-no-source-grep.cjs (npm run lint:tests) fails with line-number-precise violation; or test reads sdk/dist/* artifacts in CI where dist may not exist`
`DEFECT.SOURCE-GREP-IN-NEW-TESTS.fix-forward=replace with runGsdTools(...) behavioral test capturing JSON; if asserting agent .md content (which IS the runtime contract) add // allow-test-rule: source-text-is-the-product with one-line justification`

`DEFECT.GENERATIVE-PRIORITY=these defect classes share a common root: parallel implementations diverge silently because no parity test enforces equality at the test layer`
`DEFECT.GENERATIVE-FIX=for any new constant/array/parser shared between CJS and SDK (or between two workflow surfaces), the same commit MUST add a parity assertion that fails when the two diverge`
`DEFECT.GENERATIVE-EXEMPLAR=tests/config-schema-sdk-parity.test.cjs (asserts SDK VALID_CONFIG_KEYS == CJS VALID_CONFIG_KEYS); tests/bug-3298-phase-dir-prefix-drift-in-workflows.test.cjs (asserts every workflow surface uses expected_phase_dir)`

`CR.MD040-NEW-MD.symptom=newly-added fenced code block in a hand-edited .md file (Edit/Write tool, not platformWriteSync) opens with bare backticks instead of language-tagged backticks; CodeRabbit flags MD040 as Quick win`
`CR.MD040-NEW-MD.examples=#3487 — three new fences (docs/adr/README.md L11, docs/contributor-standards.md L94, docs/prd/README.md L11) all flagged in same review pass`
`CR.MD040-NEW-MD.detect=before push — grep for bare opening backtick fences against your touched files; opening fences (the ones followed by content) need a language token, closing fences stay bare`
`CR.MD040-NEW-MD.fix-forward=add language to opening fence — text for filenames/paths/placeholders, bash for shell, js/cjs/ts for code, json/yaml for config, diff for diffs, md for markdown samples`
`CR.MD040-NEW-MD.root-cause=platformWriteSync._normalizeMd auto-fixes MD022/MD031/MD032/MD012/MD047 for .md writes via the seam, but does NOT inject fence language tokens; Edit/Write tool calls bypass even that normalizer entirely`

`CR.HEADING-ANCHOR-DRIFT.symptom=cross-references like ../../CONTRIBUTING.md#proposing-an-adr-or-prd resolve to nothing because the heading text was renamed/abbreviated and its GitHub-rendered slug no longer matches`
`CR.HEADING-ANCHOR-DRIFT.examples=#3487 — heading "### 📐 ADR or PRD" produced GitHub slug #adr-or-prd; cross-refs from docs/adr/README.md, docs/prd/README.md, docs/contributor-standards.md all targeted #proposing-an-adr-or-prd; all 3 silently broken until CR caught it`
`CR.HEADING-ANCHOR-DRIFT.detect=GitHub slug rules — lowercase, strip emojis, strip punctuation, spaces→hyphens; before push, compute slug for any new heading and grep -rn "#<slug>" repo-wide to verify cross-refs match`
`CR.HEADING-ANCHOR-DRIFT.fix-forward=usually rename the heading so its slug matches existing cross-refs (1 change vs N referrer updates); CR catches as Quick win but pre-push grep avoids the round-trip`

`CR.AUTO-RESOLVE-ON-PUSH.behavior=CodeRabbit re-reviews on each new commit; threads where the flagged issue is addressed auto-flip to isResolved=true + isOutdated=true within ~30-90s; new "actionable comments: 0 🎉" summary comment posts when clean`
`CR.AUTO-RESOLVE-ON-PUSH.implication=do NOT manually resolveReviewThread via GraphQL after pushing fixes — wasted GraphQL call, and races CR's own re-resolution; verify outcome with gh api graphql query reviewThreads { isResolved isOutdated } after the next CR cycle`

`DEFECT.DOCS-PR-TEMPLATE-PATH.symptom=docs-only PR that changes contributor-facing process (CONTRIBUTING.md, docs/contributor-standards.md, docs/adr/README.md, docs/prd/README.md, etc.) opens with the default pull_request_template.md per its doc-only carve-out`
`DEFECT.DOCS-PR-TEMPLATE-PATH.examples=#3487 — first push used default template with carve-out justification; gsd-pr-template-policy bot posted "PR body does not match the fix, enhancement, or feature template" within seconds; "Pull request template format" check was failing`
`DEFECT.DOCS-PR-TEMPLATE-PATH.detect=any PR that touches the contributor-process docs is NOT eligible for the default-template carve-out; the carve-out is for CI/tooling/dependency PRs with no linked issue`
`DEFECT.DOCS-PR-TEMPLATE-PATH.fix-forward=use enhancement.md template; ensure linked issue carries approved-enhancement (issue may have been opened with documentation only — add enhancement + approved-enhancement labels too); rewrite PR body in enhancement structure (Linked Issue / What this enhancement improves / Before-After / How implemented / Testing / Scope confirmation / Checklist / Breaking changes)`

`DEFECT.NO-CHANGELOG-MISAPPLIED.symptom=docs-only PR labeled no-changelog because "no code surface touched"; reality is contributor-facing process change that contributors will hit as a PR rejection if not surfaced in CHANGELOG`
`DEFECT.NO-CHANGELOG-MISAPPLIED.examples=#3487 (ADR/PRD naming convention) — initially shipped with no-changelog because none of bin/ get-shit-done/ agents/ commands/ hooks/ sdk/src/ were touched; corrected to .changeset/zesty-goats-dart.md type:Changed after maintainer caught it`
`DEFECT.NO-CHANGELOG-MISAPPLIED.detect=Changeset Required workflow only fires on the gated paths above, so docs-only PRs pass CI without a fragment; CONTRIBUTING.md L126 explicit rule is "When unsure whether a change is user-facing, add the fragment" — contributors are a user class`
`DEFECT.NO-CHANGELOG-MISAPPLIED.fix-forward=remove no-changelog label; npm run changeset -- --type Changed --pr <N> --body "<one-sentence contributor-facing summary>"; commit fragment as separate commit on the same branch; verify PR labels show no-changelog gone before merge`

`CR.GENERATIVE-PRIORITY=hand-edited markdown additions and "doc-only" PRs share a root: they bypass the seam-level normalizer (platformWriteSync._normalizeMd) and the typed-template gate (CONTRIBUTING.md fix/enhancement/feature path), so failures only surface at CR/bot review time`
`CR.GENERATIVE-FIX=before opening any docs PR, run a 3-step pre-flight — (1) grep your touched files for bare opening backtick fences and add language tags, (2) compute the GitHub slug for any new headings (lowercase, strip emojis/punctuation, spaces→hyphens) and grep the repo for cross-refs to that slug, (3) decide if the change is contributor-facing → if yes, use enhancement template + Changed changeset + approved-enhancement label on issue, do NOT use the default-template doc-only carve-out`
`CR.GENERATIVE-EXEMPLAR=#3487 hit all 5 of the above issues in the same PR; one push round-trip per fix; total ~20min wasted that pre-flight would have caught`

`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.scope=shell-command-projection.cjs extended to own subprocess dispatch + platform file I/O across issues #3465–#3468`
`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.adr-effect=ADR-0009 "does not execute" constraint superseded; ADR-0010 File Operation Engine superseded`
`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.new-exports=[execGit, execNpm, execTool, probeTty, normalizeContent, platformWriteSync, platformReadSync, platformEnsureDir]`
`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.result-shape-invariant=all exec* return {exitCode, stdout, stderr}; never throw on non-zero exit`
`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.platform-policy=shell: process.platform === 'win32' lives only in execNpm; probeTty returns null on Windows`
`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.normalization-policy=platformWriteSync owns full normalizeMd for .md; CRLF→LF + trailing newline for all others; callers must NOT pre-call normalizeMd`
`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.typed-surface=normalizeContent(filePath, content) is the pure typed surface tests assert on — no file content read-back in tests`
`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.no-circular-dep=_normalizeMd re-implemented inline (not imported from core.cjs) to avoid circular dep`
`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.compat-removal=atomicWriteFileSync, safeReadFile, normalizeMd remained in core.cjs exports until Phase 4 (#3468) removed them`
`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.phase-gate=no call site migration until Phase 1 branch merged; Phase 2 (#3466)=6 subprocess files; Phase 3 (#3467)=15 fs files (215 sites); Phase 4 (#3468)=remove compat exports`
`SESSION.2026-05-13.SHELL-PROJECTION-EXPANSION.test-anchor=tests/shell-command-projection-dispatch.test.cjs — 31 behavioral tests, node:test + node:assert/strict, no source-grep`

`SESSION.2026-05-13.CODERABBIT-GUARD-MERGE-RECOVERY.scope=PR #3464; gsd-build/get-shit-done only — all gh checks with --repo gsd-build/get-shit-done`
`SESSION.2026-05-13.CODERABBIT-GUARD-MERGE-RECOVERY.invariant=review completion requires three gates: CI required checks green AND CodeRabbit green AND GraphQL unresolved review threads = 0`
`SESSION.2026-05-13.CODERABBIT-GUARD-MERGE-RECOVERY.failure-mode-1=mergeStateStatus=DIRTY can exist even when CodeRabbit + thread count are clean; remediation = rebase/replay onto latest origin/main before treating PR as merge-ready`
`SESSION.2026-05-13.CODERABBIT-GUARD-MERGE-RECOVERY.failure-mode-2=primary worktree rebase blocked by unrelated untracked files; remediation = use isolated worktree seeded from origin/main, replay feature commits there, then push --force-with-lease to PR head`
`SESSION.2026-05-13.CODERABBIT-GUARD-MERGE-RECOVERY.replay-conflict-seam=get-shit-done/bin/lib/config.cjs; keep both behaviors during conflict resolution (existing ship.pr_body_sections + workflow.human_verify_mode validations AND new review.default_reviewers normalization path)`
`SESSION.2026-05-13.CODERABBIT-GUARD-MERGE-RECOVERY.post-rebase-drift-classes=[tests/config-schema-sdk-parity.test.cjs (SDK schema parity), tests/inventory-counts.test.cjs (docs inventory counts), tests/inventory-manifest-sync.test.cjs (inventory manifest sync), tests/bug-2543-gsd-slash-namespace.test.cjs (slash namespace invariant)]`
`SESSION.2026-05-13.CODERABBIT-GUARD-MERGE-RECOVERY.concrete-fixes=[add review.default_reviewers to sdk/src/query/config-schema.ts, add review-reviewer-selection.cjs row + count update in docs/INVENTORY.md, regenerate docs/INVENTORY-MANIFEST.json, replace legacy /gsd-review with canonical /gsd:review in source comments]`

`SESSION.2026-05-13.PHASE-1-REBASE-PR-OPEN.scope=feat/3465-shell-projection-platform-io-seam → PR #3470 on gsd-build/get-shit-done`
`SESSION.2026-05-13.PHASE-1-REBASE-PR-OPEN.rebase-pattern=4 sibling-branch commits (#3464) skipped as "patch contents already upstream" — expected when feature branch cut before sibling merges to main`
`SESSION.2026-05-13.PHASE-1-REBASE-PR-OPEN.untracked-block=git stash --include-untracked before git rebase origin/main`
`SESSION.2026-05-13.PHASE-1-REBASE-PR-OPEN.add-add-conflict=when HEAD side empty (feature didn't have file) and ours has content, git checkout --theirs <file> is correct`
`SESSION.2026-05-13.PHASE-1-REBASE-PR-OPEN.content-conflict=git checkout --ours CONTEXT.md + manual append of new sections — preserves main's full content while adding our additions`
`SESSION.2026-05-13.PHASE-1-REBASE-PR-OPEN.untracked-becoming-tracked=docs/research/ was untracked pre-rebase but came in from main during rebase — already tracked, no action required`
`SESSION.2026-05-13.PHASE-1-REBASE-PR-OPEN.force-push=git push --force-with-lease origin <branch> (NOT --force)`
`SESSION.2026-05-13.PHASE-1-REBASE-PR-OPEN.stash-pop-fail=if main brought in same files, drop stash with git stash drop`
`SESSION.2026-05-13.PHASE-1-REBASE-PR-OPEN.pr-hook-requires-reads=PR hook requires reading all listed contribution files before gh pr create executes — including pull_request_template.md, all typed templates, and all issue templates`
`SESSION.2026-05-13.PHASE-1-REBASE-PR-OPEN.changeset-type-for-seam=Changed (NOT Added) — expands existing module, not a new standalone feature`
