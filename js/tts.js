(function initSpeechLayer() {
  const hasWindow = typeof window !== 'undefined';
  const hasTTS = hasWindow
    && 'speechSynthesis' in window
    && 'SpeechSynthesisUtterance' in window;
  const hasAudio = hasWindow && typeof window.Audio === 'function';

  const synth = hasTTS ? window.speechSynthesis : null;
  let voices = [];
  let primed = false;
  let currentAudio = null;
  const brokenAudioSources = new Set();

  function normalizeText(text) {
    return String(text || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function refreshVoices() {
    if (!synth) return [];
    voices = synth.getVoices() || [];
    return voices;
  }

  if (hasTTS) {
    refreshVoices();
    if (typeof synth.onvoiceschanged !== 'undefined') {
      synth.onvoiceschanged = refreshVoices;
    }
  }

  function primeSpeechEngine() {
    if (!hasTTS || primed) return;
    primed = true;
    try {
      synth.resume();
    } catch {
      // ignore
    }
    refreshVoices();
  }

  if (hasWindow && typeof document !== 'undefined') {
    const bootstrap = function bootstrap() {
      primeSpeechEngine();
    };

    ['pointerdown', 'touchstart', 'keydown'].forEach(eventName => {
      document.addEventListener(eventName, bootstrap, { passive: true, once: true, capture: true });
    });

    if (hasTTS) {
      document.addEventListener('visibilitychange', function onVisibilityChange() {
        if (document.visibilityState === 'visible') {
          try {
            synth.resume();
          } catch {
            // ignore
          }
        }
      });
    }
  }

  function pickEnglishVoice(lang) {
    const list = voices.length ? voices : refreshVoices();
    if (!list.length) return null;

    const targetLang = (lang || 'en-US').toLowerCase();
    const exact = list.find(v => (v.lang || '').toLowerCase() === targetLang);
    if (exact) return exact;

    const base = targetLang.split('-')[0];
    const sameBase = list.filter(v => (v.lang || '').toLowerCase().startsWith(base));
    if (!sameBase.length) return null;

    const preferredNames = [
      'Samantha', 'Alex', 'Google US English', 'Google UK English Female',
      'Karen', 'Daniel', 'Serena', 'Aria', 'Jenny', 'Evan'
    ];

    for (const name of preferredNames) {
      const matched = sameBase.find(v => (v.name || '').includes(name));
      if (matched) return matched;
    }
    return sameBase[0];
  }

  function readAudioManifest() {
    const raw = hasWindow ? window.MI_AUDIO_MANIFEST : null;
    if (!raw || typeof raw !== 'object') return {};
    if (raw.entries && typeof raw.entries === 'object') return raw.entries;
    return {};
  }

  function resolveAudioSource(text, options) {
    const opts = options && typeof options === 'object' ? options : {};

    if (typeof opts.audioSrc === 'string' && opts.audioSrc.trim()) {
      return opts.audioSrc.trim();
    }

    const entries = readAudioManifest();

    if (typeof opts.audioKey === 'string' && opts.audioKey.trim()) {
      const keyRaw = opts.audioKey.trim();
      const byRaw = entries[keyRaw];
      if (typeof byRaw === 'string' && byRaw.trim()) return byRaw.trim();
      const byNormalized = entries[normalizeText(keyRaw)];
      if (typeof byNormalized === 'string' && byNormalized.trim()) return byNormalized.trim();
    }

    const byText = entries[normalizeText(text)];
    if (typeof byText === 'string' && byText.trim()) return byText.trim();

    return '';
  }

  function stopAudio() {
    if (!currentAudio) return;
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }

  function stopTTS() {
    if (!hasTTS) return;
    try {
      synth.cancel();
    } catch {
      // ignore
    }
  }

  function stopAll() {
    stopAudio();
    stopTTS();
  }

  function speakTTS(text, options) {
    if (!hasTTS) return { ok: false, reason: 'unsupported' };

    const phrase = String(text || '').trim();
    if (!phrase) return { ok: false, reason: 'empty' };

    const opts = options && typeof options === 'object' ? options : {};
    const lang = typeof opts.lang === 'string' ? opts.lang : 'en-US';

    try {
      primeSpeechEngine();
      stopAudio();
      synth.cancel();

      const utter = new SpeechSynthesisUtterance(phrase);
      utter.lang = lang;
      utter.rate = Number.isFinite(opts.rate) ? opts.rate : 0.92;
      utter.pitch = Number.isFinite(opts.pitch) ? opts.pitch : 1;
      utter.volume = Number.isFinite(opts.volume) ? opts.volume : 1;

      const voice = pickEnglishVoice(lang);
      if (voice) utter.voice = voice;

      synth.speak(utter);
      if (synth.paused) synth.resume();
      return { ok: true, mode: 'tts' };
    } catch (error) {
      return { ok: false, reason: 'error', error };
    }
  }

  function playAudioFile(source, fallbackText, options) {
    if (!hasAudio || !source || brokenAudioSources.has(source)) return false;

    stopAll();

    const audio = new Audio(source);
    audio.preload = 'auto';
    if (options && Number.isFinite(options.volume)) {
      audio.volume = options.volume;
    }

    currentAudio = audio;
    let settled = false;

    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      if (currentAudio === audio) currentAudio = null;
    };

    const fallback = () => {
      if (settled) return;
      settled = true;
      brokenAudioSources.add(source);
      cleanup();
      speakTTS(fallbackText, { ...(options || {}), preferAudio: false });
    };

    audio.onended = () => {
      settled = true;
      cleanup();
    };
    audio.onerror = fallback;

    try {
      const promise = audio.play();
      if (promise && typeof promise.then === 'function') {
        promise.catch(fallback);
      }
      return true;
    } catch {
      cleanup();
      return false;
    }
  }

  function supported() {
    return hasAudio || hasTTS;
  }

  function speak(text, options) {
    const phrase = String(text || '').trim();
    if (!phrase) return { ok: false, reason: 'empty' };

    const opts = options && typeof options === 'object' ? options : {};
    if (opts.preferAudio !== false) {
      const source = resolveAudioSource(phrase, opts);
      if (source && playAudioFile(source, phrase, opts)) {
        return { ok: true, mode: 'audio', source };
      }
    }

    return speakTTS(phrase, opts);
  }

  // Legacy API: preserve old calls that only want browser TTS.
  window.MiTTS = {
    supported: function supportedTTS() { return hasTTS; },
    speak: speakTTS,
    stop: stopTTS
  };

  // New API: hybrid mode (local audio first, then TTS fallback).
  window.MiSpeech = {
    supported,
    speak,
    speakTTS,
    stop: stopAll,
    resolveAudioSource
  };
})();
