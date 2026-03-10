(function initWeaknessModule(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.MiWeakness = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function createWeaknessModule() {
  'use strict';

  var REASON_WEIGHTS = Object.freeze({
    retry_failed: 100,
    scenario_failed: 70,
    rescue_overused: 60,
    lesson_mistakes: 40
  });

  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function toNumber(value, fallback) {
    var num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function normalizeDate(value) {
    if (!value) return null;
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  function getLatestDate(a, b) {
    if (!a) return b || null;
    if (!b) return a || null;
    return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
  }

  function severityLabel(score) {
    if (score >= 100) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  function createBucket(targetType, targetId, title) {
    return {
      targetType: targetType,
      targetId: targetId,
      title: title || targetId,
      severityScore: 0,
      severityLabel: 'low',
      lastOccurredAt: null,
      reasons: [],
      reasonCodes: []
    };
  }

  function addReason(bucket, reasonCode, reasonText, score, occurredAt) {
    if (!bucket || !reasonCode) return;

    if (bucket.reasonCodes.indexOf(reasonCode) === -1) {
      bucket.reasonCodes.push(reasonCode);
      bucket.reasons.push(reasonText);
      bucket.severityScore += score || 0;
    } else if (score && score > 0) {
      bucket.severityScore += Math.round(score * 0.2);
    }

    bucket.lastOccurredAt = getLatestDate(bucket.lastOccurredAt, normalizeDate(occurredAt));
    bucket.severityLabel = severityLabel(bucket.severityScore);
  }

  function getSceneBucket(buckets, sceneId, title) {
    var key = 'scenario:' + sceneId;
    if (!buckets[key]) {
      buckets[key] = createBucket('scenario', sceneId, title || sceneId);
    }
    return buckets[key];
  }

  function getLessonBucket(buckets, lessonId, title) {
    var key = 'lesson:' + lessonId;
    if (!buckets[key]) {
      buckets[key] = createBucket('lesson', lessonId, title || lessonId);
    }
    return buckets[key];
  }

  function identifyWeaknesses(input) {
    var source = input && typeof input === 'object' ? input : {};
    var buckets = {};
    var attemptsByScene = {};

    toArray(source.scenario_attempts).forEach(function eachAttempt(attempt) {
      if (!attempt || !attempt.scene_id) return;
      var sceneId = attempt.scene_id;
      if (!attemptsByScene[sceneId]) attemptsByScene[sceneId] = [];
      attemptsByScene[sceneId].push(attempt);

      var status = typeof attempt.status === 'string' ? attempt.status : (attempt.passed === false ? 'failed' : (attempt.passed === true ? 'passed' : ''));
      if (status === 'failed') {
        addReason(
          getSceneBucket(buckets, sceneId, attempt.scene_title),
          'scenario_failed',
          'scenario failed',
          REASON_WEIGHTS.scenario_failed,
          attempt.attempted_at || attempt.created_at
        );
      }

      if (attempt.payload && typeof attempt.payload === 'object') {
        var rescueCount = toNumber(attempt.payload.rescue_line_used, 0);
        if (rescueCount > 3) {
          addReason(
            getSceneBucket(buckets, sceneId, attempt.scene_title),
            'rescue_overused',
            'rescue line used too often',
            REASON_WEIGHTS.rescue_overused + Math.min(rescueCount - 3, 4),
            attempt.attempted_at || attempt.created_at
          );
        }
      }
    });

    Object.keys(attemptsByScene).forEach(function eachScene(sceneId) {
      var items = attemptsByScene[sceneId].slice().sort(function sortAttempts(a, b) {
        return new Date(a.attempted_at || a.created_at || 0).getTime() - new Date(b.attempted_at || b.created_at || 0).getTime();
      });

      var passedOnce = items.some(function hasPass(item) {
        return item && (item.status === 'passed' || item.passed === true);
      });

      items.forEach(function checkRetry(item, index) {
        if (!item) return;
        var status = typeof item.status === 'string' ? item.status : (item.passed === false ? 'failed' : (item.passed === true ? 'passed' : ''));
        var round = toNumber(item.round, null);
        var payloadAttempts = item.payload && typeof item.payload === 'object' ? toNumber(item.payload.attempts, null) : null;
        var attemptIndex = round || payloadAttempts || (index + 1);

        if (attemptIndex >= 2 && status === 'failed' && !passedOnce) {
          addReason(
            getSceneBucket(buckets, sceneId, item.scene_title),
            'retry_failed',
            'retry failed again',
            REASON_WEIGHTS.retry_failed,
            item.attempted_at || item.created_at
          );
        }
      });
    });

    toArray(source.lesson_progress).forEach(function eachLesson(lesson) {
      if (!lesson || !lesson.lesson_id) return;
      var mistakeCount = toNumber(
        lesson.mistake_count != null ? lesson.mistake_count : (
          lesson.error_count != null ? lesson.error_count : (
            lesson.failed_count != null ? lesson.failed_count : lesson.incorrect_count
          )
        ),
        0
      );

      if (mistakeCount > 2) {
        addReason(
          getLessonBucket(buckets, lesson.lesson_id, lesson.lesson_title),
          'lesson_mistakes',
          'lesson mistakes above threshold',
          REASON_WEIGHTS.lesson_mistakes + Math.min(mistakeCount - 2, 5),
          lesson.updated_at || lesson.created_at
        );
      }
    });

    toArray(source.events).forEach(function eachEvent(event) {
      if (!event || !event.scene_id) return;
      var rescueLineUsed = toNumber(event.rescue_line_used, 0);
      if (rescueLineUsed > 3) {
        addReason(
          getSceneBucket(buckets, event.scene_id, event.scene_title),
          'rescue_overused',
          'rescue line used too often',
          REASON_WEIGHTS.rescue_overused + Math.min(rescueLineUsed - 3, 4),
          event.created_at || event.attempted_at
        );
      }
    });

    return Object.keys(buckets)
      .map(function toItem(key) {
        var item = buckets[key];
        return {
          targetType: item.targetType,
          targetId: item.targetId,
          title: item.title,
          severityScore: item.severityScore,
          severityLabel: item.severityLabel,
          lastOccurredAt: item.lastOccurredAt,
          reasons: item.reasons.slice(),
          reasonCodes: item.reasonCodes.slice()
        };
      })
      .sort(function sortWeaknesses(a, b) {
        if (b.severityScore !== a.severityScore) return b.severityScore - a.severityScore;
        var timeA = a.lastOccurredAt ? new Date(a.lastOccurredAt).getTime() : 0;
        var timeB = b.lastOccurredAt ? new Date(b.lastOccurredAt).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return String(a.targetId).localeCompare(String(b.targetId));
      });
  }

  return {
    identifyWeaknesses: identifyWeaknesses
  };
});
