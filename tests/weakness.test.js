const test = require('node:test');
const assert = require('node:assert/strict');

const { identifyWeaknesses } = require('../js/weakness.js');

test('identifyWeaknesses ranks by severity then latest timestamp', () => {
  const weaknesses = identifyWeaknesses({
    scenario_attempts: [
      { scene_id: 'scene-a', status: 'failed', attempted_at: '2026-03-09T10:00:00Z' },
      { scene_id: 'scene-a', status: 'failed', attempted_at: '2026-03-10T09:00:00Z', round: 2 },
      { scene_id: 'scene-b', status: 'failed', attempted_at: '2026-03-10T12:00:00Z' }
    ],
    lesson_progress: [
      { lesson_id: 'L01', mistake_count: 3, updated_at: '2026-03-08T08:00:00Z' }
    ],
    events: [
      { scene_id: 'scene-b', rescue_line_used: 4, created_at: '2026-03-10T11:00:00Z' }
    ]
  });

  assert.equal(weaknesses[0].targetId, 'scene-a');
  assert.equal(weaknesses[0].severityLabel, 'critical');
  assert.equal(weaknesses[1].targetId, 'scene-b');
  assert.equal(weaknesses[2].targetId, 'L01');
});

test('identifyWeaknesses aggregates reasons and only flags lesson mistakes over threshold', () => {
  const weaknesses = identifyWeaknesses({
    scenario_attempts: [
      { scene_id: 'scene-c', status: 'passed', attempted_at: '2026-03-10T08:00:00Z' }
    ],
    lesson_progress: [
      { lesson_id: 'L02', mistake_count: 2, updated_at: '2026-03-08T08:00:00Z' },
      { lesson_id: 'L03', mistake_count: 5, updated_at: '2026-03-09T08:00:00Z' }
    ],
    events: [
      { scene_id: 'scene-x', rescue_line_used: 2, created_at: '2026-03-10T11:00:00Z' },
      { scene_id: 'scene-y', rescue_line_used: 6, created_at: '2026-03-10T11:30:00Z' }
    ]
  });

  assert.deepEqual(
    weaknesses.map(item => item.targetId),
    ['scene-y', 'L03']
  );
  assert.match(weaknesses[0].reasons.join(' '), /rescue/i);
  assert.match(weaknesses[1].reasons.join(' '), /mistake/i);
});
