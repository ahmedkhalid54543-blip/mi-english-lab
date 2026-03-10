/**
 * Mi English 词根学习模块 v0.1
 */

const ROOT_STORAGE_KEY = 'mi-english-roots-v1';

const ROOTS_DATA = [
  {
    id: 'spect',
    root: 'spect',
    origin: 'Latin',
    meaningZh: '看',
    meaningEn: 'to look',
    note: '和“视觉、观察”相关。',
    examples: [
      { word: 'inspect', breakdown: 'in + spect', meaning: '检查', sentence: 'Please inspect the display shelf before opening.' },
      { word: 'respect', breakdown: 're + spect', meaning: '尊重', sentence: 'Respect every customer question.' },
      { word: 'spectator', breakdown: 'spect + ator', meaning: '观众', sentence: 'The spectator area is near the entrance.' }
    ]
  },
  {
    id: 'port',
    root: 'port',
    origin: 'Latin',
    meaningZh: '拿、带',
    meaningEn: 'to carry',
    note: '和“运输、携带、支持”相关。',
    examples: [
      { word: 'transport', breakdown: 'trans + port', meaning: '运输', sentence: 'Transport cost affects our final price.' },
      { word: 'import', breakdown: 'im + port', meaning: '进口', sentence: 'We import some accessories for this model.' },
      { word: 'portable', breakdown: 'port + able', meaning: '便携的', sentence: 'This speaker is portable and easy to carry.' }
    ]
  },
  {
    id: 'dict',
    root: 'dict',
    origin: 'Latin',
    meaningZh: '说',
    meaningEn: 'to say',
    note: '和“表达、命令、预测”相关。',
    examples: [
      { word: 'predict', breakdown: 'pre + dict', meaning: '预测', sentence: 'Can you predict next week footfall?' },
      { word: 'dictionary', breakdown: 'dict + ionary', meaning: '词典', sentence: 'Use a dictionary to check pronunciation.' },
      { word: 'contradict', breakdown: 'contra + dict', meaning: '反驳', sentence: 'Data should support, not contradict, your report.' }
    ]
  },
  {
    id: 'scrib',
    root: 'scrib/script',
    origin: 'Latin',
    meaningZh: '写',
    meaningEn: 'to write',
    note: '和“描述、记录、签字”相关。',
    examples: [
      { word: 'describe', breakdown: 'de + scribe', meaning: '描述', sentence: 'Describe the customer issue clearly.' },
      { word: 'subscribe', breakdown: 'sub + scribe', meaning: '订阅', sentence: 'Subscribe to the weekly training update.' },
      { word: 'manuscript', breakdown: 'manu + script', meaning: '手稿', sentence: 'Please review the manuscript before publishing.' }
    ]
  },
  {
    id: 'vis',
    root: 'vis/vid',
    origin: 'Latin',
    meaningZh: '看见',
    meaningEn: 'to see',
    note: '和“可见、视觉、证据”相关。',
    examples: [
      { word: 'visible', breakdown: 'vis + ible', meaning: '可见的', sentence: 'The promotion sign must be visible.' },
      { word: 'video', breakdown: 'vid + eo', meaning: '视频', sentence: 'The display screen loops a product video.' },
      { word: 'evidence', breakdown: 'e + vid + ence', meaning: '证据', sentence: 'Show evidence when reporting a pricing issue.' }
    ]
  },
  {
    id: 'aud',
    root: 'aud',
    origin: 'Latin',
    meaningZh: '听',
    meaningEn: 'to hear',
    note: '和“音频、听众、审计”相关。',
    examples: [
      { word: 'audio', breakdown: 'aud + io', meaning: '音频', sentence: 'The audio quality is better on this model.' },
      { word: 'audience', breakdown: 'aud + ience', meaning: '听众', sentence: 'Know your audience before presenting.' },
      { word: 'auditor', breakdown: 'aud + itor', meaning: '审计员', sentence: 'An auditor may check our inventory records.' }
    ]
  },
  {
    id: 'graph',
    root: 'graph',
    origin: 'Greek',
    meaningZh: '写、画',
    meaningEn: 'to write/draw',
    note: '和“图像、图表、记录”相关。',
    examples: [
      { word: 'photograph', breakdown: 'photo + graph', meaning: '照片', sentence: 'Use a clear photograph in the report.' },
      { word: 'biography', breakdown: 'bio + graphy', meaning: '传记', sentence: 'The trainer shared a short biography.' },
      { word: 'graphic', breakdown: 'graph + ic', meaning: '图形化的', sentence: 'A graphic summary is easier to read.' }
    ]
  },
  {
    id: 'bio',
    root: 'bio',
    origin: 'Greek',
    meaningZh: '生命',
    meaningEn: 'life',
    note: '和“生物、生态、个人信息”相关。',
    examples: [
      { word: 'biology', breakdown: 'bio + logy', meaning: '生物学', sentence: 'She studied biology at university.' },
      { word: 'biography', breakdown: 'bio + graphy', meaning: '传记', sentence: 'Add a short biography in your profile.' },
      { word: 'antibiotic', breakdown: 'anti + bio + tic', meaning: '抗生素', sentence: 'Antibiotic is common in medical English.' }
    ]
  },
  {
    id: 'tele',
    root: 'tele',
    origin: 'Greek',
    meaningZh: '远',
    meaningEn: 'far',
    note: '和“远程、远距离通信”相关。',
    examples: [
      { word: 'telephone', breakdown: 'tele + phone', meaning: '电话', sentence: 'Please confirm this by telephone.' },
      { word: 'television', breakdown: 'tele + vision', meaning: '电视', sentence: 'The ad is on television this week.' },
      { word: 'telescope', breakdown: 'tele + scope', meaning: '望远镜', sentence: 'Telescope literally means seeing far.' }
    ]
  },
  {
    id: 'phon',
    root: 'phon',
    origin: 'Greek',
    meaningZh: '声音',
    meaningEn: 'sound/voice',
    note: '和“声音、发声设备”相关。',
    examples: [
      { word: 'microphone', breakdown: 'micro + phone', meaning: '麦克风', sentence: 'Use a microphone in large training rooms.' },
      { word: 'symphony', breakdown: 'sym + phon + y', meaning: '交响乐', sentence: 'Symphony combines many sounds together.' },
      { word: 'phonetic', breakdown: 'phon + etic', meaning: '语音的', sentence: 'Check the phonetic symbols when learning words.' }
    ]
  },
  {
    id: 'ject',
    root: 'ject',
    origin: 'Latin',
    meaningZh: '扔、投',
    meaningEn: 'to throw',
    note: '和“项目、拒绝、注入”相关。',
    examples: [
      { word: 'project', breakdown: 'pro + ject', meaning: '项目', sentence: 'This project focuses on store operations.' },
      { word: 'reject', breakdown: 're + ject', meaning: '拒绝', sentence: 'Do not reject feedback too quickly.' },
      { word: 'inject', breakdown: 'in + ject', meaning: '注入', sentence: 'Inject new ideas into the training design.' }
    ]
  },
  {
    id: 'tract',
    root: 'tract',
    origin: 'Latin',
    meaningZh: '拉、拖',
    meaningEn: 'to pull',
    note: '和“吸引、收缩、提取”相关。',
    examples: [
      { word: 'attract', breakdown: 'at + tract', meaning: '吸引', sentence: 'Good service can attract repeat customers.' },
      { word: 'contract', breakdown: 'con + tract', meaning: '合同 / 收缩', sentence: 'Please review the contract terms carefully.' },
      { word: 'extract', breakdown: 'ex + tract', meaning: '提取', sentence: 'Extract key points from the meeting notes.' }
    ]
  },
  {
    id: 'cred',
    root: 'cred',
    origin: 'Latin',
    meaningZh: '相信',
    meaningEn: 'to believe',
    note: '和“信用、可信度”相关。',
    examples: [
      { word: 'credit', breakdown: 'cred + it', meaning: '信用', sentence: 'Brand credit takes years to build.' },
      { word: 'credible', breakdown: 'cred + ible', meaning: '可信的', sentence: 'Use credible data in your report.' },
      { word: 'incredible', breakdown: 'in + cred + ible', meaning: '难以置信的', sentence: 'The campaign result was incredible.' }
    ]
  },
  {
    id: 'rupt',
    root: 'rupt',
    origin: 'Latin',
    meaningZh: '打破',
    meaningEn: 'to break',
    note: '和“中断、破裂、腐败”相关。',
    examples: [
      { word: 'interrupt', breakdown: 'inter + rupt', meaning: '打断', sentence: 'Do not interrupt customers while they speak.' },
      { word: 'erupt', breakdown: 'e + rupt', meaning: '爆发', sentence: 'Complaints may erupt if service is slow.' },
      { word: 'corrupt', breakdown: 'cor + rupt', meaning: '腐败的', sentence: 'Corrupt data leads to wrong decisions.' }
    ]
  },
  {
    id: 'struct',
    root: 'struct',
    origin: 'Latin',
    meaningZh: '建造',
    meaningEn: 'to build',
    note: '和“结构、建设、指导”相关。',
    examples: [
      { word: 'structure', breakdown: 'struct + ure', meaning: '结构', sentence: 'A clear structure improves readability.' },
      { word: 'construct', breakdown: 'con + struct', meaning: '建造', sentence: 'Construct a clear learning path first.' },
      { word: 'instruct', breakdown: 'in + struct', meaning: '指导', sentence: 'Managers instruct new staff on SOP.' }
    ]
  },
  {
    id: 'form',
    root: 'form',
    origin: 'Latin',
    meaningZh: '形状',
    meaningEn: 'shape',
    note: '和“形成、信息表单、转化”相关。',
    examples: [
      { word: 'inform', breakdown: 'in + form', meaning: '通知', sentence: 'Please inform the team before launch.' },
      { word: 'transform', breakdown: 'trans + form', meaning: '转变', sentence: 'Training can transform communication quality.' },
      { word: 'uniform', breakdown: 'uni + form', meaning: '制服 / 统一的', sentence: 'Uniform standards keep the store consistent.' }
    ]
  },
  {
    id: 'chron',
    root: 'chron',
    origin: 'Greek',
    meaningZh: '时间',
    meaningEn: 'time',
    note: '和“时间顺序、同步”相关。',
    examples: [
      { word: 'chronological', breakdown: 'chron + ological', meaning: '按时间顺序的', sentence: 'List events in chronological order.' },
      { word: 'synchronize', breakdown: 'syn + chron + ize', meaning: '同步', sentence: 'Let us synchronize the weekly report format.' },
      { word: 'chronic', breakdown: 'chron + ic', meaning: '长期的', sentence: 'Chronic stock issues need root-cause fixes.' }
    ]
  },
  {
    id: 'manu',
    root: 'manu',
    origin: 'Latin',
    meaningZh: '手',
    meaningEn: 'hand',
    note: '和“手工、操作、管理”相关。',
    examples: [
      { word: 'manual', breakdown: 'manu + al', meaning: '手册 / 手动的', sentence: 'Read the manual before setup.' },
      { word: 'manufacture', breakdown: 'manu + facture', meaning: '制造', sentence: 'Manufacture speed affects supply plans.' },
      { word: 'manipulate', breakdown: 'manu + pulate', meaning: '操作', sentence: 'Do not manipulate data manually without checks.' }
    ]
  },
  {
    id: 'mot',
    root: 'mot/mov',
    origin: 'Latin',
    meaningZh: '移动',
    meaningEn: 'to move',
    note: '和“动力、情绪、迁移”相关。',
    examples: [
      { word: 'motion', breakdown: 'mot + ion', meaning: '动作 / 运动', sentence: 'Gesture and motion help communication.' },
      { word: 'promote', breakdown: 'pro + mot + e', meaning: '推广 / 晋升', sentence: 'We promote this SKU during weekends.' },
      { word: 'remove', breakdown: 're + move', meaning: '移除', sentence: 'Please remove outdated price tags.' }
    ]
  },
  {
    id: 'luc',
    root: 'luc/lum',
    origin: 'Latin',
    meaningZh: '光',
    meaningEn: 'light',
    note: '和“明亮、说明、清晰”相关。',
    examples: [
      { word: 'luminous', breakdown: 'lum + inous', meaning: '发光的', sentence: 'Use luminous signs near the entrance.' },
      { word: 'elucidate', breakdown: 'e + luc + idate', meaning: '阐明', sentence: 'Please elucidate your pricing logic.' },
      { word: 'translucent', breakdown: 'trans + luc + ent', meaning: '半透明的', sentence: 'A translucent cover protects the sample.' }
    ]
  }
];

function randomPick(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

function shuffleArray(arr) {
  const out = Array.isArray(arr) ? [...arr] : [];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function getDefaultRootState() {
  return {
    masteredRootIds: [],
    currentRootId: ROOTS_DATA[0].id,
    quizHistory: [],
    streak: 0,
    lastStudyDate: null,
    totalSessions: 0,
    updatedAt: new Date().toISOString()
  };
}

function normalizeRootDay(value) {
  if (typeof value !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return value;
}

function sanitizeRootState(raw) {
  const safe = getDefaultRootState();
  if (!raw || typeof raw !== 'object') return safe;

  const validIds = new Set(ROOTS_DATA.map(r => r.id));

  if (Array.isArray(raw.masteredRootIds)) {
    const uniq = [];
    raw.masteredRootIds.forEach(id => {
      if (typeof id === 'string' && validIds.has(id) && !uniq.includes(id)) {
        uniq.push(id);
      }
    });
    safe.masteredRootIds = uniq;
  }

  if (typeof raw.currentRootId === 'string' && validIds.has(raw.currentRootId)) {
    safe.currentRootId = raw.currentRootId;
  }

  if (Array.isArray(raw.quizHistory)) {
    safe.quizHistory = raw.quizHistory
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        date: typeof item.date === 'string' ? item.date : new Date().toISOString(),
        score: Number.isFinite(item.score) ? item.score : 0,
        total: Number.isFinite(item.total) ? item.total : 0
      }))
      .slice(-20);
  }

  if (Number.isFinite(raw.streak) && raw.streak >= 0) safe.streak = Math.floor(raw.streak);
  safe.lastStudyDate = normalizeRootDay(raw.lastStudyDate);
  if (Number.isFinite(raw.totalSessions) && raw.totalSessions >= 0) safe.totalSessions = Math.floor(raw.totalSessions);
  if (typeof raw.updatedAt === 'string') safe.updatedAt = raw.updatedAt;

  return safe;
}

function loadRootState() {
  try {
    const raw = localStorage.getItem(ROOT_STORAGE_KEY);
    if (!raw) return getDefaultRootState();
    return sanitizeRootState(JSON.parse(raw));
  } catch {
    return getDefaultRootState();
  }
}

function saveRootState(state) {
  const safe = sanitizeRootState(state);
  safe.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(ROOT_STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // 私密模式或配额不足时避免中断页面逻辑
  }
  return safe;
}

function updateRootStreak(state) {
  const safe = sanitizeRootState(state);
  const today = new Date().toISOString().slice(0, 10);
  if (safe.lastStudyDate === today) return safe;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (safe.lastStudyDate === yesterday) {
    safe.streak += 1;
  } else {
    safe.streak = 1;
  }

  safe.lastStudyDate = today;
  safe.totalSessions += 1;
  return safe;
}

function getAllRoots() {
  return ROOTS_DATA.map(item => ({ ...item, examples: item.examples.map(ex => ({ ...ex })) }));
}

function getRootById(id) {
  return getAllRoots().find(item => item.id === id) || null;
}

function isRootMastered(state, rootId) {
  const safe = sanitizeRootState(state);
  return safe.masteredRootIds.includes(rootId);
}

function toggleRootMastered(state, rootId) {
  const safe = sanitizeRootState(state);
  if (safe.masteredRootIds.includes(rootId)) {
    safe.masteredRootIds = safe.masteredRootIds.filter(id => id !== rootId);
  } else {
    safe.masteredRootIds.push(rootId);
  }
  return safe;
}

function getRootStats(state) {
  const safe = sanitizeRootState(state);
  const total = ROOTS_DATA.length;
  const mastered = safe.masteredRootIds.length;
  const progress = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return { total, mastered, progress, streak: safe.streak, sessions: safe.totalSessions };
}

function getOriginList() {
  const origins = new Set(ROOTS_DATA.map(item => item.origin));
  return Array.from(origins);
}

function filterRoots(filters) {
  const query = filters && typeof filters.query === 'string' ? filters.query.trim().toLowerCase() : '';
  const origin = filters && typeof filters.origin === 'string' ? filters.origin : 'all';

  return getAllRoots().filter(root => {
    if (origin !== 'all' && root.origin !== origin) return false;
    if (!query) return true;

    const hay = [
      root.root,
      root.meaningZh,
      root.meaningEn,
      root.note,
      ...root.examples.map(ex => `${ex.word} ${ex.meaning} ${ex.breakdown} ${ex.sentence}`)
    ].join(' ').toLowerCase();

    return hay.includes(query);
  });
}

function getNeighborRootId(rootId, direction, currentPool) {
  const pool = Array.isArray(currentPool) && currentPool.length > 0 ? currentPool : getAllRoots();
  const ids = pool.map(item => item.id);
  const idx = ids.indexOf(rootId);
  if (idx < 0) return ids[0] || null;
  if (direction === 'prev') return ids[(idx - 1 + ids.length) % ids.length];
  return ids[(idx + 1) % ids.length];
}

function buildRootQuiz(pool) {
  const roots = Array.isArray(pool) && pool.length >= 4 ? pool : getAllRoots();
  if (roots.length < 4) return null;

  const correct = randomPick(roots);
  const askMeaning = Math.random() > 0.5;

  if (askMeaning) {
    const distractors = shuffleArray(
      roots.filter(item => item.id !== correct.id).map(item => item.meaningZh)
    ).slice(0, 3);

    const options = shuffleArray([correct.meaningZh, ...distractors]);
    const answerIndex = options.indexOf(correct.meaningZh);

    return {
      rootId: correct.id,
      question: `词根 "${correct.root}" 的核心含义是？`,
      options,
      answerIndex,
      explanation: `"${correct.root}" = ${correct.meaningZh}（${correct.meaningEn}）` 
        + `，例如 ${correct.examples[0].word} (${correct.examples[0].meaning})。`
    };
  }

  const distractors = shuffleArray(
    roots.filter(item => item.id !== correct.id).map(item => item.root)
  ).slice(0, 3);
  const options = shuffleArray([correct.root, ...distractors]);
  const answerIndex = options.indexOf(correct.root);

  return {
    rootId: correct.id,
    question: `哪个词根表示“${correct.meaningZh}”？`,
    options,
    answerIndex,
    explanation: `正确答案是 ${correct.root}，常见例词：${correct.examples.map(ex => ex.word).slice(0, 2).join('、')}。`
  };
}

function appendRootQuizHistory(state, score, total) {
  const safe = sanitizeRootState(state);
  const item = {
    date: new Date().toISOString(),
    score: Number.isFinite(score) ? score : 0,
    total: Number.isFinite(total) ? total : 0
  };
  safe.quizHistory.push(item);
  safe.quizHistory = safe.quizHistory.slice(-20);
  return safe;
}
