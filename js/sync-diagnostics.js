(function initSyncDiagnosticsModule(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.MiSyncDiagnostics = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function createSyncDiagnosticsModule() {
  'use strict';

  var QUEUE_KEY = 'mi-sync-queue-v1';
  var STATUS_KEY = 'mi-sync-last-status-v1';

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }

  function readJson(storage, key, fallback) {
    if (!storage || typeof storage.getItem !== 'function') return fallback;
    try {
      var raw = storage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed === undefined ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }

  function countKeys(value) {
    return isPlainObject(value) ? Object.keys(value).length : 0;
  }

  function collect(options) {
    var source = options && isPlainObject(options) ? options : {};
    var storage = source.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    var state = source.state || (typeof loadState === 'function' ? loadState() : null);
    var syncMeta = source.syncMeta || (
      typeof MiSyncMeta !== 'undefined' && MiSyncMeta && typeof MiSyncMeta.exportSnapshot === 'function'
        ? MiSyncMeta.exportSnapshot(storage)
        : { vocab: {}, pattern: {}, selectedRole: null }
    );
    var queue = readJson(storage, QUEUE_KEY, []);
    var lastStatus = readJson(storage, STATUS_KEY, null);
    var scenarioProgress = readJson(storage, 'mi-english-scenario-progress-v1', {});

    return {
      stateSummary: {
        vocabStatusCount: countKeys(state && state.vocabStatus),
        patternStatusCount: countKeys(state && state.patternStatus),
        selectedRole: state && state.selectedRole ? state.selectedRole : null
      },
      syncMetaSummary: {
        vocabCount: countKeys(syncMeta && syncMeta.vocab),
        patternCount: countKeys(syncMeta && syncMeta.pattern),
        hasSelectedRoleMeta: Boolean(syncMeta && syncMeta.selectedRole)
      },
      scenarioSummary: {
        trackedScenes: countKeys(scenarioProgress)
      },
      queueSummary: {
        pendingCount: Array.isArray(queue) ? queue.length : 0
      },
      lastStatus: isPlainObject(lastStatus) ? lastStatus : null
    };
  }

  return {
    collect: collect
  };
});
