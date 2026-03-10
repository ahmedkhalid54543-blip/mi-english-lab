const test = require('node:test');
const assert = require('node:assert/strict');

const { generateReviewQueue, getTodayReviewItems } = require('../js/review-queue.js');

test('generateReviewQueue prioritizes critical recent weaknesses', () => {
  const queue = generateReviewQueue({
    weaknesses: [
      {
        targetType: 'scenario',
        targetId: 'scene-a',
        title: 'Scene A',
        severityScore: 100,
        severityLabel: 'critical',
        lastOccurredAt: '2026-03-10T10:00:00Z'
      },
      {
        targetType: 'lesson',
        targetId: 'L01',
        title: 'Lesson 1',
        severityScore: 40,
        severityLabel: 'high',
        lastOccurredAt: '2026-03-10T12:00:00Z'
      }
    ],
    today: '2026-03-11',
    limit: 10
  });

  assert.equal(queue.length, 2);
  assert.equal(queue[0].targetId, 'scene-a');
  assert.equal(queue[0].priorityLabel, 'P1');
  assert.equal(queue[0].reviewDate, '2026-03-11');
});

test('getTodayReviewItems filters future items and keeps ordering', () => {
  const queue = [
    { targetId: 'scene-a', reviewDate: '2026-03-11', priorityScore: 100 },
    { targetId: 'scene-b', reviewDate: '2026-03-12', priorityScore: 120 },
    { targetId: 'scene-c', reviewDate: '2026-03-11', priorityScore: 90 }
  ];

  const items = getTodayReviewItems({
    queue,
    today: '2026-03-11'
  });

  assert.deepEqual(items.map(item => item.targetId), ['scene-a', 'scene-c']);
});
