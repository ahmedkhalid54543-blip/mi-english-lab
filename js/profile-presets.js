(function initProfilePresets(global) {
  'use strict';

  var PRESETS = [
    { id: 'shiba',    name: '橙柴队长', bg: '#FFF3E8', frame: '#FB923C' },
    { id: 'cat',      name: '薄荷喵',   bg: '#ECFDF5', frame: '#34D399' },
    { id: 'bunny',    name: '星光兔',   bg: '#EFF6FF', frame: '#60A5FA' },
    { id: 'panda',    name: '莓果熊猫', bg: '#FDF2F8', frame: '#F472B6' },
    { id: 'chick',    name: '电波小鸡', bg: '#FFFBEB', frame: '#FACC15' },
    { id: 'penguin',  name: '夜行企鹅', bg: '#EEF2FF', frame: '#818CF8' },
    { id: 'fox',      name: '暖阳狐',   bg: '#FEF3C7', frame: '#F59E0B' },
    { id: 'koala',    name: '云朵考拉', bg: '#F0F9FF', frame: '#7DD3FC' },
    { id: 'squirrel', name: '坚果松鼠', bg: '#FEF7ED', frame: '#D97706' },
    { id: 'otter',    name: '浪花水獭', bg: '#F0FDFA', frame: '#2DD4BF' }
  ];

  var AVATAR_BASE_PATH = 'assets/avatars/avatar-';

  // Legacy ID mapping — old pixel-avatar IDs resolve to new animal IDs
  var LEGACY_MAP = {
    sunbeam: 'shiba',
    minty:   'cat',
    stellar: 'bunny',
    berry:   'panda',
    volt:    'chick',
    night:   'penguin'
  };

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function resolveId(id) {
    if (typeof id === 'string' && LEGACY_MAP[id]) return LEGACY_MAP[id];
    return id;
  }

  function getPresetById(id) {
    var resolved = resolveId(id);
    if (typeof resolved === 'string') {
      for (var i = 0; i < PRESETS.length; i += 1) {
        if (PRESETS[i].id === resolved) return PRESETS[i];
      }
    }
    return PRESETS[0];
  }

  function hasPreset(id) {
    return Boolean(id && getPresetById(id).id === resolveId(id));
  }

  function normalizePresetId(id) {
    return getPresetById(id).id;
  }

  function renderAvatar(id, options) {
    var preset = getPresetById(id);
    var size = options && typeof options.size === 'string' ? options.size : 'md';
    var label = options && typeof options.label === 'string' ? options.label : preset.name;
    var classes = ['pixel-avatar', 'pixel-avatar--' + size];

    if (options && options.className) {
      classes.push(options.className);
    }

    var imgSrc = AVATAR_BASE_PATH + preset.id + '.webp';

    var html = '<span class="' + classes.join(' ') + '" style="--avatar-bg:' + preset.bg + ';--avatar-frame:' + preset.frame + ';" aria-label="' + escapeHTML(label) + '" title="' + escapeHTML(label) + '">';
    html += '<img class="pixel-avatar__img" src="' + imgSrc + '" alt="' + escapeHTML(label) + '" draggable="false">';
    html += '</span>';
    return html;
  }

  global.MiProfilePresets = {
    list: PRESETS.map(function mapPreset(preset) {
      return {
        id: preset.id,
        name: preset.name
      };
    }),
    getPresetById: getPresetById,
    hasPreset: hasPreset,
    normalizePresetId: normalizePresetId,
    renderAvatar: renderAvatar
  };
})(window);
