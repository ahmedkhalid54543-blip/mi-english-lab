(function initTrainerGuard(global) {
  'use strict';

  var cachedAccess = null;
  var pendingAccess = null;
  var authWatcherBound = false;

  function remember(result) {
    cachedAccess = result;
    return result;
  }

  function getClient() {
    if (!global.MiAuth || typeof global.MiAuth.getClient !== 'function') return null;
    return global.MiAuth.getClient();
  }

  async function resolveAccess(options) {
    var settings = options || {};

    if (settings.refresh) {
      cachedAccess = null;
    }

    if (cachedAccess) {
      return cachedAccess;
    }

    if (pendingAccess) {
      return pendingAccess;
    }

    pendingAccess = (async function fetchAccess() {
      var client = getClient();
      if (!client) {
        return remember({ ok: false, reason: 'missing_config' });
      }

      if (!global.MiAuth || typeof global.MiAuth.getSession !== 'function') {
        return remember({ ok: false, reason: 'auth_unavailable' });
      }

      var sessionResult = await global.MiAuth.getSession();
      if (!sessionResult || !sessionResult.ok) {
        return remember({
          ok: false,
          reason: 'auth_error',
          message: sessionResult && sessionResult.error ? sessionResult.error : 'auth_unavailable'
        });
      }

      var session = sessionResult.session;
      var user = session && session.user ? session.user : null;
      if (!user || !user.id) {
        return remember({ ok: false, reason: 'no_session' });
      }

      var cohortResult = await client
        .from('cohorts')
        .select('id,name,code,is_active')
        .eq('trainer_user_id', user.id)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (cohortResult.error) {
        return remember({
          ok: false,
          reason: 'query_failed',
          message: cohortResult.error.message,
          userId: user.id
        });
      }

      var cohorts = Array.isArray(cohortResult.data) ? cohortResult.data.filter(Boolean) : [];
      if (!cohorts.length) {
        return remember({
          ok: false,
          reason: 'forbidden',
          userId: user.id,
          cohortIds: [],
          cohorts: []
        });
      }

      return remember({
        ok: true,
        role: 'trainer',
        userId: user.id,
        cohortIds: cohorts.map(function eachCohort(cohort) {
          return cohort.id;
        }),
        cohorts: cohorts
      });
    })();

    try {
      return await pendingAccess;
    } finally {
      pendingAccess = null;
    }
  }

  function describeFailure(result) {
    var reason = result && result.reason ? result.reason : 'forbidden';

    if (reason === 'missing_config') {
      return 'Supabase 未配置，无法验证 trainer 权限。';
    }

    if (reason === 'auth_unavailable' || reason === 'auth_error') {
      return '登录状态读取失败，无法确认当前账号是否有 trainer 权限。';
    }

    if (reason === 'no_session') {
      return '请先登录已绑定 trainer cohort 的账号，再进入周报页。';
    }

    if (reason === 'query_failed') {
      return '权限校验查询失败。请确认最新 RLS 已部署，且 cohort 已绑定 trainer_user_id。';
    }

    return '当前账号未绑定任何 trainer cohort，系统不会展示 trainer 周报。';
  }

  function applyTrainerEntryVisibility(result) {
    var nodes = global.document ? global.document.querySelectorAll('[data-trainer-entry]') : [];
    var canAccess = Boolean(result && result.ok);

    Array.prototype.forEach.call(nodes, function eachNode(node) {
      node.hidden = !canAccess;
      if (canAccess) {
        node.style.removeProperty('display');
      } else {
        node.style.display = 'none';
      }
    });

    return result;
  }

  async function syncTrainerEntryVisibility(options) {
    var result = await resolveAccess(options);
    return applyTrainerEntryVisibility(result);
  }

  function bindAuthWatcher() {
    if (authWatcherBound || !global.addEventListener) return;
    authWatcherBound = true;

    global.addEventListener('mi-auth-changed', function handleAuthChanged() {
      cachedAccess = null;
      syncTrainerEntryVisibility({ refresh: true });
    });
  }

  bindAuthWatcher();

  if (global.document) {
    global.document.addEventListener('DOMContentLoaded', function onReady() {
      syncTrainerEntryVisibility();
    });
  }

  global.MiTrainerGuard = {
    resolveAccess: resolveAccess,
    syncTrainerEntryVisibility: syncTrainerEntryVisibility,
    describeFailure: describeFailure
  };
})(window);
