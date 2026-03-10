/**
 * Mi English 存储层 v3.0
 * 变更: 导入导出并入场景/词根进度 + 全量快照回滚 + 写入防崩
 */
const STORAGE_KEY = 'mi-english-v2';
const STORAGE_BACKUP_KEY = `${STORAGE_KEY}-backup-latest`;
const STORAGE_VERSION = '3.0';
const STATUS_VALUES = new Set(['mastered', 'shaky', 'unknown']);
const ALLOWED_TABS = new Set(['index', 'learn', 'practice', 'browse', 'progress', 'scenarios', 'roots']);
const EXTRA_BACKUP_KEYS = Object.freeze({
  rootsState: 'mi-english-roots-v1',
  scenarioProgress: 'mi-english-scenario-progress-v1',
  scenarioMistakes: 'mi-english-scenario-mistakes-v1'
});
const SNAPSHOT_STORAGE_KEYS = [
  STORAGE_KEY,
  ...Object.values(EXTRA_BACKUP_KEYS)
];

// ==================== ACHIEVEMENT DEFINITIONS ====================
const ACHIEVEMENTS = [
  // 词汇量里程碑 (仅统计 vocab, 不含 pattern)
  { id: 'first_word', title: '初见', desc: '标记第一个词汇', icon: '🌱', type: 'vocab', condition: s => countVocabMarked(s) >= 1 },
  { id: 'vocab_10', title: '入门学徒', desc: '掌握10个词汇', icon: '📖', type: 'vocab', condition: s => countVocabStatus(s, 'mastered') >= 10 },
  { id: 'vocab_30', title: '勤学者', desc: '掌握30个词汇', icon: '📚', type: 'vocab', condition: s => countVocabStatus(s, 'mastered') >= 30 },
  { id: 'vocab_50', title: '半百达人', desc: '掌握50个词汇', icon: '🎯', type: 'vocab', condition: s => countVocabStatus(s, 'mastered') >= 50 },
  { id: 'vocab_100', title: '百词斩', desc: '掌握100个词汇', icon: '💯', type: 'vocab', condition: s => countVocabStatus(s, 'mastered') >= 100 },
  { id: 'vocab_200', title: '词汇大师', desc: '掌握200个词汇', icon: '👑', type: 'vocab', condition: s => countVocabStatus(s, 'mastered') >= 200 },
  { id: 'vocab_300', title: '词汇宗师', desc: '掌握300个词汇', icon: '🏅', type: 'vocab', condition: s => countVocabStatus(s, 'mastered') >= 300 },
  { id: 'vocab_500', title: '词汇达人', desc: '掌握500个词汇', icon: '🎖️', type: 'vocab', condition: s => countVocabStatus(s, 'mastered') >= 500 },
  { id: 'vocab_all', title: '全词通关', desc: '掌握全部777个词汇', icon: '🏆', type: 'vocab', condition: s => countVocabStatus(s, 'mastered') >= 777 },

  // 练习相关
  { id: 'first_practice', title: '初次挑战', desc: '完成第一轮练习', icon: '🎮', type: 'practice', condition: s => s.practiceHistory.length >= 1 },
  { id: 'practice_10', title: '练习达人', desc: '完成10轮练习', icon: '💪', type: 'practice', condition: s => s.practiceHistory.length >= 10 },
  { id: 'practice_50', title: '刻意练习', desc: '完成50轮练习', icon: '🔥', type: 'practice', condition: s => s.practiceHistory.length >= 50 },
  { id: 'perfect_round', title: '满分通关', desc: '练习中获得满分', icon: '⭐', type: 'practice', condition: s => s.practiceHistory.some(h => h.score === h.total) },

  // 连续学习
  { id: 'streak_3', title: '三日不辍', desc: '连续学习3天', icon: '🔥', type: 'streak', condition: s => s.streak >= 3 },
  { id: 'streak_7', title: '一周坚持', desc: '连续学习7天', icon: '🌟', type: 'streak', condition: s => s.streak >= 7 },
  { id: 'streak_30', title: '月度之星', desc: '连续学习30天', icon: '🌙', type: 'streak', condition: s => s.streak >= 30 },

  // 课程完成
  { id: 'lesson_complete', title: '课程通关', desc: '完成一整课的全部词汇', icon: '✅', type: 'lesson', condition: s => hasCompletedLesson(s) },
  { id: 'all_lessons', title: '课程全通', desc: '所有课程词汇全部掌握', icon: '🎓', type: 'lesson', condition: s => allLessonsCompleted(s) },
];

// ==================== STATE MANAGEMENT ====================
function getDefaultState() {
  return {
    vocabStatus: {},       // { "L01-V0": "mastered"|"shaky"|"unknown" }
    patternStatus: {},     // { "L01-P0": "mastered"|"shaky"|"unknown" }
    practiceHistory: [],   // [{ date, mode, score, total }]
    achievements: [],      // [{ id, unlockedAt }]
    streak: 0,
    lastStudyDate: null,
    totalSessions: 0,
    level: 1,
    xp: 0,
    selectedRole: null,
    lastTab: 'learn',
    lastLesson: 'all',
    createdAt: new Date().toISOString()
  };
}

// ==================== MIGRATION (v2.0 cardStatus → v2.1 vocabStatus/patternStatus) ====================
function migrateState(state) {
  if (!state.cardStatus) return state; // already migrated or fresh

  state.vocabStatus = state.vocabStatus || {};
  state.patternStatus = state.patternStatus || {};

  if (typeof DATA !== 'undefined') {
    DATA.lessons.forEach(l => {
      l.vocab.forEach(v => {
        if (!state.vocabStatus[v.id] && state.cardStatus[v.en]) {
          state.vocabStatus[v.id] = state.cardStatus[v.en];
        }
      });
      l.patterns.forEach(p => {
        const oldKey = p.template; // getAllPatterns used template as en
        if (!state.patternStatus[p.id] && state.cardStatus[oldKey]) {
          state.patternStatus[p.id] = state.cardStatus[oldKey];
        }
      });
    });
  }

  delete state.cardStatus;
  return state;
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function toSafeInt(value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  const intNum = Math.trunc(num);
  if (intNum < min || intNum > max) return fallback;
  return intNum;
}

function normalizeISODate(value) {
  if (typeof value !== 'string') return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function normalizeDay(value) {
  if (typeof value !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return value;
}

function getDataIdSets() {
  const vocabIds = new Set();
  const patternIds = new Set();
  const lessonIds = new Set();

  if (typeof DATA !== 'undefined' && Array.isArray(DATA.lessons)) {
    DATA.lessons.forEach(lesson => {
      if (!lesson || typeof lesson !== 'object') return;
      if (typeof lesson.id === 'string') lessonIds.add(lesson.id);
      if (Array.isArray(lesson.vocab)) {
        lesson.vocab.forEach(v => {
          if (v && typeof v.id === 'string') vocabIds.add(v.id);
        });
      }
      if (Array.isArray(lesson.patterns)) {
        lesson.patterns.forEach(p => {
          if (p && typeof p.id === 'string') patternIds.add(p.id);
        });
      }
    });
  }

  return { vocabIds, patternIds, lessonIds };
}

function sanitizeStatusMap(input, validIds) {
  if (!isPlainObject(input)) return {};
  const output = {};
  Object.entries(input).forEach(([id, status]) => {
    if (typeof id !== 'string') return;
    if (validIds.size > 0 && !validIds.has(id)) return;
    if (!STATUS_VALUES.has(status)) return;
    output[id] = status;
  });
  return output;
}

function sanitizePracticeHistory(history) {
  if (!Array.isArray(history)) return [];
  const output = [];

  history.forEach(item => {
    if (!isPlainObject(item)) return;
    const score = toSafeInt(item.score, null, 0, 10000);
    const total = toSafeInt(item.total, null, 1, 10000);
    if (score === null || total === null || score > total) return;
    const date = normalizeISODate(item.date) || new Date().toISOString();
    const mode = typeof item.mode === 'string' && item.mode.trim() ? item.mode.trim().slice(0, 40) : 'quiz';
    output.push({ date, mode, score, total });
  });

  // 防止异常文件导入后把 localStorage 撑爆
  return output.slice(-2000);
}

function sanitizeAchievements(achievements) {
  if (!Array.isArray(achievements)) return [];
  const output = [];
  const unlocked = new Set();
  const validIds = new Set(ACHIEVEMENTS.map(a => a.id));

  achievements.forEach(item => {
    if (!isPlainObject(item)) return;
    if (typeof item.id !== 'string' || !validIds.has(item.id) || unlocked.has(item.id)) return;
    const unlockedAt = normalizeISODate(item.unlockedAt) || new Date().toISOString();
    output.push({ id: item.id, unlockedAt });
    unlocked.add(item.id);
  });

  return output;
}

function readLocalJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function sanitizeScenarioProgress(progress) {
  if (!isPlainObject(progress)) return {};
  const output = {};

  Object.entries(progress).forEach(([sceneId, item]) => {
    if (typeof sceneId !== 'string' || !sceneId.trim()) return;
    if (!isPlainObject(item)) return;

    output[sceneId] = {
      started: Boolean(item.started),
      attempts: toSafeInt(item.attempts, 0, 0, 100000),
      bestScore: toSafeInt(item.bestScore, 0, 0, 10000),
      lastScore: toSafeInt(item.lastScore, 0, 0, 10000),
      total: toSafeInt(item.total, 0, 0, 10000),
      passedOnce: Boolean(item.passedOnce),
      updatedAt: normalizeISODate(item.updatedAt) || null
    };
  });

  return output;
}

function sanitizeScenarioMistakes(mistakes) {
  if (!Array.isArray(mistakes)) return [];
  const output = [];

  mistakes.forEach(item => {
    if (!isPlainObject(item)) return;
    const key = typeof item.key === 'string' ? item.key.trim().slice(0, 120) : '';
    if (!key) return;

    output.push({
      key,
      sceneId: typeof item.sceneId === 'string' ? item.sceneId.trim().slice(0, 80) : '',
      sceneTitle: typeof item.sceneTitle === 'string' ? item.sceneTitle.trim().slice(0, 120) : '',
      questionId: typeof item.questionId === 'string' ? item.questionId.trim().slice(0, 80) : '',
      promptEn: typeof item.promptEn === 'string' ? item.promptEn.trim().slice(0, 300) : '',
      promptZh: typeof item.promptZh === 'string' ? item.promptZh.trim().slice(0, 200) : '',
      wrongOption: typeof item.wrongOption === 'string' ? item.wrongOption.trim().slice(0, 240) : '',
      correctOption: typeof item.correctOption === 'string' ? item.correctOption.trim().slice(0, 240) : '',
      savedAt: normalizeISODate(item.savedAt) || new Date().toISOString()
    });
  });

  return output.slice(-500);
}

function sanitizeRootsStateSnapshot(rootsState) {
  if (!isPlainObject(rootsState)) return null;

  const safe = {
    masteredRootIds: [],
    currentRootId: null,
    quizHistory: [],
    streak: 0,
    lastStudyDate: null,
    totalSessions: 0,
    updatedAt: normalizeISODate(rootsState.updatedAt) || new Date().toISOString()
  };

  if (Array.isArray(rootsState.masteredRootIds)) {
    const uniq = [];
    rootsState.masteredRootIds.forEach(id => {
      if (typeof id !== 'string') return;
      const rootId = id.trim();
      if (!rootId || uniq.includes(rootId)) return;
      uniq.push(rootId);
    });
    safe.masteredRootIds = uniq.slice(0, 200);
  }

  if (typeof rootsState.currentRootId === 'string' && rootsState.currentRootId.trim()) {
    safe.currentRootId = rootsState.currentRootId.trim().slice(0, 80);
  }

  if (Array.isArray(rootsState.quizHistory)) {
    safe.quizHistory = rootsState.quizHistory
      .filter(item => isPlainObject(item))
      .map(item => ({
        date: normalizeISODate(item.date) || new Date().toISOString(),
        score: toSafeInt(item.score, 0, 0, 1000),
        total: toSafeInt(item.total, 0, 0, 1000)
      }))
      .slice(-200);
  }

  safe.streak = toSafeInt(rootsState.streak, 0, 0, 36500);
  safe.lastStudyDate = normalizeDay(rootsState.lastStudyDate);
  safe.totalSessions = toSafeInt(rootsState.totalSessions, 0, 0, 1000000);

  return safe;
}

function collectModuleDataForExport() {
  const rootsState = sanitizeRootsStateSnapshot(readLocalJSON(EXTRA_BACKUP_KEYS.rootsState, null));
  const scenarioProgress = sanitizeScenarioProgress(readLocalJSON(EXTRA_BACKUP_KEYS.scenarioProgress, {}));
  const scenarioMistakes = sanitizeScenarioMistakes(readLocalJSON(EXTRA_BACKUP_KEYS.scenarioMistakes, []));

  return {
    // null 代表无词根进度，导入时应清空目标端该模块
    rootsState,
    scenarioProgress,
    scenarioMistakes
  };
}

function sanitizeImportedModules(rawModules) {
  if (!isPlainObject(rawModules)) return { hasModules: false, modules: {} };

  const modules = {};
  if (Object.prototype.hasOwnProperty.call(rawModules, 'rootsState')) {
    modules.rootsState = sanitizeRootsStateSnapshot(rawModules.rootsState);
  }
  if (Object.prototype.hasOwnProperty.call(rawModules, 'scenarioProgress')) {
    modules.scenarioProgress = sanitizeScenarioProgress(rawModules.scenarioProgress);
  }
  if (Object.prototype.hasOwnProperty.call(rawModules, 'scenarioMistakes')) {
    modules.scenarioMistakes = sanitizeScenarioMistakes(rawModules.scenarioMistakes);
  }

  return { hasModules: true, modules };
}

function applyImportedModules(modules, hasModules) {
  if (!hasModules || !isPlainObject(modules)) return;

  const hasRootsState = Object.prototype.hasOwnProperty.call(modules, 'rootsState');
  const hasScenarioProgress = Object.prototype.hasOwnProperty.call(modules, 'scenarioProgress');
  const hasScenarioMistakes = Object.prototype.hasOwnProperty.call(modules, 'scenarioMistakes');

  if (hasRootsState) {
    if (isPlainObject(modules.rootsState)) {
      localStorage.setItem(EXTRA_BACKUP_KEYS.rootsState, JSON.stringify(modules.rootsState));
    } else {
      localStorage.removeItem(EXTRA_BACKUP_KEYS.rootsState);
    }
  } else {
    localStorage.removeItem(EXTRA_BACKUP_KEYS.rootsState);
  }

  if (hasScenarioProgress) {
    localStorage.setItem(EXTRA_BACKUP_KEYS.scenarioProgress, JSON.stringify(modules.scenarioProgress));
  } else {
    localStorage.removeItem(EXTRA_BACKUP_KEYS.scenarioProgress);
  }

  if (hasScenarioMistakes) {
    localStorage.setItem(EXTRA_BACKUP_KEYS.scenarioMistakes, JSON.stringify(modules.scenarioMistakes));
  } else {
    localStorage.removeItem(EXTRA_BACKUP_KEYS.scenarioMistakes);
  }
}

function recalculateLevelFromXP(state) {
  state.level = 1;
  return addXP(state, 0);
}

function sanitizeState(rawState) {
  if (!isPlainObject(rawState)) {
    throw new Error('备份文件中的 state 格式不正确');
  }

  const migrated = migrateState({ ...rawState });
  const { vocabIds, patternIds, lessonIds } = getDataIdSets();
  const safe = getDefaultState();

  safe.vocabStatus = sanitizeStatusMap(migrated.vocabStatus, vocabIds);
  safe.patternStatus = sanitizeStatusMap(migrated.patternStatus, patternIds);
  safe.practiceHistory = sanitizePracticeHistory(migrated.practiceHistory);
  safe.achievements = sanitizeAchievements(migrated.achievements);
  safe.streak = toSafeInt(migrated.streak, 0, 0, 36500);
  safe.totalSessions = toSafeInt(migrated.totalSessions, 0, 0, 1000000);
  safe.xp = toSafeInt(migrated.xp, 0, 0, 10000000);
  safe.lastStudyDate = normalizeDay(migrated.lastStudyDate);
  if (typeof migrated.selectedRole === 'string' && migrated.selectedRole.trim()) {
    safe.selectedRole = migrated.selectedRole.trim();
  }
  safe.lastTab = (typeof migrated.lastTab === 'string' && ALLOWED_TABS.has(migrated.lastTab)) ? migrated.lastTab : 'learn';
  safe.lastLesson = (typeof migrated.lastLesson === 'string' && (migrated.lastLesson === 'all' || lessonIds.has(migrated.lastLesson)))
    ? migrated.lastLesson
    : 'all';
  safe.createdAt = normalizeISODate(migrated.createdAt) || safe.createdAt;

  return recalculateLevelFromXP(safe);
}

function createStorageSnapshot() {
  const snapshot = {};
  SNAPSHOT_STORAGE_KEYS.forEach(key => {
    const raw = localStorage.getItem(key);
    snapshot[key] = typeof raw === 'string' ? raw : null;
  });
  return snapshot;
}

function backupCurrentState(reason) {
  try {
    const snapshot = createStorageSnapshot();
    const hasAnyData = Object.values(snapshot).some(value => typeof value === 'string' && value.length > 0);
    if (!hasAnyData) return null;

    const backup = {
      app: 'Mi English',
      type: 'local-backup',
      reason: reason || 'manual',
      createdAt: new Date().toISOString(),
      // legacy raw: keep for backward compatibility
      raw: snapshot[STORAGE_KEY] || null,
      snapshot
    };
    localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(backup));
    return backup.createdAt;
  } catch {
    return null;
  }
}

function restoreLatestBackup() {
  try {
    const raw = localStorage.getItem(STORAGE_BACKUP_KEY);
    if (!raw) return false;
    const backup = JSON.parse(raw);

    if (isPlainObject(backup.snapshot)) {
      SNAPSHOT_STORAGE_KEYS.forEach(key => {
        const value = backup.snapshot[key];
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        } else {
          localStorage.removeItem(key);
        }
      });
      return true;
    }

    // 兼容旧版备份结构
    if (backup && typeof backup.raw === 'string') {
      localStorage.setItem(STORAGE_KEY, backup.raw);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function clearAllStoredData() {
  SNAPSHOT_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem(STORAGE_BACKUP_KEY);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    return sanitizeState(parsed);
  } catch {
    return getDefaultState();
  }
}

let cloudSyncTimer = null;
let isCloudSyncRunning = false;

function readScenarioProgressSnapshot() {
  try {
    const raw = localStorage.getItem(EXTRA_BACKUP_KEYS.scenarioProgress);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function scheduleCloudSync(state, reason) {
  if (typeof window === 'undefined' || !window.MiApi || typeof window.MiApi.syncLocalStateToCloud !== 'function') {
    return;
  }

  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(async () => {
    if (isCloudSyncRunning) return;
    isCloudSyncRunning = true;
    try {
      await window.MiApi.syncLocalStateToCloud(state, { reason: reason || 'save_state' });
      if (typeof window.MiApi.scheduleFlush === 'function') {
        window.MiApi.scheduleFlush(200);
      }
    } catch {
      // keep local-first UX
    } finally {
      isCloudSyncRunning = false;
    }
  }, 900);
}

function saveState(state, options = {}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!options.skipCloudSync) {
      scheduleCloudSync(state, options.reason || 'save_state');
    }
    return true;
  } catch {
    // iOS 隐私模式/配额不足下避免直接抛错导致页面逻辑中断
    return false;
  }
}

// ==================== UNIFIED SESSION INIT ====================
/**
 * Call once per page load. Handles streak update + daily XP.
 * Returns { state, dailyXPEarned, isNewDay }.
 */
function initSession(state) {
  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = state.lastStudyDate !== today;

  state = updateStreak(state);

  let dailyXPEarned = 0;
  if (isNewDay) {
    state = addXP(state, XP_REWARDS.dailyLogin);
    dailyXPEarned = XP_REWARDS.dailyLogin;
  }

  saveState(state);
  return { state, dailyXPEarned, isNewDay };
}

// ==================== STREAK ====================
function updateStreak(state) {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastStudyDate === today) return state;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (state.lastStudyDate === yesterday) {
    state.streak++;
  } else if (state.lastStudyDate !== today) {
    state.streak = 1;
  }
  state.lastStudyDate = today;
  state.totalSessions++;
  return state;
}

// ==================== LEVEL SYSTEM ====================
const LEVEL_THRESHOLDS = [0, 50, 120, 220, 350, 520, 740, 1000, 1320, 1700, 2150];
const LEVEL_NAMES = ['新手', '学徒', '初学者', '进阶者', '实践者', '熟练者', '精通者', '专家', '大师', '宗师', '传说'];

function addXP(state, amount) {
  state.xp += amount;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (state.xp >= LEVEL_THRESHOLDS[i]) {
      state.level = i + 1;
      break;
    }
  }
  return state;
}

function isMaxLevel(state) {
  return state.level >= LEVEL_THRESHOLDS.length;
}

function getXPForNextLevel(state) {
  if (isMaxLevel(state)) return Infinity;
  return LEVEL_THRESHOLDS[state.level] || Infinity;
}

function getCurrentLevelXP(state) {
  const prev = LEVEL_THRESHOLDS[state.level - 1] || 0;
  return state.xp - prev;
}

function getNeededLevelXP(state) {
  if (isMaxLevel(state)) return 1; // avoid division by zero
  const prev = LEVEL_THRESHOLDS[state.level - 1] || 0;
  const next = LEVEL_THRESHOLDS[state.level] || prev + 500;
  return next - prev;
}

function getLevelName(level) {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
}

// ==================== STATUS COUNTING ====================
function countVocabStatus(state, status) {
  return Object.values(state.vocabStatus).filter(s => s === status).length;
}

function countPatternStatus(state, status) {
  return Object.values(state.patternStatus).filter(s => s === status).length;
}

function countVocabMarked(state) {
  return Object.keys(state.vocabStatus).length;
}

// Backward compat alias — counts vocab only
function countStatus(state, status) {
  return countVocabStatus(state, status);
}

// ==================== ACHIEVEMENT HELPERS ====================
function hasCompletedLesson(state) {
  if (typeof DATA === 'undefined') return false;
  return DATA.lessons.some(l => {
    if (!l.vocab.length) return false;
    return l.vocab.every(v => state.vocabStatus[v.id] === 'mastered');
  });
}

function allLessonsCompleted(state) {
  if (typeof DATA === 'undefined') return false;
  return DATA.lessons.every(l => {
    if (!l.vocab.length) return true;
    return l.vocab.every(v => state.vocabStatus[v.id] === 'mastered');
  });
}

function checkAchievements(state) {
  const newlyUnlocked = [];
  const unlockedIds = new Set(state.achievements.map(a => a.id));
  ACHIEVEMENTS.forEach(a => {
    if (!unlockedIds.has(a.id) && a.condition(state)) {
      const achievement = { id: a.id, unlockedAt: new Date().toISOString() };
      state.achievements.push(achievement);
      newlyUnlocked.push({ ...a, ...achievement });
    }
  });
  return newlyUnlocked;
}

function getAchievementDef(id) {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// ==================== DATA EXPORT / IMPORT ====================
function exportData(state) {
  const safeState = sanitizeState(state);
  const modules = collectModuleDataForExport();
  const data = {
    exportedAt: new Date().toISOString(),
    version: STORAGE_VERSION,
    app: 'Mi English',
    state: safeState,
    modules
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mi-english-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      let payload;
      try {
        payload = JSON.parse(e.target.result);
      } catch {
        reject(new Error('文件解析失败'));
        return;
      }

      if (!isPlainObject(payload) || payload.app !== 'Mi English' || !payload.state) {
        reject(new Error('无效的备份文件'));
        return;
      }

      let sanitized;
      let imported;
      try {
        sanitized = sanitizeState(payload.state);
        imported = sanitizeImportedModules(payload.modules);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('备份文件格式不正确'));
        return;
      }

      const backupAt = backupCurrentState('pre-import');
      try {
        const saved = saveState(sanitized);
        if (!saved) {
          throw new Error('导入写入失败');
        }
        applyImportedModules(imported.modules, imported.hasModules);
        resolve({ state: sanitized, backupAt, modulesImported: imported.hasModules });
      } catch {
        const restored = restoreLatestBackup();
        if (restored) {
          reject(new Error('导入失败，已自动回滚到导入前状态'));
        } else {
          reject(new Error('导入失败，且无法自动回滚，请手动检查'));
        }
      }
    };
    reader.readAsText(file);
  });
}

// ==================== XP REWARDS ====================
const XP_REWARDS = {
  markCard: 2,
  masterCard: 5,
  practiceRound: 10,
  perfectRound: 25,
  dailyLogin: 15,
};

// ==================== UTILITY ====================
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
