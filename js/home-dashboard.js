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
    var rolePlan = getRolePlan(scenarioProgress);
    var reviewTask = createReviewTask(reviewSummary);
    var roleTask = createRoleTask(rolePlan);
    var lightTask = getLightTask(rootsSnapshot);
    var primaryTask = null;

    if (reviewSummary.todayItems.length > 0 && reviewSummary.firstItem) {
      primaryTask = {
        key: 'primary_review',
        eyebrow: '主任务',
        title: '先完成今日复习',
        desc: '你有 ' + reviewSummary.todayItems.length + ' 个到期弱项。优先处理 ' + reviewSummary.firstItem.title + '，先把错误清掉再继续推进新内容。',
        href: getReviewHref(reviewSummary.firstItem),
        ctaLabel: '开始今日复习',
        followUp: rolePlan ? '完成后去：' + roleTask.title : '完成后去：' + lightTask.title,
        meta: [
          reviewSummary.firstItem.priorityLabel,
          '优先修正弱项'
        ]
      };
    } else if (rolePlan && rolePlan.sceneId) {
      primaryTask = {
        key: 'primary_role',
        eyebrow: '主任务',
        title: '继续 ' + rolePlan.sceneTitle,
        desc: '这是你当前 ' + rolePlan.role.label + ' 路径的推荐场景。先推进主路径，再回头补轻任务。',
        href: 'scenarios.html?role=' + encodeURIComponent(rolePlan.role.id) + '&scene=' + encodeURIComponent(rolePlan.sceneId),
        ctaLabel: '开始推荐场景',
        followUp: '完成后去：' + lightTask.title,
        meta: [
          rolePlan.role.label,
          rolePlan.remainingScenes > 0 ? '剩余 ' + rolePlan.remainingScenes + ' 个场景' : '路径已接近完成'
        ]
      };
    } else if (!state.selectedRole) {
      primaryTask = {
        key: 'primary_setup',
        eyebrow: '主任务',
        title: '先设置你的角色路径',
        desc: '先告诉系统你属于哪条业务路径，首页才会只推与你工作相关的场景和课程。',
        action: 'focus-next-step',
        ctaLabel: '去设置角色',
        followUp: '完成后去：今日任务会自动刷新',
        meta: [
          '首次设置',
          '减少首屏干扰'
        ]
      };
    } else if (rolePlan && rolePlan.lessonTask && rolePlan.lessonTask.lesson) {
      primaryTask = {
        key: 'primary_lesson',
        eyebrow: '主任务',
        title: '先补齐 ' + rolePlan.lessonTask.lesson.id + ' 词汇',
        desc: '推荐场景已跑过一轮，下一步把角色路径中的关键课程词汇补齐。',
        href: 'learn.html',
        ctaLabel: '去闪卡学习',
        followUp: '完成后去：' + lightTask.title,
        meta: [
          rolePlan.role.label,
          rolePlan.lessonTask.progress.mastered + '/' + rolePlan.lessonTask.progress.total
        ]
      };
    } else {
      primaryTask = {
        key: 'primary_light',
        eyebrow: '主任务',
        title: lightTask.title,
        desc: lightTask.desc,
        href: lightTask.href,
        ctaLabel: lightTask.actionLabel,
        followUp: '完成后去：查看学习进度',
        meta: [
          '轻任务',
          '保持节奏'
        ]
      };
    }

    return {
      scenarioProgress: scenarioProgress,
      rootsSnapshot: rootsSnapshot,
      reviewSummary: reviewSummary,
      reviewTask: reviewTask,
      rolePlan: rolePlan,
      roleTask: roleTask,
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

    var secondaryTasks = [context.reviewTask, context.roleTask, context.lightTask].filter(function filterTask(task) {
      if (!task) return false;
      if (context.primaryTask.key === 'primary_review' && task.key === 'review') return false;
      if (context.primaryTask.key === 'primary_role' && task.key === 'role_path') return false;
      if (context.primaryTask.key === 'primary_role' && task.key === 'role_lesson') return false;
      if (context.primaryTask.key === 'primary_lesson' && task.key === 'role_lesson') return false;
      if (context.primaryTask.key === 'primary_setup' && task.key === 'role_setup') return false;
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

  function renderNextStep(context) {
    var mount = $('homeNextStep');
    var hint = $('homeNextStepHint');
    if (!mount) return;

    if (!context.rolePlan) {
      if (hint) hint.textContent = '先选角色，再给你单一路径推荐';
      mount.innerHTML = '' +
        '<article class="home-next-card">' +
          '<div class="home-next-badge">未设置角色</div>' +
          '<h3 class="home-next-title">先锁定你的业务路径</h3>' +
          '<p class="home-next-desc">角色只在首次进入或需要调整时出现，不再永久占据首页首屏。选定后，推荐场景和课程会自动收口。</p>' +
          '<div class="home-role-grid">' + renderRoleButtons(null) + '</div>' +
        '</article>';
      return;
    }

    var rolePlan = context.rolePlan;
    var summary = rolePlan.summary || { mastered: 0, total: 0, completedScenes: 0 };
    var reason = rolePlan.remainingScenes > 0
      ? '因为你当前是 ' + rolePlan.role.label + ' 路径，且还有 ' + rolePlan.remainingScenes + ' 个推荐场景未完成。'
      : '因为你的推荐场景已基本完成，下一步应该转向课程词汇补齐。';
    var lessonHint = rolePlan.lessonTask && rolePlan.lessonTask.lesson
      ? '下一节建议补 ' + rolePlan.lessonTask.lesson.id + '。'
      : '完成后回到进度页查看下一段提升空间。';
    var roleSettingsHTML = roleSettingsVisible
      ? '<div class="home-role-settings"><div class="home-role-grid">' + renderRoleButtons(rolePlan.role.id) + '</div></div>'
      : '';

    if (hint) hint.textContent = '保留角色路径价值，但不抢首屏主流程';

    mount.innerHTML = '' +
      '<article class="home-next-card">' +
        '<div class="home-next-head">' +
          '<div class="home-next-badge">' + safeHTML(rolePlan.role.label) + '</div>' +
          '<button type="button" class="home-inline-button" data-action="toggle-role-settings">' + (roleSettingsVisible ? '收起角色设置' : '调整角色') + '</button>' +
        '</div>' +
        '<h3 class="home-next-title">推荐场景：' + safeHTML(rolePlan.sceneTitle) + '</h3>' +
        '<p class="home-next-desc">' + safeHTML(reason) + ' ' + safeHTML(lessonHint) + '</p>' +
        '<div class="home-next-stats">' +
          '<span>推荐课词掌握 ' + safeHTML(summary.mastered + '/' + summary.total) + '</span>' +
          '<span>已完成场景 ' + safeHTML(String(summary.completedScenes || 0)) + '</span>' +
        '</div>' +
        '<div class="home-inline-actions">' +
          '<a class="home-inline-link" href="scenarios.html?role=' + safeHTML(encodeURIComponent(rolePlan.role.id)) + '&scene=' + safeHTML(encodeURIComponent(rolePlan.sceneId)) + '">去场景页</a>' +
          '<a class="home-inline-link" href="learn.html">补课程词汇</a>' +
        '</div>' +
        roleSettingsHTML +
      '</article>';
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
    var greeting = $('homeGreeting');
    var summary = $('homeStatusSummary');
    var progressLabel = $('homeProgressLabel');
    var progressBar = $('homeProgressBar');
    var syncPill = $('homeSyncStatus');
    var loginLink = $('headerLoginLink');

    $('streakCount').textContent = state.streak || 0;
    $('levelBadge').textContent = 'Lv.' + state.level + ' ' + getLevelName(state.level);
    $('homeStreakValue').textContent = state.streak || 0;
    $('homeXPValue').textContent = state.xp || 0;
    $('homeLevelValue').textContent = 'Lv.' + state.level;
    $('homeProgressPct').textContent = mastery.percent + '%';

    if (greeting) greeting.textContent = getGreeting() + ' · 任务中心';
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
        summary.textContent = '今天优先先清理待复习弱项，再回到推荐路径继续推进。';
      } else if (context.primaryTask.key === 'primary_role') {
        summary.textContent = '今天优先推进主路径场景，避免首页再次变成入口广场。';
      } else if (context.primaryTask.key === 'primary_setup') {
        summary.textContent = '先确定业务路径，再让任务和推荐自动收口。';
      } else {
        summary.textContent = '今天先完成一个最关键动作，其余入口全部下沉到次级区。';
      }
    }
    if (loginLink && !loginLink.dataset.boundLabel) {
      loginLink.dataset.boundLabel = 'true';
      loginLink.textContent = syncStatus.message && syncStatus.message !== '未登录' ? '账号' : '登录';
    }
  }

  function renderAll() {
    var context = buildTaskContext();
    renderHeaderAndStatus(context);
    renderPrimaryTask(context.primaryTask);
    renderTaskList(context);
    renderNextStep(context);
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
    var loginLink = $('headerLoginLink');
    if (!loginLink) return;
    loginLink.textContent = isLoggedIn ? '账号' : '登录';
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
