/**
 * mvp-phase workflow — contract test
 * Verifies the workflow markdown contains the four agreed gates:
 *  1. Phase existence + status guard (refuse in_progress/completed)
 *  2. User-story prompt (three AskUserQuestion calls, As a / I want to / So that)
 *  3. SPIDR splitting check
 *  4. ROADMAP write (Mode + Goal)
 *  5. Delegation to plan-phase
 */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const WORKFLOW = path.join(__dirname, '..', 'get-shit-done', 'workflows', 'mvp-phase.md');

function parseMvpPhaseContract(content) {
  const lines = content.split(/\r?\n/);
  const sections = [];
  let current = null;
  for (const raw of lines) {
    const heading = raw.match(/^##\s+(.+)$/);
    if (heading) {
      current = { title: heading[1].trim().toLowerCase(), body: [] };
      sections.push(current);
      continue;
    }
    if (current) current.body.push(raw);
  }

  const sectionByTitle = new Map(sections.map(s => [s.title, s]));
  const askCount = sections.reduce(
    (sum, s) => sum + s.body.filter(line => /askuserquestion|vscode_askquestions/i.test(line)).length,
    0,
  );
  const spidrStepIndex = sections.findIndex(s => s.title === '4. spidr splitting check');
  const planPhaseStepIndex = sections.findIndex(s => s.title === '7. delegate to /gsd plan-phase');
  const statusSection = sectionByTitle.get('2. validate phase exists and check status');
  const promptsSection = sectionByTitle.get('3. user story prompts');
  const writeSection = sections.find(s => s.title.includes('roadmap'));
  const delegateSection = sectionByTitle.get('7. delegate to /gsd plan-phase');

  return {
    hasStatusGuard: Boolean(statusSection && /in_progress|completed/i.test(statusSection.body.join('\n'))),
    hasForceOverride: Boolean(statusSection && /--force|status guard/i.test(statusSection.body.join('\n'))),
    hasAsA: Boolean(promptsSection && /\bAs a\b/i.test(promptsSection.body.join('\n'))),
    hasIWantTo: Boolean(promptsSection && /\bI want to\b/i.test(promptsSection.body.join('\n'))),
    hasSoThat: Boolean(promptsSection && /\bSo that\b/i.test(promptsSection.body.join('\n'))),
    askCount,
    hasSpidrReference: Boolean(sectionByTitle.get('4. spidr splitting check') && /spidr-splitting\.md/i.test(sectionByTitle.get('4. spidr splitting check').body.join('\n'))),
    hasModeLine: Boolean(writeSection && /\*\*Mode:\*\*\s*mvp/i.test(writeSection.body.join('\n'))),
    hasGoalLine: Boolean(writeSection && /\*\*Goal:\*\*/i.test(writeSection.body.join('\n'))),
    hasRoadmapReference: Boolean(writeSection && /ROADMAP\.md/.test(writeSection.body.join('\n'))),
    spidrStepIndex,
    planPhaseStepIndex,
    hasUserStoryTemplateRef: Boolean(promptsSection && /user-story-template\.md/i.test(promptsSection.body.join('\n'))),
    hasPlanPhaseCommandRef: Boolean(delegateSection && /\/gsd plan-phase/i.test(delegateSection.body.join('\n'))),
  };
}

describe('mvp-phase workflow', () => {
  const contract = parseMvpPhaseContract(fs.readFileSync(WORKFLOW, 'utf-8'));

  test('declares phase status guard (refuse in_progress/completed unless --force)', () => {
    assert.ok(contract.hasStatusGuard, 'workflow must reference status guard');
    assert.ok(contract.hasForceOverride, 'workflow must mention force override or status guard');
  });

  test('runs three structured user-story prompts', () => {
    assert.ok(contract.hasAsA);
    assert.ok(contract.hasIWantTo);
    assert.ok(contract.hasSoThat);
    assert.ok(contract.askCount >= 3, `workflow must invoke AskUserQuestion at least 3 times for the story prompts (got ${contract.askCount})`);
  });

  test('runs SPIDR splitting check after user story', () => {
    assert.ok(contract.spidrStepIndex >= 0, 'workflow must define an SPIDR step');
    assert.ok(contract.hasSpidrReference, 'workflow must reference the SPIDR rules file');
  });

  test('writes Mode: mvp + Goal: line to ROADMAP.md', () => {
    assert.ok(contract.hasModeLine, 'workflow must specify the **Mode:** mvp line');
    assert.ok(contract.hasRoadmapReference, 'workflow must reference ROADMAP.md');
    assert.ok(contract.hasGoalLine, 'workflow must update the **Goal:** line');
  });

  test('delegates to /gsd plan-phase after ROADMAP write', () => {
    assert.ok(contract.hasPlanPhaseCommandRef, 'plan-phase command reference must be present');
    assert.ok(contract.planPhaseStepIndex >= 0, 'plan-phase delegation step must be present');
    assert.ok(contract.spidrStepIndex >= 0, 'SPIDR check step must be present');
    assert.ok(contract.planPhaseStepIndex > contract.spidrStepIndex, 'plan-phase delegation must come AFTER SPIDR check');
  });

  test('references user-story-template.md', () => {
    assert.ok(contract.hasUserStoryTemplateRef);
  });
});
