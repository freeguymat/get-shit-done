/**
 * gsd-planner agent — MVP-mode branch contract
 * Verifies the agent definition contains the MVP-mode planning section,
 * conditional reference loading, and Walking Skeleton handling.
 */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const AGENT = path.join(__dirname, '..', 'agents', 'gsd-planner.md');
const REF_MVP = path.join(__dirname, '..', 'get-shit-done', 'references', 'planner-mvp-mode.md');
const REF_SKEL = path.join(__dirname, '..', 'get-shit-done', 'references', 'skeleton-template.md');

function parsePlannerContract(content) {
  const lines = content.split(/\r?\n/);
  const lowerLines = lines.map(line => line.toLowerCase());
  return {
    hasMvpModeSection: lowerLines.some(line => line.includes('mvp mode') || line.includes('mvp_mode')),
    hasVerticalSliceLanguage: lowerLines.some(line => line.includes('vertical-slice') || line.includes('vertical slice')),
    hasWalkingSkeleton: lowerLines.some(line => line.includes('walking skeleton')),
    hasSkeletonOutput: lowerLines.some(line => line.includes('skeleton.md')),
    hasPlannerMvpReference: lowerLines.some(line => line.includes('references/planner-mvp-mode.md')),
    hasMixingLanguage: lowerLines.some(line => line.includes('mix') && line.includes('horizontal') && line.includes('mvp')),
    hasPhaseGoalHeader: lowerLines.some(line => line.includes('phase goal')),
    hasBoldUserStorySlots: lowerLines.some(line =>
      line.includes('**as a**') && line.includes('**i want to**') && line.includes('**so that**')
    ),
    hasUserStoryTemplateRef: lowerLines.some(line => line.includes('user-story-template.md')),
  };
}

describe('gsd-planner — MVP-mode branch', () => {
  const contract = parsePlannerContract(fs.readFileSync(AGENT, 'utf-8'));

  test('agent defines an MVP Mode Detection section', () => {
    assert.ok(contract.hasMvpModeSection, 'must reference MVP mode');
    assert.ok(contract.hasVerticalSliceLanguage, 'must use vertical-slice terminology');
  });

  test('agent describes Walking Skeleton handling', () => {
    assert.ok(contract.hasWalkingSkeleton, 'must mention Walking Skeleton');
    assert.ok(contract.hasSkeletonOutput, 'must mention SKELETON.md output');
  });

  test('agent references planner-mvp-mode.md conditionally', () => {
    assert.ok(contract.hasPlannerMvpReference, 'must reference the MVP-mode rules file');
  });

  test('referenced files exist on disk', () => {
    assert.ok(fs.existsSync(REF_MVP), `${REF_MVP} must exist`);
    assert.ok(fs.existsSync(REF_SKEL), `${REF_SKEL} must exist`);
  });

  test('agent does not introduce horizontal/MVP mixing language', () => {
    assert.equal(contract.hasMixingLanguage, false, 'agent must enforce all-or-nothing per phase');
  });

  test('agent requires PLAN.md to start with user-story header in MVP mode', () => {
    assert.ok(contract.hasPhaseGoalHeader, 'must mention "Phase Goal" header');
    assert.ok(contract.hasBoldUserStorySlots, 'must specify the bolded user-story format for PLAN.md emit');
    assert.ok(contract.hasUserStoryTemplateRef, 'must reference the user-story-template reference file');
  });
});
