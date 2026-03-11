(function initSupabaseConfig(global) {
  'use strict';

  if (global.MI_SUPABASE_CONFIG && global.MI_SUPABASE_CONFIG.url && global.MI_SUPABASE_CONFIG.anonKey) {
    return;
  }

  global.MI_SUPABASE_CONFIG = {
    // Fill these once before running real auth/sync against Supabase.
    url: 'https://hfihddrzhyuoxripwsjy.supabase.co',
    anonKey: 'sb_publishable_qJlt10WVRb99NdF3thDsew_muKxZjqk'
  };
})(window);
