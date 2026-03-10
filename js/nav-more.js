(function initBottomMoreMenu() {
  const TAB_FOR_PAGE = {
    'index.html': 'index',
    'learn.html': 'learn',
    'practice.html': 'practice',
    'scenarios.html': 'scenarios',
    'browse.html': 'more',
    'roots.html': 'more',
    'progress.html': 'more'
  };

  const MORE_LINKS = [
    { href: 'browse.html', label: '词汇浏览', icon: 'fa-list-ul' },
    { href: 'roots.html', label: '词根学习', icon: 'fa-seedling' },
    { href: 'progress.html', label: '学习进度', icon: 'fa-chart-line' }
  ];

  function getCurrentPage() {
    const current = window.location.pathname.split('/').pop();
    return current || 'index.html';
  }

  function syncActiveTab() {
    const currentPage = getCurrentPage();
    const targetTab = TAB_FOR_PAGE[currentPage] || 'index';

    document.querySelectorAll('.tab-bar-btn[data-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetTab);
    });
  }

  function ensureMenuNodes() {
    if (document.getElementById('moreMenuDrawer') && document.getElementById('moreMenuBackdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'moreMenuBackdrop';
    backdrop.className = 'more-menu-backdrop hidden';

    const drawer = document.createElement('aside');
    drawer.id = 'moreMenuDrawer';
    drawer.className = 'more-menu-drawer hidden';

    const currentPage = getCurrentPage();
    const linkHtml = MORE_LINKS.map(item => {
      const active = item.href === currentPage ? 'active' : '';
      return `
        <a href="${item.href}" class="more-menu-link ${active}" data-more-link="${item.href}">
          <span class="more-menu-left"><i class="fas ${item.icon}"></i>${item.label}</span>
          <i class="fas fa-chevron-right"></i>
        </a>
      `;
    }).join('');

    drawer.innerHTML = `
      <div class="more-menu-handle"></div>
      <div class="more-menu-head">
        <div class="more-menu-title">更多页面</div>
        <button type="button" class="more-menu-close" data-action="close-more-menu" aria-label="关闭">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <div class="more-menu-links">
        ${linkHtml}
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
  }

  function setMenuOpen(open) {
    const drawer = document.getElementById('moreMenuDrawer');
    const backdrop = document.getElementById('moreMenuBackdrop');
    if (!drawer || !backdrop) return;

    drawer.classList.toggle('hidden', !open);
    backdrop.classList.toggle('hidden', !open);
  }

  function bindMenuEvents() {
    document.addEventListener('click', event => {
      const openBtn = event.target.closest('[data-action="open-more-menu"]');
      if (openBtn) {
        event.preventDefault();
        ensureMenuNodes();
        setMenuOpen(true);
        return;
      }

      if (event.target.closest('[data-action="close-more-menu"]')) {
        setMenuOpen(false);
        return;
      }

      const backdrop = event.target.closest('#moreMenuBackdrop');
      if (backdrop) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    });
  }

  syncActiveTab();
  ensureMenuNodes();
  bindMenuEvents();
})();
