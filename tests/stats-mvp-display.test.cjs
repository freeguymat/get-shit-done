/**
 * stats workflow — MVP mode summary contract test
 */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const WORKFLOW = path.join(__dirname, '..', 'get-shit-done', 'workflows', 'stats.md');

function parseStatsContract(content) {
  const lines = content.split(/\r?\n/);
  const lowerLines = lines.map(line => line.toLowerCase());
  return {
    hasMvpSummaryLanguage: lowerLines.some(line => line.includes('mvp') && line.includes('phase')),
    referencesModeField: lowerLines.some(line => line.includes('mode')),
    usesRoadmapAnalyze: lowerLines.some(line => line.includes('roadmap.analyze')),
    normalizesAnalyzeAtFile: lowerLines.some(line => line.includes('analyze') && line.includes('@file:')),
  };
}

describe('stats — MVP mode summary', () => {
  const contract = parseStatsContract(fs.readFileSync(WORKFLOW, 'utf-8'));

  test('workflow includes MVP phase count summary', () => {
    assert.ok(contract.hasMvpSummaryLanguage, 'must mention MVP in summary');
    assert.ok(contract.referencesModeField, 'must reference mode field');
  });

  test('uses roadmap.analyze to count MVP phases', () => {
    assert.ok(contract.usesRoadmapAnalyze, 'must consult roadmap.analyze');
    assert.ok(contract.normalizesAnalyzeAtFile, 'must normalize @file indirection before jq');
  });
});
