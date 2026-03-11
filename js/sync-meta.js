(function initSyncMetaModule(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.MiSyncMeta = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function createSyncMetaModule() {
  'use strict';

  var STORAGE_KEY = 'mi-english-sync-meta-v1';
  var STATUS_VALUES = Object.freeze({
    mastered: true,
    shaky: true,
    unknown: true
  });

  function nowIso() {
    return new Date().toISOString();
  }

  function normalizeIso(value) {
    if (!value) return null;
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createEmptySnapshot() {
    return {
      vocab: {},
      pattern: {},
      selectedRole: null
    };
  }

  function sanitizeStatusMetaBucket(rawBucket) {
    var safe = {};
    if (!isPlainObject(rawBucket)) return safe;

    Object.keys(rawBucket).forEach(function eachKey(id) {
      if (typeof id !== 'string' || !id) return;
      var rawItem = rawBucket[id];
      if (!isPlainObject(rawItem)) return;
      if (!STATUS_VALUES[rawItem.value]) return;
      safe[id] = {
        value: rawItem.value,
        updatedAt: normalizeIso(rawItem.updatedAt) || null
      };
    });

    return safe;
  }

  function sanitizeSelectedRoleMeta(rawRoleMeta) {
    if (!isPlainObject(rawRoleMeta)) return null;
    if (typeof rawRoleMeta.value !== 'string' || !rawRoleMeta.value.trim()) return null;
    return {
      value: rawRoleMeta.value.trim(),
      updatedAt: normalizeIso(rawRoleMeta.updatedAt) || null
    };
  }

  function sanitizeSnapshot(rawSnapshot) {
    var parsed = rawSnapshot;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch (_) {
        parsed = null;
      }
    }

    var safe = createEmptySnapshot();
    if (!isPlainObject(parsed)) return safe;

    safe.vocab = sanitizeStatusMetaBucket(parsed.vocab);
    safe.pattern = sanitizeStatusMetaBucket(parsed.pattern);
    safe.selectedRole = sanitizeSelectedRoleMeta(parsed.selectedRole);
    return safe;
  }

  function getStorage(storage) {
    if (storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function') {
      return storage;
    }

    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }

    return null;
  }

  function load(storage) {
    var target = getStorage(storage);
    if (!target) return createEmptySnapshot();

    try {
      return sanitizeSnapshot(target.getItem(STORAGE_KEY));
    } catch (_) {
      return createEmptySnapshot();
    }
  }

  function save(snapshot, storage) {
    var target = getStorage(storage);
    var safe = sanitizeSnapshot(snapshot);
    if (!target) return safe;

    try {
      target.setItem(STORAGE_KEY, JSON.stringify(safe));
    } catch (_) {}

    return safe;
  }

  function exportSnapshot(storage) {
    return clone(load(storage));
  }

  function getItemMeta(type, id, storage) {
    if ((type !== 'vocab' && type !== 'pattern') || typeof id !== 'string' || !id) return null;
    var snapshot = load(storage);
    return snapshot[type][id] ? clone(snapshot[type][id]) : null;
  }

  function getSelectedRoleMeta(storage) {
    var snapshot = load(storage);
    return snapshot.selectedRole ? clone(snapshot.selectedRole) : null;
  }

  function writeStatusMeta(snapshot, type, id, value, updatedAt) {
    if ((type !== 'vocab' && type !== 'pattern') || typeof id !== 'string' || !id) return false;

    if (!STATUS_VALUES[value]) {
      delete snapshot[type][id];
      return true;
    }

    snapshot[type][id] = {
      value: value,
      updatedAt: normalizeIso(updatedAt) || nowIso()
    };
    return true;
  }

  function markItemUpdated(type, id, value, updatedAt, storage) {
    var snapshot = load(storage);
    if (!writeStatusMeta(snapshot, type, id, value, updatedAt)) return null;
    save(snapshot, storage);
    return snapshot[type][id] ? clone(snapshot[type][id]) : null;
  }

  function markSelectedRole(roleId, updatedAt, storage) {
    var snapshot = load(storage);
    if (typeof roleId === 'string' && roleId.trim()) {
      snapshot.selectedRole = {
        value: roleId.trim(),
        updatedAt: normalizeIso(updatedAt) || nowIso()
      };
    } else {
      snapshot.selectedRole = null;
    }
    save(snapshot, storage);
    return snapshot.selectedRole ? clone(snapshot.selectedRole) : null;
  }

  function upsertSeedValue(snapshot, type, id, value, fallbackAt) {
    if (!STATUS_VALUES[value]) return false;
    var current = snapshot[type][id];
    if (current && current.value === value && current.updatedAt) return false;
    snapshot[type][id] = {
      value: value,
      updatedAt: current && current.updatedAt ? current.updatedAt : fallbackAt
    };
    return true;
  }

  function seedFromState(state, storage, options) {
    var snapshot = load(storage);
    var safeState = isPlainObject(state) ? state : {};
    var fallbackAt = normalizeIso(options && options.updatedAt) || normalizeIso(safeState.createdAt) || nowIso();
    var changed = false;

    if (isPlainObject(safeState.vocabStatus)) {
      Object.keys(safeState.vocabStatus).forEach(function eachVocab(id) {
        changed = upsertSeedValue(snapshot, 'vocab', id, safeState.vocabStatus[id], fallbackAt) || changed;
      });
    }

    if (isPlainObject(safeState.patternStatus)) {
      Object.keys(safeState.patternStatus).forEach(function eachPattern(id) {
        changed = upsertSeedValue(snapshot, 'pattern', id, safeState.patternStatus[id], fallbackAt) || changed;
      });
    }

    if (typeof safeState.selectedRole === 'string' && safeState.selectedRole.trim()) {
      if (!snapshot.selectedRole || snapshot.selectedRole.value !== safeState.selectedRole.trim()) {
        snapshot.selectedRole = {
          value: safeState.selectedRole.trim(),
          updatedAt: snapshot.selectedRole && snapshot.selectedRole.updatedAt ? snapshot.selectedRole.updatedAt : fallbackAt
        };
        changed = true;
      } else if (!snapshot.selectedRole.updatedAt) {
        snapshot.selectedRole.updatedAt = fallbackAt;
        changed = true;
      }
    }

    if (changed) {
      save(snapshot, storage);
    }

    return snapshot;
  }

  function recordStatusChanges(snapshot, type, previousMap, nextMap, changedAt) {
    var changed = false;
    var prev = isPlainObject(previousMap) ? previousMap : {};
    var next = isPlainObject(nextMap) ? nextMap : {};
    var ids = {};

    Object.keys(prev).forEach(function addPrev(id) { ids[id] = true; });
    Object.keys(next).forEach(function addNext(id) { ids[id] = true; });

    Object.keys(ids).forEach(function eachId(id) {
      var prevValue = STATUS_VALUES[prev[id]] ? prev[id] : null;
      var nextValue = STATUS_VALUES[next[id]] ? next[id] : null;
      if (prevValue === nextValue) return;
      writeStatusMeta(snapshot, type, id, nextValue, changedAt);
      changed = true;
    });

    return changed;
  }

  function recordStateChanges(previousState, nextState, storage, options) {
    var snapshot = load(storage);
    var changedAt = normalizeIso(options && options.updatedAt) || nowIso();
    var prev = isPlainObject(previousState) ? previousState : {};
    var next = isPlainObject(nextState) ? nextState : {};
    var changed = false;

    changed = recordStatusChanges(snapshot, 'vocab', prev.vocabStatus, next.vocabStatus, changedAt) || changed;
    changed = recordStatusChanges(snapshot, 'pattern', prev.patternStatus, next.patternStatus, changedAt) || changed;

    var prevRole = typeof prev.selectedRole === 'string' && prev.selectedRole.trim() ? prev.selectedRole.trim() : null;
    var nextRole = typeof next.selectedRole === 'string' && next.selectedRole.trim() ? next.selectedRole.trim() : null;
    if (prevRole !== nextRole) {
      if (nextRole) {
        snapshot.selectedRole = { value: nextRole, updatedAt: changedAt };
      } else {
        snapshot.selectedRole = null;
      }
      changed = true;
    }

    if (changed) {
      save(snapshot, storage);
    }

    return snapshot;
  }

  function compareTimestamps(left, right) {
    var leftTime = normalizeIso(left) ? new Date(left).getTime() : 0;
    var rightTime = normalizeIso(right) ? new Date(right).getTime() : 0;
    if (leftTime === rightTime) return 0;
    return leftTime > rightTime ? 1 : -1;
  }

  function latestTimestamp(left, right) {
    if (!left) return right || null;
    if (!right) return left || null;
    return compareTimestamps(left, right) >= 0 ? left : right;
  }

  function chooseValue(localValue, remoteValue, localMeta, remoteMeta) {
    if (!localValue && !remoteValue) {
      return { value: null, updatedAt: null };
    }

    if (localValue && !remoteValue) {
      return { value: localValue, updatedAt: localMeta && localMeta.updatedAt ? localMeta.updatedAt : null };
    }

    if (!localValue && remoteValue) {
      return { value: remoteValue, updatedAt: remoteMeta && remoteMeta.updatedAt ? remoteMeta.updatedAt : null };
    }

    if (localValue === remoteValue) {
      return {
        value: localValue,
        updatedAt: latestTimestamp(localMeta && localMeta.updatedAt, remoteMeta && remoteMeta.updatedAt)
      };
    }

    if (localMeta && localMeta.updatedAt && remoteMeta && remoteMeta.updatedAt) {
      return compareTimestamps(localMeta.updatedAt, remoteMeta.updatedAt) >= 0
        ? { value: localValue, updatedAt: localMeta.updatedAt }
        : { value: remoteValue, updatedAt: remoteMeta.updatedAt };
    }

    if (localMeta && localMeta.updatedAt) {
      return { value: localValue, updatedAt: localMeta.updatedAt };
    }

    if (remoteMeta && remoteMeta.updatedAt) {
      return { value: remoteValue, updatedAt: remoteMeta.updatedAt };
    }

    return { value: localValue, updatedAt: null };
  }

  function mergeStatusMaps(localMap, remoteMap, localBucket, remoteBucket) {
    var mergedValues = {};
    var mergedMeta = {};
    var ids = {};
    var localSafe = isPlainObject(localMap) ? localMap : {};
    var remoteSafe = isPlainObject(remoteMap) ? remoteMap : {};
    var localMetaSafe = isPlainObject(localBucket) ? localBucket : {};
    var remoteMetaSafe = isPlainObject(remoteBucket) ? remoteBucket : {};

    Object.keys(localSafe).forEach(function addLocal(id) { ids[id] = true; });
    Object.keys(remoteSafe).forEach(function addRemote(id) { ids[id] = true; });
    Object.keys(localMetaSafe).forEach(function addLocalMeta(id) { ids[id] = true; });
    Object.keys(remoteMetaSafe).forEach(function addRemoteMeta(id) { ids[id] = true; });

    Object.keys(ids).forEach(function eachId(id) {
      var localValue = STATUS_VALUES[localSafe[id]] ? localSafe[id] : null;
      var remoteValue = STATUS_VALUES[remoteSafe[id]] ? remoteSafe[id] : null;
      var localMeta = isPlainObject(localMetaSafe[id]) ? localMetaSafe[id] : null;
      var remoteMeta = isPlainObject(remoteMetaSafe[id]) ? remoteMetaSafe[id] : null;
      var chosen = chooseValue(localValue, remoteValue, localMeta, remoteMeta);
      if (!chosen.value) return;
      mergedValues[id] = chosen.value;
      mergedMeta[id] = {
        value: chosen.value,
        updatedAt: chosen.updatedAt || null
      };
    });

    return {
      values: mergedValues,
      meta: mergedMeta
    };
  }

  function mergeScalarValue(localValue, remoteValue, localMeta, remoteMeta) {
    var localSafe = typeof localValue === 'string' && localValue.trim() ? localValue.trim() : null;
    var remoteSafe = typeof remoteValue === 'string' && remoteValue.trim() ? remoteValue.trim() : null;
    return chooseValue(localSafe, remoteSafe, localMeta, remoteMeta);
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    sanitizeSnapshot: sanitizeSnapshot,
    load: load,
    save: save,
    exportSnapshot: exportSnapshot,
    getItemMeta: getItemMeta,
    getSelectedRoleMeta: getSelectedRoleMeta,
    markItemUpdated: markItemUpdated,
    markSelectedRole: markSelectedRole,
    seedFromState: seedFromState,
    recordStateChanges: recordStateChanges,
    compareTimestamps: compareTimestamps,
    latestTimestamp: latestTimestamp,
    mergeStatusMaps: mergeStatusMaps,
    mergeScalarValue: mergeScalarValue
  };
});
