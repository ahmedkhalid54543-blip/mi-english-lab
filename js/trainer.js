(function initTrainerPage(global) {
  'use strict';

  var state = {
    access: null,
    cohorts: [],
    currentReport: null
  };

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(message) {
    var node = $('trainerStatus');
    if (node) node.textContent = message;
  }

  function setAccessState(kind, title, message, badge) {
    var panel = $('trainerAccessPanel');
    var titleNode = $('trainerAccessTitle');
    var messageNode = $('trainerAccessMessage');
    var chipNode = $('trainerAccessChip');
    var content = $('trainerAuthorizedContent');

    if (panel) panel.hidden = kind === 'authorized';
    if (content) content.hidden = kind !== 'authorized';

    if (titleNode) titleNode.textContent = title || '';
    if (messageNode) messageNode.textContent = message || '';

    if (chipNode) {
      chipNode.textContent = badge || '';
      chipNode.setAttribute('data-state', kind || 'pending');
    }
  }

  function setExportEnabled(enabled) {
    var exportBtn = $('exportCsvBtn');
    if (!exportBtn) return;
    exportBtn.disabled = !enabled;
  }

  function formatPercent(value) {
    var num = Number(value);
    if (!Number.isFinite(num)) return '-';
    return Math.round(num * 100) / 100 + '%';
  }

  function formatWeek(value) {
    if (!value) return '最新周报';
    return '周报周期 ' + value;
  }

  function escapeCsv(value) {
    var text = value == null ? '' : String(value);
    if (/[",\n]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  function ensureClient() {
    return global.MiAuth && typeof global.MiAuth.getClient === 'function' ? global.MiAuth.getClient() : null;
  }

  function findCohortById(cohortId) {
    if (!cohortId) return null;

    for (var i = 0; i < state.cohorts.length; i += 1) {
      if (state.cohorts[i] && state.cohorts[i].id === cohortId) {
        return state.cohorts[i];
      }
    }

    return null;
  }

  async function loadCohorts(access) {
    state.access = access || null;
    state.cohorts = access && Array.isArray(access.cohorts) ? access.cohorts.slice() : [];
    renderCohortOptions();

    if (!state.cohorts.length) {
      setStatus('当前账号未绑定可访问的 cohort');
      renderReport(null);
      return;
    }

    var params = new URLSearchParams(global.location.search);
    var requestedCohortId = params.get('cohort');
    var cohortId = findCohortById(requestedCohortId) ? requestedCohortId : state.cohorts[0].id;
    $('cohortSelect').value = cohortId;
    await loadLatestReport(cohortId);
  }

  function renderCohortOptions() {
    var select = $('cohortSelect');
    if (!select) return;

    if (!state.cohorts.length) {
      select.innerHTML = '<option value="">暂无 cohort</option>';
      return;
    }

    select.innerHTML = state.cohorts.map(function eachCohort(cohort) {
      var label = (cohort.name || cohort.code || cohort.id) + (cohort.is_active ? ' · Active' : '');
      return '<option value="' + cohort.id + '">' + label + '</option>';
    }).join('');
  }

  async function loadLatestReport(cohortId) {
    var client = ensureClient();
    if (!client || !cohortId) {
      renderReport(null);
      setExportEnabled(false);
      return;
    }

    setStatus('正在读取最新周报...');
    setExportEnabled(false);

    var result = await client
      .from('weekly_reports')
      .select('id,cohort_id,report_week,total_members,active_members,first_scene_completion_rate,scenario_pass_rate,top_weaknesses,generated_at')
      .eq('cohort_id', cohortId)
      .order('report_week', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error) {
      setStatus('读取周报失败: ' + result.error.message);
      renderReport(null);
      return;
    }

    state.currentReport = result.data || null;
    renderReport(state.currentReport);
    setExportEnabled(Boolean(state.currentReport));
    setStatus(state.currentReport ? '已加载最新周报' : '当前 cohort 暂无周报');
  }

  function renderMetric(id, value) {
    var node = $(id);
    if (node) node.textContent = value;
  }

  function renderReport(report) {
    var emptyNode = $('trainerEmptyState');
    var weaknessList = $('weaknessList');
    var weekNode = $('metricWeek');

    renderMetric('metricTotalMembers', report ? String(report.total_members || 0) : '-');
    renderMetric('metricActiveMembers', report ? String(report.active_members || 0) : '-');
    renderMetric('metricFirstSceneRate', report ? formatPercent(report.first_scene_completion_rate) : '-');
    renderMetric('metricScenarioPassRate', report ? formatPercent(report.scenario_pass_rate) : '-');
    if (weekNode) weekNode.textContent = report ? formatWeek(report.report_week) : '最新周报';

    if (!weaknessList || !emptyNode) return;
    weaknessList.innerHTML = '';

    if (!report || !Array.isArray(report.top_weaknesses) || !report.top_weaknesses.length) {
      emptyNode.hidden = false;
      return;
    }

    emptyNode.hidden = true;
    report.top_weaknesses.slice(0, 3).forEach(function eachWeakness(item, index) {
      var row = document.createElement('div');
      row.className = 'weakness-item';
      row.innerHTML = '' +
        '<div class="weakness-rank">' + (index + 1) + '</div>' +
        '<div class="weakness-meta">' +
          '<div class="weakness-title">' + (item.scene_title || item.scene_id || 'Unknown') + '</div>' +
          '<div class="weakness-desc">' + (item.reason || item.severity_label || '需要复盘') + '</div>' +
        '</div>' +
        '<div class="weakness-score">' + (item.severity_score != null ? item.severity_score : '-') + '</div>';
      weaknessList.appendChild(row);
    });
  }

  function exportCurrentReportCsv() {
    if (!state.currentReport) {
      setStatus('当前没有可导出的周报');
      return;
    }

    var rows = [
      ['report_week', 'cohort_id', 'total_members', 'active_members', 'first_scene_completion_rate', 'scenario_pass_rate', 'weakness_rank', 'weakness_scene_id', 'weakness_scene_title', 'weakness_reason', 'weakness_severity_score']
    ];

    var weaknesses = Array.isArray(state.currentReport.top_weaknesses) ? state.currentReport.top_weaknesses.slice(0, 3) : [];
    if (!weaknesses.length) {
      weaknesses.push({});
    }

    weaknesses.forEach(function eachWeakness(item, index) {
      rows.push([
        state.currentReport.report_week || '',
        state.currentReport.cohort_id || '',
        state.currentReport.total_members || 0,
        state.currentReport.active_members || 0,
        state.currentReport.first_scene_completion_rate || 0,
        state.currentReport.scenario_pass_rate || 0,
        index + 1,
        item.scene_id || '',
        item.scene_title || '',
        item.reason || item.severity_label || '',
        item.severity_score != null ? item.severity_score : ''
      ]);
    });

    var csv = rows.map(function joinRow(row) {
      return row.map(escapeCsv).join(',');
    }).join('\n');

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'trainer-weekly-report-' + (state.currentReport.report_week || 'latest') + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatus('CSV 已导出');
  }

  function bindEvents() {
    var cohortSelect = $('cohortSelect');
    var exportBtn = $('exportCsvBtn');

    if (cohortSelect) {
      cohortSelect.addEventListener('change', function onCohortChange(event) {
        loadLatestReport(event.target.value);
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportCurrentReportCsv);
    }
  }

  async function boot() {
    setExportEnabled(false);
    setAccessState('pending', '正在验证 trainer 权限...', '会先确认当前账号是否绑定 trainer cohort，再读取对应周报。', '权限校验中');
    setStatus('正在验证权限...');

    if (!global.MiTrainerGuard || typeof global.MiTrainerGuard.resolveAccess !== 'function') {
      setAccessState('error', 'trainer guard 未加载', '页面缺少权限校验模块，已阻止继续读取报表。', '已阻止');
      setStatus('trainer guard 未加载');
      return;
    }

    var access = await global.MiTrainerGuard.resolveAccess();
    if (!access.ok) {
      var isForbidden = access.reason === 'forbidden' || access.reason === 'no_session';
      setAccessState(
        isForbidden ? 'forbidden' : 'error',
        access.reason === 'no_session' ? '请先登录 trainer 账号' : '当前账号没有 trainer 权限',
        global.MiTrainerGuard.describeFailure(access),
        isForbidden ? '已拦截' : '校验失败'
      );
      setStatus(global.MiTrainerGuard.describeFailure(access));
      renderReport(null);
      return;
    }

    setAccessState('authorized', '', '', '');
    setStatus('权限校验通过');
    await loadCohorts(access);
  }

  document.addEventListener('DOMContentLoaded', function onReady() {
    bindEvents();
    boot();
  });
})(window);
