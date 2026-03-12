(function initRoleConfig(global) {
  'use strict';

  var ROLES = [
    {
      id: 'retail_store',
      label: '零售门店',
      labelEn: 'Retail Store',
      description: '聚焦门店接待、产品讲解、库存沟通。',
      recommendedScenarioIds: ['store-service-needs', 'product-introduction', 'inventory-allocation'],
      recommendedLessonIds: ['L02', 'L03', 'L04', 'L08', 'L12', 'L13', 'L17', 'L18', 'L19']
    },
    {
      id: 'channel_partner',
      label: '渠道伙伴',
      labelEn: 'Channel Partner',
      description: '聚焦渠道协同、周会复盘、铺货推进。',
      recommendedScenarioIds: ['inventory-allocation', 'channel-weekly-review', 'dealer-partner-communication'],
      recommendedLessonIds: ['L04', 'L07', 'L10', 'L13', 'L18', 'L20']
    },
    {
      id: 'gtm_pitch',
      label: 'GTM汇报',
      labelEn: 'GTM Pitch',
      description: '聚焦产品定位、策略汇报、跨文化协同。',
      recommendedScenarioIds: ['gtm-strategy-briefing', 'cross-cultural-alignment', 'product-introduction'],
      recommendedLessonIds: ['L03', 'L10', 'L11', 'L12', 'L15', 'L16', 'L18']
    }
  ];

  var SCENARIO_ROLE_MAP = {
    'store-service-needs': ['retail_store'],
    'product-introduction': ['retail_store', 'gtm_pitch'],
    'inventory-allocation': ['retail_store', 'channel_partner'],
    'channel-weekly-review': ['channel_partner'],
    'dealer-partner-communication': ['channel_partner'],
    'gtm-strategy-briefing': ['gtm_pitch'],
    'cross-cultural-alignment': ['gtm_pitch', 'channel_partner']
  };

  var SCENARIO_META = {
    'store-service-needs': { title: '门店接待全流程' },
    'product-introduction': { title: '产品介绍与对比推荐' },
    'inventory-allocation': { title: '库存协同与调拨沟通' },
    'channel-weekly-review': { title: '渠道周会动销复盘' },
    'dealer-partner-communication': { title: '经销商伙伴沟通与铺货推进' },
    'gtm-strategy-briefing': { title: '产品卖点与市场策略汇报' },
    'cross-cultural-alignment': { title: '跨文化协同与共识推进' }
  };

  var LESSON_ROLE_MAP = {
    L01: ['retail_store', 'channel_partner', 'gtm_pitch'],
    L02: ['retail_store'],
    L03: ['retail_store', 'gtm_pitch'],
    L04: ['retail_store', 'channel_partner'],
    L05: ['retail_store', 'channel_partner', 'gtm_pitch'],
    L06: ['retail_store', 'channel_partner', 'gtm_pitch'],
    L07: ['retail_store', 'channel_partner'],
    L08: ['retail_store', 'gtm_pitch'],
    L09: ['retail_store', 'gtm_pitch'],
    L10: ['channel_partner', 'gtm_pitch'],
    L11: ['gtm_pitch'],
    L12: ['retail_store', 'gtm_pitch'],
    L13: ['retail_store', 'channel_partner'],
    L14: ['channel_partner', 'gtm_pitch'],
    L15: ['gtm_pitch'],
    L16: ['gtm_pitch'],
    L17: ['retail_store'],
    L18: ['retail_store', 'channel_partner', 'gtm_pitch'],
    L19: ['retail_store'],
    L20: ['channel_partner'],
    L21: ['channel_partner', 'retail_store']
  };

  function cloneRoles(ids) {
    return Array.isArray(ids) ? ids.slice() : [];
  }

  function getRoleById(roleId) {
    for (var i = 0; i < ROLES.length; i += 1) {
      if (ROLES[i].id === roleId) return ROLES[i];
    }
    return null;
  }

  function getDefaultRoleId() {
    return ROLES[0].id;
  }

  function getScenarioRoles(sceneId) {
    return cloneRoles(SCENARIO_ROLE_MAP[sceneId] || ['retail_store', 'channel_partner', 'gtm_pitch']);
  }

  function getLessonRoles(lessonId) {
    return cloneRoles(LESSON_ROLE_MAP[lessonId] || ['retail_store', 'channel_partner', 'gtm_pitch']);
  }

  function annotateLessonsAndVocab(data) {
    if (!data || !Array.isArray(data.lessons)) return data;

    data.lessons.forEach(function attachLessonRoles(lesson) {
      if (!lesson || typeof lesson !== 'object') return;

      var lessonRoles = getLessonRoles(lesson.id);
      lesson.roles = lessonRoles;

      if (Array.isArray(lesson.vocab)) {
        lesson.vocab.forEach(function attachVocabRoles(vocabItem) {
          if (!vocabItem || typeof vocabItem !== 'object') return;
          vocabItem.roles = lessonRoles.slice();
        });
      }

      if (Array.isArray(lesson.patterns)) {
        lesson.patterns.forEach(function attachPatternRoles(patternItem) {
          if (!patternItem || typeof patternItem !== 'object') return;
          patternItem.roles = lessonRoles.slice();
        });
      }
    });

    return data;
  }

  function annotateScenarios(scenarios) {
    if (!Array.isArray(scenarios)) return scenarios;

    scenarios.forEach(function attachScenarioRoles(scene) {
      if (!scene || typeof scene !== 'object') return;
      scene.roles = getScenarioRoles(scene.id);
    });

    return scenarios;
  }

  function getRecommendedScenarioId(roleId) {
    var role = getRoleById(roleId) || getRoleById(getDefaultRoleId());
    if (!role || !Array.isArray(role.recommendedScenarioIds) || role.recommendedScenarioIds.length === 0) {
      return null;
    }
    return role.recommendedScenarioIds[0];
  }

  function getScenarioMeta(sceneId) {
    return SCENARIO_META[sceneId] || { title: sceneId };
  }

  function getRoleProgressSummary(roleId, state, scenarioProgress) {
    var role = getRoleById(roleId);
    if (!role) return null;

    var lessonIds = role.recommendedLessonIds || [];
    var mastered = 0;
    var total = 0;

    var dataRef = null;
    try {
      if (typeof DATA !== 'undefined') dataRef = DATA;
    } catch (_) {}
    if (!dataRef && global.DATA) dataRef = global.DATA;

    if (state && state.vocabStatus && dataRef && Array.isArray(dataRef.lessons)) {
      dataRef.lessons.forEach(function eachLesson(lesson) {
        if (!lesson || lessonIds.indexOf(lesson.id) < 0 || !Array.isArray(lesson.vocab)) return;
        lesson.vocab.forEach(function eachVocab(vocabItem) {
          if (!vocabItem || typeof vocabItem.id !== 'string') return;
          total += 1;
          if (state.vocabStatus[vocabItem.id] === 'mastered') mastered += 1;
        });
      });
    }

    var attemptedScenes = 0;
    var completedScenes = 0;

    var progressMap = scenarioProgress && typeof scenarioProgress === 'object' ? scenarioProgress : {};
    (role.recommendedScenarioIds || []).forEach(function eachScene(sceneId) {
      var p = progressMap[sceneId];
      if (!p) return;
      if (Number(p.attempts || 0) > 0) attemptedScenes += 1;
      if (Boolean(p.passedOnce)) completedScenes += 1;
    });

    return {
      mastered: mastered,
      total: total,
      attemptedScenes: attemptedScenes,
      completedScenes: completedScenes
    };
  }

  var api = {
    ROLES: ROLES,
    getRoleById: getRoleById,
    getDefaultRoleId: getDefaultRoleId,
    getScenarioRoles: getScenarioRoles,
    getLessonRoles: getLessonRoles,
    annotateLessonsAndVocab: annotateLessonsAndVocab,
    annotateScenarios: annotateScenarios,
    getRecommendedScenarioId: getRecommendedScenarioId,
    getScenarioMeta: getScenarioMeta,
    getRoleProgressSummary: getRoleProgressSummary
  };

  var initialDataRef = null;
  try {
    if (typeof DATA !== 'undefined') initialDataRef = DATA;
  } catch (_) {}
  if (!initialDataRef && global.DATA) initialDataRef = global.DATA;

  if (initialDataRef) {
    annotateLessonsAndVocab(initialDataRef);
  }

  global.MiRoleConfig = api;
})(window);
