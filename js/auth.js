(function initAuth(global) {
  'use strict';

  var STORAGE_SESSION_HINT = 'mi-auth-last-email';
  var authClient = null;

  function readConfig() {
    if (global.MI_SUPABASE_CONFIG && global.MI_SUPABASE_CONFIG.url && global.MI_SUPABASE_CONFIG.anonKey) {
      return global.MI_SUPABASE_CONFIG;
    }

    var urlMeta = document.querySelector('meta[name="mi-supabase-url"]');
    var keyMeta = document.querySelector('meta[name="mi-supabase-anon-key"]');

    return {
      url: urlMeta ? urlMeta.getAttribute('content') : '',
      anonKey: keyMeta ? keyMeta.getAttribute('content') : ''
    };
  }

  function ensureClient() {
    if (authClient) return { ok: true, client: authClient };

    var config = readConfig();
    if (!config.url || !config.anonKey) {
      return { ok: false, error: 'missing_config' };
    }

    if (!global.supabase || typeof global.supabase.createClient !== 'function') {
      return { ok: false, error: 'missing_sdk' };
    }

    authClient = global.supabase.createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    return { ok: true, client: authClient };
  }

  async function signInWithEmail(email, password) {
    var setup = ensureClient();
    if (!setup.ok) return { ok: false, error: setup.error };

    var result = await setup.client.auth.signInWithPassword({ email: email, password: password });
    if (result.error) return { ok: false, error: result.error.message };

    try {
      localStorage.setItem(STORAGE_SESSION_HINT, email || '');
    } catch (_) {}

    return { ok: true, data: result.data };
  }

  async function signUpWithEmail(email, password) {
    var setup = ensureClient();
    if (!setup.ok) return { ok: false, error: setup.error };

    var result = await setup.client.auth.signUp({ email: email, password: password });
    if (result.error) return { ok: false, error: result.error.message };

    try {
      localStorage.setItem(STORAGE_SESSION_HINT, email || '');
    } catch (_) {}

    return { ok: true, data: result.data };
  }

  async function signOut() {
    var setup = ensureClient();
    if (!setup.ok) return { ok: false, error: setup.error };

    var result = await setup.client.auth.signOut();
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true };
  }

  async function getSession() {
    var setup = ensureClient();
    if (!setup.ok) return { ok: false, error: setup.error, session: null };

    var result = await setup.client.auth.getSession();
    if (result.error) return { ok: false, error: result.error.message, session: null };
    return { ok: true, session: result.data.session || null };
  }

  async function getUser() {
    var sessionResult = await getSession();
    if (!sessionResult.ok || !sessionResult.session || !sessionResult.session.user) {
      return null;
    }
    return sessionResult.session.user;
  }

  function onAuthStateChange(handler) {
    var setup = ensureClient();
    if (!setup.ok) return { data: { subscription: null } };

    return setup.client.auth.onAuthStateChange(function wrapped(event, session) {
      if (typeof handler === 'function') {
        handler(event, session || null);
      }

      try {
        global.dispatchEvent(new CustomEvent('mi-auth-changed', {
          detail: {
            event: event,
            session: session || null
          }
        }));
      } catch (_) {}
    });
  }

  function getClient() {
    var setup = ensureClient();
    return setup.ok ? setup.client : null;
  }

  function getLastEmailHint() {
    try {
      return localStorage.getItem(STORAGE_SESSION_HINT) || '';
    } catch (_) {
      return '';
    }
  }

  global.MiAuth = {
    ensureClient: ensureClient,
    getClient: getClient,
    signInWithEmail: signInWithEmail,
    signUpWithEmail: signUpWithEmail,
    signOut: signOut,
    getSession: getSession,
    getUser: getUser,
    onAuthStateChange: onAuthStateChange,
    getLastEmailHint: getLastEmailHint
  };
})(window);
