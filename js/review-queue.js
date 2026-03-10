(function initReviewQueueModule(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./weakness.js'));
    return;
  }

  root.MiReviewQueue = factory(root.MiWeakness || {});
})(typeof globalThis !== 'undefined' ? globalThis : this, function createReviewQueueModule(weaknessModule) {
  'use strict';

  function isoDay(value) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    var date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) date = new Date();
    return date.toISOString().slice(0, 10);
  }

  function addDays(day, offset) {
    var date = new Date(day + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  }

  function toWeaknesses(input) {
    if (input && Array.isArray(input.weaknesses)) return input.weaknesses.slice();
    if (weaknessModule && typeof weaknessModule.identifyWeaknesses === 'function') {
      return weaknessModule.identifyWeaknesses(input);
    }
    return [];
  }

  function getPriorityLabel(score) {
    if (score >= 100) return 'P1';
    if (score >= 70) return 'P2';
    if (score >= 40) return 'P3';
    return 'P4';
  }

  function getReviewDelayDays(item) {
    if (!item) return 1;
    if (item.severityScore >= 100) return 0;
    if (item.severityScore >= 60) return 0;
    if (item.severityScore >= 40) return 1;
    return 2;
  }

  function generateReviewQueue(input) {
    var source = input && typeof input === 'object' ? input : {};
    var today = isoDay(source.today);
    var limit = Number.isFinite(source.limit) ? source.limit : 8;
    var weaknesses = toWeaknesses(source);

    return weaknesses
      .map(function toQueueItem(item, index) {
        var reviewDate = addDays(today, getReviewDelayDays(item));
        var recencyBoost = item.lastOccurredAt ? Math.max(0, 30 - Math.floor((new Date(today + 'T00:00:00Z').getTime() - new Date(item.lastOccurredAt).getTime()) / 86400000)) : 0;
        var priorityScore = (item.severityScore || 0) * 10 + recencyBoost;
        return {
          id: item.targetType + ':' + item.targetId,
          targetType: item.targetType,
          targetId: item.targetId,
          title: item.title || item.targetId,
          reasons: Array.isArray(item.reasons) ? item.reasons.slice() : [],
          severityLabel: item.severityLabel || 'low',
          severityScore: item.severityScore || 0,
          lastOccurredAt: item.lastOccurredAt || null,
          reviewDate: reviewDate,
          priorityScore: priorityScore,
          priorityLabel: getPriorityLabel(priorityScore),
          orderHint: index
        };
      })
      .sort(function sortQueue(a, b) {
        if (a.reviewDate !== b.reviewDate) return a.reviewDate.localeCompare(b.reviewDate);
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        var timeA = a.lastOccurredAt ? new Date(a.lastOccurredAt).getTime() : 0;
        var timeB = b.lastOccurredAt ? new Date(b.lastOccurredAt).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return a.orderHint - b.orderHint;
      })
      .slice(0, Math.max(0, limit))
      .map(function stripOrderHint(item) {
        delete item.orderHint;
        return item;
      });
  }

  function getTodayReviewItems(input) {
    var source = input && typeof input === 'object' ? input : {};
    var today = isoDay(source.today);
    var queue = Array.isArray(source.queue) ? source.queue.slice() : generateReviewQueue(source);

    return queue
      .filter(function isDueToday(item) {
        return item && typeof item.reviewDate === 'string' && item.reviewDate <= today;
      })
      .sort(function sortToday(a, b) {
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        var timeA = a.lastOccurredAt ? new Date(a.lastOccurredAt).getTime() : 0;
        var timeB = b.lastOccurredAt ? new Date(b.lastOccurredAt).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return String(a.targetId).localeCompare(String(b.targetId));
      });
  }

  return {
    generateReviewQueue: generateReviewQueue,
    getTodayReviewItems: getTodayReviewItems
  };
});
