(function initAnalytics(global) {
  'use strict';

  var EVENT_KEY = 'mi-english-events-v3';
  var MAX_EVENTS = 1000;

  function safeReadEvents() {
    try {
      var raw = localStorage.getItem(EVENT_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function safeSaveEvents(events) {
    try {
      localStorage.setItem(EVENT_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
      return true;
    } catch (_) {
      return false;
    }
  }

  function trackEvent(name, payload) {
    if (typeof name !== 'string' || !name.trim()) return;

    var item = {
      id: 'evt_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
      name: name.trim(),
      payload: payload && typeof payload === 'object' ? payload : {},
      createdAt: new Date().toISOString()
    };

    var events = safeReadEvents();
    events.push(item);
    safeSaveEvents(events);

    if (global.console && typeof global.console.info === 'function') {
      global.console.info('[analytics]', item.name, item.payload);
    }

    return item;
  }

  function getEvents() {
    return safeReadEvents();
  }

  global.MiAnalytics = {
    trackEvent: trackEvent,
    getEvents: getEvents
  };
})(window);
