(function initHomeDashboard(global) {
  'use strict';

  var state = null;
  var reviewSource = null;
  var syncStatus = { status: '', message: '未登录' };
  var roleSettingsVisible = false;

  var QUICK_LINKS = [
    {
      href: 'learn.html',
      icon: 'fa-book-open',
      title: '闪卡学习',
      desc: '课程词汇与表达'
    },
    {
      href: 'scenarios.html',
      icon: 'fa-map-location-dot',
      title: '场景训练',
      desc: '真实业务场景'
    },
    {
      href: 'practice.html',
      icon: 'fa-gamepad',
      title: '练习测试',
      desc: '配对 / 翻译 / 填空'
    },
    {
      href: 'roots.html',
      icon: 'fa-seedling',
      title: '词根训练',
      desc: '5 分钟轻任务'
    },
    {
      href: 'progress.html',
      icon: 'fa-chart-line',
      title: '学习进度',
      desc: 'streak / XP / 成就'
    }
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function safeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getProfileData() {
    return {
      name: state && typeof state.profileName === 'string' && state.profileName.trim()
        ? state.profileName.trim()
        : '',
      avatarId: state && typeof state.profileAvatar === 'string' && state.profileAvatar.trim()
        ? state.profileAvatar.trim()
        : (global.MiProfilePresets && typeof global.MiProfilePresets.normalizePresetId === 'function'
          ? global.MiProfilePresets.normalizePresetId('')
          : '')
    };
  }

  function renderLoginLink(isLoggedIn) {
    var loginLink = $('headerLoginLink');
    if (!loginLink) return;

    if (!isLoggedIn) {
      loginLink.innerHTML = '登录';
      loginLink.classList.remove('profile-chip-link');
      return;
    }

    var profile = getProfileData();
    var avatarHTML = global.MiProfilePresets && typeof global.MiProfilePresets.renderAvatar === 'function'
      ? global.MiProfilePresets.renderAvatar(profile.avatarId, { size: 'sm', label: profile.name || '学习者' })
      : '';

    loginLink.classList.add('profile-chip-link');
    loginLink.innerHTML = avatarHTML +
      '<span class="profile-chip-copy">' +
        '<span class="profile-chip-name">' + safeHTML(profile.name || '学习者') + '</span>' +
        '<span class="profile-chip-meta">账号</span>' +
      '</span>';
  }

  function getGreeting() {
    var hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed === undefined ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }

  function readScenarioProgress() {
    var parsed = readJSON('mi-english-scenario-progress-v1', {});
    return parsed && typeof parsed === 'object' ? parsed : {};
  }

  function readRootsSnapshot() {
    var parsed = readJSON('mi-english-roots-v1', null);
    return parsed && typeof parsed === 'object' ? parsed : null;
  }

  function buildFallbackScenarioAttempts() {
    var attempts = [];
    var sceneProgress = readScenarioProgress();

    Object.keys(sceneProgress).forEach(function eachScene(sceneId) {
      var item = sceneProgress[sceneId];
      if (!item || !item.started || item.passedOnce) return;
      attempts.push({
        scene_id: sceneId,
        status: 'failed',
        attempted_at: item.updatedAt || new Date().toISOString(),
        payload: {
          attempts: item.attempts || 1
        }
      });
    });

    return attempts;
  }

  function getMasteryStats() {
    var allVocab = typeof getAllVocab === 'function' ? getAllVocab() : [];
    var total = Array.isArray(allVocab) ? allVocab.length : 0;
    var mastered = typeof countStatus === 'function' ? countStatus(state, 'mastered') : 0;
    var percent = total > 0 ? Math.round(mastered / total * 100) : 0;
    return {
      total: total,
      mastered: mastered,
      percent: percent
    };
  }

  function countScenarioCompletion(progressMap) {
    var ids = Object.keys(progressMap || {});
    var completed = 0;
    ids.forEach(function eachScene(sceneId) {
      if (progressMap[sceneId] && progressMap[sceneId].passedOnce) completed += 1;
    });
    return {
      attempted: ids.length,
      completed: completed
    };
  }

  function getLessonById(lessonId) {
    if (!global.DATA || !Array.isArray(global.DATA.lessons)) return null;
    for (var i = 0; i < global.DATA.lessons.length; i += 1) {
      if (global.DATA.lessons[i] && global.DATA.lessons[i].id === lessonId) {
        return global.DATA.lessons[i];
      }
    }
    return null;
  }

  function getLessonProgress(lesson) {
    if (!lesson || !Array.isArray(lesson.vocab)) {
      return { total: 0, mastered: 0, percent: 0 };
    }

    var total = lesson.vocab.length;
    var mastered = 0;

    lesson.vocab.forEach(function eachVocab(item) {
      if (item && item.id && state.vocabStatus[item.id] === 'mastered') {
        mastered += 1;
      }
    });

    return {
      total: total,
      mastered: mastered,
      percent: total > 0 ? Math.round(mastered / total * 100) : 0
    };
  }

  function findNextLesson(preferredLessonIds) {
    if (!global.DATA || !Array.isArray(global.DATA.lessons)) return null;

    var orderedIds = Array.isArray(preferredLessonIds) && preferredLessonIds.length
      ? preferredLessonIds.slice()
      : global.DATA.lessons.map(function mapLesson(lesson) { return lesson.id; });

    var best = null;

    for (var i = 0; i < orderedIds.length; i += 1) {
      var lesson = getLessonById(orderedIds[i]);
      var progress = getLessonProgress(lesson);
      if (!lesson || progress.total === 0) continue;
      if (progress.mastered < progress.total) {
        return {
          lesson: lesson,
          progress: progress
        };
      }
      if (!best) {
        best = {
          lesson: lesson,
          progress: progress
        };
      }
    }

    return best;
  }

  function getReviewSummary(source) {
    if (!global.MiReviewQueue || typeof global.MiReviewQueue.generateReviewQueue !== 'function') {
      return {
        queue: [],
        todayItems: [],
        firstItem: null
      };
    }

    var queue = global.MiReviewQueue.generateReviewQueue(source || {});
    var todayItems = global.MiReviewQueue.getTodayReviewItems({ queue: queue });

    return {
      queue: queue,
      todayItems: todayItems,
      firstItem: todayItems[0] || queue[0] || null
    };
  }

  function getReviewHref(item) {
    if (!item) return 'learn.html';
    if (item.targetType === 'scenario') {
      return 'scenarios.html?scene=' + encodeURIComponent(item.targetId);
    }
    return 'learn.html';
  }

  function getRolePlan(progressMap) {
    if (!global.MiRoleConfig || typeof global.MiRoleConfig.getRoleById !== 'function') {
      return null;
    }

    var role = global.MiRoleConfig.getRoleById(state.selectedRole);
    if (!role) return null;

    var recommendedSceneIds = Array.isArray(role.recommendedScenarioIds) ? role.recommendedScenarioIds.slice() : [];
    var sceneId = recommendedSceneIds[0] || null;

    for (var i = 0; i < recommendedSceneIds.length; i += 1) {
      var candidate = recommendedSceneIds[i];
      var candidateProgress = progressMap[candidate];
      if (!candidateProgress || !candidateProgress.passedOnce) {
        sceneId = candidate;
        break;
      }
    }

    var summary = typeof global.MiRoleConfig.getRoleProgressSummary === 'function'
      ? global.MiRoleConfig.getRoleProgressSummary(role.id, state, progressMap)
      : null;

    var remainingScenes = recommendedSceneIds.filter(function countRemaining(candidateId) {
      var item = progressMap[candidateId];
      return !item || !item.passedOnce;
    }).length;

    var lessonTask = findNextLesson(role.recommendedLessonIds);
    var sceneMeta = sceneId && typeof global.MiRoleConfig.getScenarioMeta === 'function'
      ? global.MiRoleConfig.getScenarioMeta(sceneId)
      : null;

    return {
      role: role,
      sceneId: sceneId,
      sceneTitle: sceneMeta ? sceneMeta.title : '推荐场景',
      summary: summary,
      remainingScenes: remainingScenes,
      lessonTask: lessonTask
    };
  }

  function getLightTask(rootsSnapshot) {
    var rootsMastered = rootsSnapshot && Array.isArray(rootsSnapshot.masteredRootIds)
      ? rootsSnapshot.masteredRootIds.length
      : 0;

    if (rootsMastered < 12) {
      return {
        key: 'light_roots',
        icon: 'fa-seedling',
        title: '做 5 分钟词根热身',
        desc: rootsMastered > 0
          ? '你已掌握 ' + rootsMastered + ' 个词根，适合用轻量任务保持节奏。'
          : '词根模块适合做轻量热身，先把拆词感觉找回来。',
        href: 'roots.html',
        actionLabel: '去热身',
        meta: '轻任务'
      };
    }

    return {
      key: 'light_practice',
      icon: 'fa-gamepad',
      title: '做 1 轮练习测试',
      desc: state.practiceHistory && state.practiceHistory.length
        ? '用一轮配对或填空，把今天学过的表达快速过一遍。'
        : '先建立练习节奏，建议从一轮 10 题开始。',
      href: 'practice.html',
      actionLabel: '去练习',
      meta: '轻任务'
    };
  }

  function createReviewTask(reviewSummary) {
    if (reviewSummary.todayItems.length > 0 && reviewSummary.firstItem) {
      return {
        key: 'review',
        icon: 'fa-rotate-left',
        title: '清理今日复习队列',
        desc: '当前有 ' + reviewSummary.todayItems.length + ' 个到期弱项，优先处理 ' + reviewSummary.firstItem.title + '。',
        href: getReviewHref(reviewSummary.firstItem),
        actionLabel: '去处理',
        meta: reviewSummary.firstItem.priorityLabel
      };
    }

    return {
      key: 'review',
      icon: 'fa-shield-heart',
      title: '保持复习队列清零',
      desc: '今天没有高优先级待复习项，建议刷一组词卡巩固记忆。',
      href: 'learn.html',
      actionLabel: '去巩固',
      meta: '已清空'
    };
  }

  function createRoleTask(rolePlan) {
    if (!rolePlan) {
      return {
        key: 'role_setup',
        icon: 'fa-compass',
        title: '设置角色路径',
        desc: '选定角色后，首页会只推荐与你业务相关的场景和课程。',
        action: 'focus-next-step',
        actionLabel: '去设置',
        meta: '未设置'
      };
    }

    if (rolePlan.sceneId) {
      return {
        key: 'role_path',
        icon: 'fa-route',
        title: '推进 ' + rolePlan.role.label + ' 路径',
        desc: rolePlan.remainingScenes > 0
          ? '还剩 ' + rolePlan.remainingScenes + ' 个推荐场景待完成，先推进 ' + rolePlan.sceneTitle + '。'
          : '推荐场景已基本完成，回到路径卡继续补齐课程词汇。',
        href: 'scenarios.html?role=' + encodeURIComponent(rolePlan.role.id) + '&scene=' + encodeURIComponent(rolePlan.sceneId),
        actionLabel: '去推进',
        meta: rolePlan.role.label
      };
    }

    if (rolePlan.lessonTask && rolePlan.lessonTask.lesson) {
      return {
        key: 'role_lesson',
        icon: 'fa-book-open',
        title: '补齐 ' + rolePlan.lessonTask.lesson.id + ' 词汇',
        desc: '推荐课程已掌握 ' + rolePlan.lessonTask.progress.mastered + '/' + rolePlan.lessonTask.progress.total + '，继续补齐路径所需词汇。',
        href: 'learn.html',
        actionLabel: '去学习',
        meta: rolePlan.role.label
      };
    }

    return {
      key: 'role_path',
      icon: 'fa-route',
      title: '检查角色路径进度',
      desc: '角色路径已经跑通，回到进度页查看下一段提升空间。',
      href: 'progress.html',
      actionLabel: '查看进度',
      meta: rolePlan.role.label
    };
  }

  function buildTaskContext() {
    var scenarioProgress = readScenarioProgress();
    var rootsSnapshot = readRootsSnapshot();
    var reviewSummary = getReviewSummary(reviewSource || {
      scenario_attempts: buildFallbackScenarioAttempts(),
      lesson_progress: [],
      events: []
    });
    var reviewTask = createReviewTask(reviewSummary);
    var lightTask = getLightTask(rootsSnapshot);
    var studyTask = {
      key: 'study',
      icon: 'fa-book-open',
      title: '继续闪卡学习',
      desc: '先把高频词汇和表达滚一轮，再进入练习或词根热身。',
      href: 'learn.html',
      actionLabel: '去学习',
      meta: '主学习流'
    };
    var primaryTask = null;

    if (reviewSummary.todayItems.length > 0 && reviewSummary.firstItem) {
      primaryTask = {
        key: 'primary_review',
        eyebrow: '主任务',
        title: '先完成今日复习',
        desc: '你有 ' + reviewSummary.todayItems.length + ' 个到期弱项。优先处理 ' + reviewSummary.firstItem.title + '，先把错误清掉再继续推进新内容。',
        href: getReviewHref(reviewSummary.firstItem),
        ctaLabel: '开始今日复习',
        followUp: '完成后去：' + studyTask.title,
        meta: [
          reviewSummary.firstItem.priorityLabel,
          '优先修正弱项'
        ]
      };
    } else {
      primaryTask = {
        key: 'primary_study',
        eyebrow: '主任务',
        title: studyTask.title,
        desc: studyTask.desc,
        href: studyTask.href,
        ctaLabel: '开始闪卡学习',
        followUp: '完成后去：' + lightTask.title,
        meta: [
          studyTask.meta,
          '先学再练'
        ]
      };
    }

    return {
      scenarioProgress: scenarioProgress,
      rootsSnapshot: rootsSnapshot,
      reviewSummary: reviewSummary,
      reviewTask: reviewTask,
      studyTask: studyTask,
      lightTask: lightTask,
      primaryTask: primaryTask
    };
  }

  function renderPrimaryTask(primaryTask) {
    var mount = $('homePrimaryTask');
    if (!mount || !primaryTask) return;

    var metaHTML = Array.isArray(primaryTask.meta)
      ? primaryTask.meta.map(function mapMeta(item) {
        return '<span class="home-meta-pill">' + safeHTML(item) + '</span>';
      }).join('')
      : '';

    var actionHTML = primaryTask.href
      ? '<a class="home-main-cta" href="' + safeHTML(primaryTask.href) + '">' + safeHTML(primaryTask.ctaLabel) + '</a>'
      : '<button type="button" class="home-main-cta" data-action="' + safeHTML(primaryTask.action) + '">' + safeHTML(primaryTask.ctaLabel) + '</button>';

    mount.innerHTML = '' +
      '<article class="home-primary-card">' +
        '<div class="home-primary-eyebrow">' + safeHTML(primaryTask.eyebrow) + '</div>' +
        '<h2 class="home-primary-title">' + safeHTML(primaryTask.title) + '</h2>' +
        '<p class="home-primary-desc">' + safeHTML(primaryTask.desc) + '</p>' +
        '<div class="home-meta-row">' + metaHTML + '</div>' +
        actionHTML +
        '<div class="home-follow-up">' + safeHTML(primaryTask.followUp) + '</div>' +
      '</article>';
  }

  function renderTaskList(context) {
    var mount = $('homeTaskList');
    if (!mount) return;

    var secondaryTasks = [context.reviewTask, context.studyTask, context.lightTask].filter(function filterTask(task) {
      if (!task) return false;
      if (context.primaryTask.key === 'primary_review' && task.key === 'review') return false;
      if (context.primaryTask.key === 'primary_study' && task.key === 'study') return false;
      if (context.primaryTask.key === 'primary_light' && (task.key === 'light_roots' || task.key === 'light_practice')) return false;
      return true;
    }).slice(0, 2);

    mount.innerHTML = secondaryTasks.map(function mapTask(task) {
      var actionHTML = task.href
        ? '<a class="home-task-link" href="' + safeHTML(task.href) + '">' + safeHTML(task.actionLabel) + '</a>'
        : '<button type="button" class="home-task-link" data-action="' + safeHTML(task.action) + '">' + safeHTML(task.actionLabel) + '</button>';

      return '' +
        '<article class="home-task-item">' +
          '<div class="home-task-icon"><i class="fas ' + safeHTML(task.icon) + '"></i></div>' +
          '<div class="home-task-copy">' +
            '<div class="home-task-meta">' + safeHTML(task.meta || '次级任务') + '</div>' +
            '<h3 class="home-task-title">' + safeHTML(task.title) + '</h3>' +
            '<p class="home-task-desc">' + safeHTML(task.desc) + '</p>' +
          '</div>' +
          actionHTML +
        '</article>';
    }).join('');
  }

  function renderRoleButtons(activeRoleId) {
    if (!global.MiRoleConfig || !Array.isArray(global.MiRoleConfig.ROLES)) return '';

    return global.MiRoleConfig.ROLES.map(function mapRole(role) {
      var active = activeRoleId === role.id ? ' active' : '';
      return '' +
        '<button type="button" class="home-role-btn' + active + '" data-action="select-role" data-role-id="' + safeHTML(role.id) + '">' +
          '<span class="home-role-btn-title">' + safeHTML(role.label) + '</span>' +
          '<span class="home-role-btn-desc">' + safeHTML(role.description) + '</span>' +
        '</button>';
    }).join('');
  }

  function renderQuickLinks(context) {
    var mount = $('homeQuickLinks');
    if (!mount) return;

    var scenarioCounts = countScenarioCompletion(context.scenarioProgress);
    var rootsMastered = context.rootsSnapshot && Array.isArray(context.rootsSnapshot.masteredRootIds)
      ? context.rootsSnapshot.masteredRootIds.length
      : 0;
    var stats = getMasteryStats();

    mount.innerHTML = QUICK_LINKS.map(function mapLink(link) {
      var desc = link.desc;
      if (link.href === 'learn.html') {
        desc = stats.mastered + '/' + stats.total + ' 已掌握';
      } else if (link.href === 'scenarios.html') {
        desc = scenarioCounts.completed + ' 个已完成';
      } else if (link.href === 'roots.html') {
        desc = rootsMastered + ' 个词根已掌握';
      }

      return '' +
        '<a class="home-quick-link" href="' + safeHTML(link.href) + '">' +
          '<div class="home-quick-icon"><i class="fas ' + safeHTML(link.icon) + '"></i></div>' +
          '<div class="home-quick-copy">' +
            '<div class="home-quick-title">' + safeHTML(link.title) + '</div>' +
            '<div class="home-quick-desc">' + safeHTML(desc) + '</div>' +
          '</div>' +
        '</a>';
    }).join('');
  }

  function renderHeaderAndStatus(context) {
    var mastery = getMasteryStats();
    var reviewCount = context.reviewSummary.todayItems.length;
    var profile = getProfileData();
    var greeting = $('homeGreeting');
    var summary = $('homeStatusSummary');
    var progressLabel = $('homeProgressLabel');
    var progressBar = $('homeProgressBar');
    var syncPill = $('homeSyncStatus');
    var isLoggedIn = syncStatus.message && syncStatus.message !== '未登录';

    $('streakCount').textContent = state.streak || 0;
    $('levelBadge').textContent = 'Lv.' + state.level + ' ' + getLevelName(state.level);
    $('homeStreakValue').textContent = state.streak || 0;
    $('homeXPValue').textContent = state.xp || 0;
    $('homeLevelValue').textContent = 'Lv.' + state.level;
    $('homeProgressPct').textContent = mastery.percent + '%';

    if (greeting) greeting.textContent = getGreeting() + ' · ' + (profile.name || '今天继续推进');
    if (progressLabel) {
      progressLabel.textContent = '词汇掌握 ' + mastery.mastered + '/' + mastery.total + ' · 今日复习 ' + reviewCount + ' 项';
    }
    if (progressBar) {
      progressBar.style.width = mastery.percent + '%';
    }
    if (syncPill) {
      syncPill.className = 'sync-pill' + (syncStatus.status ? ' ' + syncStatus.status : '');
      syncPill.textContent = syncStatus.message || '未登录';
    }
    if (summary) {
      if (context.primaryTask.key === 'primary_review') {
        summary.textContent = '先清掉今天该复习的内容，再继续往下学。';
      } else {
        summary.textContent = '先做完今天最关键的一步，其余入口都放在下面。';
      }
    }
    renderLoginLink(isLoggedIn);
  }

  function renderAll() {
    var context = buildTaskContext();
    renderHeaderAndStatus(context);
    renderPrimaryTask(context.primaryTask);
    renderTaskList(context);
    renderQuickLinks(context);
  }

  async function loadReviewSource() {
    var source = {
      scenario_attempts: buildFallbackScenarioAttempts(),
      lesson_progress: [],
      events: []
    };

    if (global.MiApi && typeof global.MiApi.loadUserProgress === 'function') {
      try {
        var remote = await global.MiApi.loadUserProgress();
        if (remote && remote.ok) {
          source.scenario_attempts = Array.isArray(remote.attempts) && remote.attempts.length
            ? remote.attempts
            : source.scenario_attempts;
          source.lesson_progress = Array.isArray(remote.lessonRows) ? remote.lessonRows : [];
        }
      } catch (_) {}
    }

    reviewSource = source;
    renderAll();
  }

  function setActiveTab() {
    var tabs = document.querySelectorAll('.tab-bar-btn[data-tab]');
    tabs.forEach(function eachTab(tab) {
      if (tab.getAttribute('data-tab') === 'index') {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  function updateLoginLabel(isLoggedIn) {
    renderLoginLink(isLoggedIn);
  }

  async function selectRole(roleId) {
    if (!roleId || !state) return;

    state.selectedRole = roleId;
    saveState(state, { reason: 'role_selected' });
    roleSettingsVisible = false;

    if (global.MiAnalytics && typeof global.MiAnalytics.trackEvent === 'function') {
      global.MiAnalytics.trackEvent('role_selected', { roleId: roleId, page: 'index' });
    }

    if (global.MiApi && typeof global.MiApi.saveUserRole === 'function') {
      try {
        await global.MiApi.saveUserRole(roleId);
      } catch (_) {}
    }

    renderAll();
  }

  async function initSyncState() {
    if (!global.MiAuth || typeof global.MiAuth.getSession !== 'function') {
      syncStatus = { status: '', message: '未登录' };
      updateLoginLabel(false);
      renderAll();
      await loadReviewSource();
      return;
    }

    try {
      var sessionResult = await global.MiAuth.getSession();
      var isLoggedIn = Boolean(sessionResult && sessionResult.ok && sessionResult.session);

      updateLoginLabel(isLoggedIn);

      if (!isLoggedIn) {
        syncStatus = { status: '', message: '未登录' };
        renderAll();
        await loadReviewSource();
        return;
      }

      syncStatus = { status: '', message: '同步中...' };
      renderAll();

      if (global.MiApi && typeof global.MiApi.syncLocalStateToCloud === 'function') {
        await global.MiApi.syncLocalStateToCloud(state, { reason: 'app_open' });
      }
      if (global.MiApi && typeof global.MiApi.pullAndMergeToLocal === 'function') {
        await global.MiApi.pullAndMergeToLocal();
        state = loadState();
      }
      if (global.MiApi && typeof global.MiApi.flushQueue === 'function') {
        await global.MiApi.flushQueue();
      }

      await loadReviewSource();
      renderAll();
    } catch (_) {
      syncStatus = { status: 'error', message: '同步失败' };
      renderAll();
    }
  }

  function handleSyncStatus(event) {
    if (!event || !event.detail) return;
    syncStatus = {
      status: event.detail.status || '',
      message: event.detail.message || '未登录'
    };
    updateLoginLabel(syncStatus.message !== '未登录');
    renderAll();
  }

  function bindEvents() {
    document.addEventListener('click', function handleClick(event) {
      var target = event.target.closest('[data-action]');
      if (!target) return;

      var action = target.getAttribute('data-action');
      if (action === 'focus-next-step') {
        event.preventDefault();
        var section = $('homeNextStep');
        if (section && typeof section.scrollIntoView === 'function') {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      if (action === 'toggle-role-settings') {
        event.preventDefault();
        roleSettingsVisible = !roleSettingsVisible;
        renderAll();
        return;
      }

      if (action === 'select-role') {
        event.preventDefault();
        selectRole(target.getAttribute('data-role-id'));
      }
    });

    global.addEventListener('mi-sync-status', handleSyncStatus);
  }

  function trackOpen() {
    if (global.MiAnalytics && typeof global.MiAnalytics.trackEvent === 'function') {
      global.MiAnalytics.trackEvent('app_open', {
        page: 'index',
        roleId: state && state.selectedRole ? state.selectedRole : null
      });
    }
  }

  function boot() {
    if (!$('homePrimaryTask') || typeof initSession !== 'function' || typeof loadState !== 'function') return;

    setActiveTab();
    bindEvents();

    var sessionResult = initSession(loadState());
    state = sessionResult.state;
    reviewSource = {
      scenario_attempts: buildFallbackScenarioAttempts(),
      lesson_progress: [],
      events: []
    };

    renderAll();
    trackOpen();
    initSyncState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
