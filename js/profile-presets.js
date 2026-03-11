(function initProfilePresets(global) {
  'use strict';

  var PRESETS = [
    {
      id: 'sunbeam',
      name: '橙光队长',
      bg: '#FFF3E8',
      frame: '#FB923C',
      colors: {
        h: '#6B3E22',
        s: '#F6D2B5',
        e: '#1F2937',
        c: '#F59E0B',
        m: '#9A3412',
        t: '#F97316',
        a: '#FDBA74'
      },
      matrix: [
        '..aaaa..',
        '.ahhhha.',
        '.hsssshh',
        '.hsesesh',
        '.hsssssh',
        '.scssmsc',
        '..tttt..',
        '.tt..tt.'
      ]
    },
    {
      id: 'minty',
      name: '薄荷同学',
      bg: '#ECFDF5',
      frame: '#34D399',
      colors: {
        h: '#0F766E',
        s: '#F3D5B3',
        e: '#0F172A',
        c: '#22C55E',
        m: '#166534',
        t: '#10B981',
        a: '#A7F3D0'
      },
      matrix: [
        '...aa...',
        '..ahha..',
        '.hhsshh.',
        '.hsesesh',
        '.hsssssh',
        '.scssmsc',
        '..tttt..',
        '.tt..tt.'
      ]
    },
    {
      id: 'stellar',
      name: '银河玩家',
      bg: '#EFF6FF',
      frame: '#60A5FA',
      colors: {
        h: '#1D4ED8',
        s: '#F1CCAA',
        e: '#111827',
        c: '#93C5FD',
        m: '#1E3A8A',
        t: '#3B82F6',
        a: '#BFDBFE'
      },
      matrix: [
        '..aaaa..',
        '.aahhaa.',
        '.hhsshh.',
        '.hsesesh',
        '.hsssssh',
        '.scssmsc',
        '..tttt..',
        '.tttttt.'
      ]
    },
    {
      id: 'berry',
      name: '莓果特工',
      bg: '#FDF2F8',
      frame: '#F472B6',
      colors: {
        h: '#9D174D',
        s: '#F4D1B0',
        e: '#111827',
        c: '#FB7185',
        m: '#831843',
        t: '#EC4899',
        a: '#FBCFE8'
      },
      matrix: [
        '.aaaaaa.',
        '.ahhhha.',
        '.hhsshhh',
        '.hsesesh',
        '.hsssssh',
        '.scssmsc',
        '..tttt..',
        '.tt..tt.'
      ]
    },
    {
      id: 'volt',
      name: '电波学员',
      bg: '#FFFBEB',
      frame: '#FACC15',
      colors: {
        h: '#713F12',
        s: '#F5D5B6',
        e: '#0F172A',
        c: '#FDE047',
        m: '#92400E',
        t: '#EAB308',
        a: '#FDE68A'
      },
      matrix: [
        '...aa...',
        '..ahha..',
        '.hhsshh.',
        '.hsesesh',
        '.hsssssh',
        '.scssmsc',
        '..tttt..',
        '.tttttt.'
      ]
    },
    {
      id: 'night',
      name: '夜跑选手',
      bg: '#EEF2FF',
      frame: '#818CF8',
      colors: {
        h: '#312E81',
        s: '#F1CFAD',
        e: '#111827',
        c: '#A5B4FC',
        m: '#4338CA',
        t: '#6366F1',
        a: '#C7D2FE'
      },
      matrix: [
        '..aaaa..',
        '.ahhhha.',
        '.hhsshh.',
        '.hsesesh',
        '.hsssssh',
        '.scssmsc',
        '..tttt..',
        '.tt..tt.'
      ]
    }
  ];

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getPresetById(id) {
    if (typeof id === 'string') {
      for (var i = 0; i < PRESETS.length; i += 1) {
        if (PRESETS[i].id === id) return PRESETS[i];
      }
    }
    return PRESETS[0];
  }

  function hasPreset(id) {
    return Boolean(id && getPresetById(id).id === id);
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

    var html = '<span class="' + classes.join(' ') + '" style="--avatar-bg:' + preset.bg + ';--avatar-frame:' + preset.frame + ';" aria-label="' + escapeHTML(label) + '" title="' + escapeHTML(label) + '">';

    preset.matrix.forEach(function eachRow(row) {
      row.split('').forEach(function eachToken(token) {
        var color = preset.colors[token] || 'transparent';
        html += '<span class="pixel-avatar__cell' + (color === 'transparent' ? ' is-empty' : '') + '" style="background:' + color + ';"></span>';
      });
    });

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
