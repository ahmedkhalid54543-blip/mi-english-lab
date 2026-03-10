(function initApi(global) {
  'use strict';

  var QUEUE_KEY = 'mi-sync-queue-v1';
  var LAST_SYNC_STATUS_KEY = 'mi-sync-last-status-v1';
  var flushTimer = null;

  function getClient() {
    if (!global.MiAuth || typeof global.MiAuth.getClient !== 'function') return null;
    return global.MiAuth.getClient();
  }

  function emitSyncStatus(status, message) {
    var payload = {
      status: status,
      message: message || '',
      at: new Date().toISOString()
    };

    try {
      localStorage.setItem(LAST_SYNC_STATUS_KEY, JSON.stringify(payload));
    } catch (_) {}

    try {
      global.dispatchEvent(new CustomEvent('mi-sync-status', { detail: payload }));
    } catch (_) {}
  }

  function readQueue() {
    try {
      var raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeQueue(queue) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(Array.isArray(queue) ? queue.slice(-1000) : []));
      return true;
    } catch (_) {
      return false;
    }
  }

  function enqueue(op) {
    var queue = readQueue();
    queue.push({
      id: 'op_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString(),
      op: op
    });
    writeQueue(queue);
  }

  async function currentUserId() {
    if (!global.MiAuth || typeof global.MiAuth.getUser !== 'function') return null;
    var user = await global.MiAuth.getUser();
    return user && user.id ? user.id : null;
  }

  async function saveUserRole(roleId) {
    var client = getClient();
    var userId = await currentUserId();
    if (!client || !userId || !roleId) return { ok: false, reason: 'no_auth' };

    var upsertRole = await client
      .from('user_roles')
      .upsert({ user_id: userId, role_id: roleId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (upsertRole.error) return { ok: false, reason: upsertRole.error.message };

    return { ok: true };
  }

  async function saveVocabProgress(vocabId, status, updatedAt) {
    var client = getClient();
    var userId = await currentUserId();

    var payload = {
      user_id: userId,
      vocab_id: vocabId,
      status: status,
      updated_at: updatedAt || new Date().toISOString()
    };

    if (!client || !userId) {
      enqueue({ type: 'save_vocab', payload: payload });
      emitSyncStatus('offline', '离线缓存中，恢复在线后自动同步');
      return { ok: false, queued: true };
    }

    var result = await client.from('vocab_progress').upsert(payload, { onConflict: 'user_id,vocab_id' });
    if (result.error) {
      enqueue({ type: 'save_vocab', payload: payload });
      emitSyncStatus('error', '词汇进度同步失败，已加入重试队列');
      return { ok: false, queued: true, reason: result.error.message };
    }

    return { ok: true };
  }

  async function saveLessonProgress(lessonId, masteredCount, totalCount, updatedAt) {
    var client = getClient();
    var userId = await currentUserId();

    var progressPct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
    var payload = {
      user_id: userId,
      lesson_id: lessonId,
      mastered_count: masteredCount,
      total_count: totalCount,
      progress_pct: progressPct,
      updated_at: updatedAt || new Date().toISOString()
    };

    if (!client || !userId) {
      enqueue({ type: 'save_lesson', payload: payload });
      return { ok: false, queued: true };
    }

    var result = await client.from('lesson_progress').upsert(payload, { onConflict: 'user_id,lesson_id' });
    if (result.error) {
      enqueue({ type: 'save_lesson', payload: payload });
      return { ok: false, queued: true, reason: result.error.message };
    }

    return { ok: true };
  }

  async function saveScenarioAttempt(sceneId, score, total, passed, payload) {
    var client = getClient();
    var userId = await currentUserId();

    var record = {
      user_id: userId,
      scene_id: sceneId,
      score: score,
      total: total,
      passed: Boolean(passed),
      attempted_at: new Date().toISOString(),
      payload: payload && typeof payload === 'object' ? payload : {}
    };

    if (!client || !userId) {
      enqueue({ type: 'save_scenario_attempt', payload: record });
      emitSyncStatus('offline', '离线缓存中，恢复在线后自动同步');
      return { ok: false, queued: true };
    }

    var result = await client.from('scenario_attempts').insert(record);
    if (result.error) {
      enqueue({ type: 'save_scenario_attempt', payload: record });
      emitSyncStatus('error', '场景成绩同步失败，已加入重试队列');
      return { ok: false, queued: true, reason: result.error.message };
    }

    return { ok: true };
  }

  async function saveFullStateSnapshot(state, scenarioProgress) {
    var client = getClient();
    var userId = await currentUserId();
    if (!client || !userId) {
      enqueue({ type: 'save_snapshot', payload: { state: state, scenarioProgress: scenarioProgress } });
      emitSyncStatus('offline', '离线缓存中，恢复在线后自动同步');
      return { ok: false, queued: true };
    }

    var user = await global.MiAuth.getUser();
    var userPayload = {
      id: userId,
      email: user && user.email ? user.email : '',
      app_state: {
        state: state || {},
        scenarioProgress: scenarioProgress || {},
        updatedAt: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    };

    var upsertUser = await client.from('users').upsert(userPayload, { onConflict: 'id' });
    if (upsertUser.error) {
      enqueue({ type: 'save_snapshot', payload: { state: state, scenarioProgress: scenarioProgress } });
      emitSyncStatus('error', '云端快照同步失败，已加入重试队列');
      return { ok: false, queued: true, reason: upsertUser.error.message };
    }

    emitSyncStatus('success', '云端同步成功');
    return { ok: true };
  }

  async function loadUserProgress() {
    var client = getClient();
    var userId = await currentUserId();
    if (!client || !userId) {
      return { ok: false, reason: 'no_auth' };
    }

    var userResult = await client.from('users').select('app_state').eq('id', userId).maybeSingle();
    if (userResult.error) {
      return { ok: false, reason: userResult.error.message };
    }

    var vocabResult = await client
      .from('vocab_progress')
      .select('vocab_id,status,updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (vocabResult.error) {
      return { ok: false, reason: vocabResult.error.message };
    }

    var roleResult = await client
      .from('user_roles')
      .select('role_id,updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleResult.error && roleResult.error.code !== 'PGRST116') {
      return { ok: false, reason: roleResult.error.message };
    }

    var lessonResult = await client
      .from('lesson_progress')
      .select('lesson_id,mastered_count,total_count,progress_pct,updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(500);

    if (lessonResult.error) {
      return { ok: false, reason: lessonResult.error.message };
    }

    var attemptsResult = await client
      .from('scenario_attempts')
      .select('scene_id,score,total,passed,payload,attempted_at')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(2000);

    if (attemptsResult.error) {
      return { ok: false, reason: attemptsResult.error.message };
    }

    return {
      ok: true,
      snapshot: userResult.data && userResult.data.app_state ? userResult.data.app_state : null,
      vocabRows: vocabResult.data || [],
      lessonRows: lessonResult.data || [],
      role: roleResult.data || null,
      attempts: attemptsResult.data || []
    };
  }

  function buildScenarioProgressFromAttempts(attempts) {
    var map = {};
    if (!Array.isArray(attempts)) return map;

    attempts.forEach(function eachAttempt(row) {
      if (!row || !row.scene_id) return;
      if (!map[row.scene_id]) {
        map[row.scene_id] = {
          started: true,
          attempts: 0,
          bestScore: 0,
          lastScore: 0,
          total: Number(row.total || 0),
          passedOnce: false,
          updatedAt: row.attempted_at || new Date().toISOString()
        };
      }

      var current = map[row.scene_id];
      current.attempts += 1;
      current.lastScore = Number(row.score || 0);
      current.total = Number(row.total || current.total || 0);
      current.bestScore = Math.max(current.bestScore || 0, Number(row.score || 0));
      current.passedOnce = Boolean(current.passedOnce || row.passed);
      current.updatedAt = row.attempted_at || current.updatedAt;
    });

    return map;
  }

  async function pullAndMergeToLocal() {
    var result = await loadUserProgress();
    if (!result.ok) {
      emitSyncStatus('error', '拉取云端进度失败');
      return result;
    }

    var localState = typeof global.loadState === 'function' ? global.loadState() : null;
    if (!localState || typeof global.saveState !== 'function') {
      emitSyncStatus('error', '本地状态不可用，无法合并');
      return { ok: false, reason: 'local_state_unavailable' };
    }

    if (result.snapshot && result.snapshot.state && typeof result.snapshot.state === 'object') {
      localState = Object.assign({}, localState, result.snapshot.state);
    }

    if (Array.isArray(result.vocabRows) && result.vocabRows.length > 0) {
      localState.vocabStatus = localState.vocabStatus || {};
      result.vocabRows.forEach(function eachVocab(row) {
        if (!row || !row.vocab_id || !row.status) return;
        localState.vocabStatus[row.vocab_id] = row.status;
      });
    }

    if (result.role && result.role.role_id) {
      localState.selectedRole = result.role.role_id;
    }

    var scenarioProgressFromAttempts = buildScenarioProgressFromAttempts(result.attempts);
    if (Object.keys(scenarioProgressFromAttempts).length > 0) {
      try {
        localStorage.setItem('mi-english-scenario-progress-v1', JSON.stringify(scenarioProgressFromAttempts));
      } catch (_) {}
    }

    global.saveState(localState, { skipCloudSync: true });
    emitSyncStatus('success', '进度同步成功');

    return { ok: true, state: localState };
  }

  async function flushQueue() {
    var client = getClient();
    var userId = await currentUserId();

    if (!client || !userId || !navigator.onLine) {
      emitSyncStatus('offline', '离线状态，等待网络恢复后同步');
      return { ok: false, reason: 'offline_or_no_auth' };
    }

    var queue = readQueue();
    if (queue.length === 0) {
      emitSyncStatus('success', '已是最新进度');
      return { ok: true, flushed: 0 };
    }

    var remaining = [];

    for (var i = 0; i < queue.length; i += 1) {
      var op = queue[i].op || {};
      try {
        if (op.type === 'save_vocab') {
          var vocabPayload = Object.assign({}, op.payload, { user_id: userId });
          var vocabResult = await client.from('vocab_progress').upsert(vocabPayload, { onConflict: 'user_id,vocab_id' });
          if (vocabResult.error) throw new Error(vocabResult.error.message);
        } else if (op.type === 'save_lesson') {
          var lessonPayload = Object.assign({}, op.payload, { user_id: userId });
          var lessonResult = await client.from('lesson_progress').upsert(lessonPayload, { onConflict: 'user_id,lesson_id' });
          if (lessonResult.error) throw new Error(lessonResult.error.message);
        } else if (op.type === 'save_scenario_attempt') {
          var attemptPayload = Object.assign({}, op.payload, { user_id: userId });
          var attemptResult = await client.from('scenario_attempts').insert(attemptPayload);
          if (attemptResult.error) throw new Error(attemptResult.error.message);
        } else if (op.type === 'save_snapshot') {
          var snapshotResult = await saveFullStateSnapshot(op.payload.state, op.payload.scenarioProgress);
          if (!snapshotResult.ok) throw new Error(snapshotResult.reason || 'save_snapshot_failed');
        }
      } catch (_) {
        remaining.push(queue[i]);
      }
    }

    writeQueue(remaining);

    if (remaining.length > 0) {
      emitSyncStatus('error', '部分同步失败，稍后重试');
      return { ok: false, remaining: remaining.length };
    }

    emitSyncStatus('success', '离线进度已全部同步');
    return { ok: true, flushed: queue.length };
  }

  function scheduleFlush(delayMs) {
    var wait = Number.isFinite(delayMs) ? delayMs : 800;
    if (flushTimer) {
      clearTimeout(flushTimer);
    }

    flushTimer = setTimeout(function flushSoon() {
      flushQueue();
    }, wait);
  }

  async function syncLocalStateToCloud(state, context) {
    var sceneProgress = {};
    try {
      sceneProgress = JSON.parse(localStorage.getItem('mi-english-scenario-progress-v1') || '{}');
    } catch (_) {
      sceneProgress = {};
    }

    var saveResult = await saveFullStateSnapshot(state, sceneProgress);

    if (!saveResult.ok && saveResult.queued) {
      emitSyncStatus('offline', '离线缓存中，联网后自动同步');
      return saveResult;
    }

    if (context && context.reason === 'login') {
      await pullAndMergeToLocal();
      scheduleFlush(500);
    }

    return saveResult;
  }

  function getLastSyncStatus() {
    try {
      var raw = localStorage.getItem(LAST_SYNC_STATUS_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  global.addEventListener('online', function handleOnline() {
    scheduleFlush(100);
  });

  global.MiApi = {
    emitSyncStatus: emitSyncStatus,
    getLastSyncStatus: getLastSyncStatus,
    loadUserProgress: loadUserProgress,
    saveVocabProgress: saveVocabProgress,
    saveLessonProgress: saveLessonProgress,
    saveScenarioAttempt: saveScenarioAttempt,
    saveUserRole: saveUserRole,
    pullAndMergeToLocal: pullAndMergeToLocal,
    flushQueue: flushQueue,
    scheduleFlush: scheduleFlush,
    syncLocalStateToCloud: syncLocalStateToCloud
  };
})(window);
