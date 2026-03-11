(function initMemoryCard(root) {
  function safeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildBreakdown(entry) {
    if (!Array.isArray(entry.breakdown) || entry.breakdown.length === 0) return '';
    return entry.breakdown.map(item => `
      <div class="memory-breakdown-item">
        <span class="memory-breakdown-part">${safeHTML(item.part)}</span>
        <span class="memory-breakdown-gloss">${safeHTML(item.gloss)}</span>
      </div>
    `).join('');
  }

  function getBreakdownTitle(entry) {
    if (!entry || !entry.breakdownType) return '拆词记忆';
    if (entry.breakdownType === 'root' || entry.breakdownType === 'word') return '词根 / 构词拆解';
    if (entry.breakdownType === 'phrase') return '关键词拆解';
    return '拆词记忆';
  }

  function buildRootBridge(entry) {
    if (!entry.rootConnection) return '';
    return `
      <div class="memory-root-block">
        <a class="memory-root-link" href="roots.html" onclick="event.stopPropagation()">
          <i class="fas fa-seedling"></i>
          词根联动：${safeHTML(entry.rootConnection.root)} = ${safeHTML(entry.rootConnection.meaningZh)}
        </a>
      </div>
    `;
  }

  function buildMarkup(entry, imagePath) {
    return `
      ${buildRootBridge(entry)}
      <section class="memory-section">
        <div class="memory-section-title">${safeHTML(getBreakdownTitle(entry))}</div>
        <div class="memory-breakdown-list">${buildBreakdown(entry)}</div>
      </section>
      <section class="memory-section">
        <div class="memory-section-title">幽默联想</div>
        <div class="memory-hook">${safeHTML(entry.hook || '')}</div>
      </section>
      <section class="memory-section">
        <div class="memory-section-title">Lovart 图像</div>
        <div class="memory-visual is-pending">
          <img
            class="memory-image hidden"
            data-memory-image
            src="${safeHTML(imagePath)}"
            alt="${safeHTML(entry.imageTitle || entry.en || '')}"
            loading="lazy"
          >
          <div class="memory-visual-placeholder" data-memory-placeholder>
            <i class="fas fa-image"></i>
            <span>图片待补：${safeHTML(entry.assetBaseName)}.png</span>
          </div>
        </div>
      </section>
    `;
  }

  function toggleImageState(layer, loaded) {
    const visual = layer.querySelector('.memory-visual');
    const image = layer.querySelector('[data-memory-image]');
    const placeholder = layer.querySelector('[data-memory-placeholder]');
    if (!visual || !image || !placeholder) return;

    visual.classList.toggle('is-ready', loaded);
    visual.classList.toggle('is-pending', !loaded);
    image.classList.toggle('hidden', !loaded);
    placeholder.classList.toggle('hidden', loaded);
  }

  function wireImageFallback(layer) {
    const image = layer.querySelector('[data-memory-image]');
    if (!image) return;

    image.addEventListener('load', () => toggleImageState(layer, true), { once: true });
    image.addEventListener('error', () => toggleImageState(layer, false), { once: true });

    if (image.complete) {
      toggleImageState(layer, image.naturalWidth > 0);
    }
  }

  function getEntry(card) {
    if (!card || card.type !== 'vocab' || !root.MiMemoryData) return null;
    if (typeof root.MiMemoryData.getByVocabId !== 'function') return null;
    return root.MiMemoryData.getByVocabId(card.id);
  }

  function clear(refs) {
    if (!refs) return;
    if (refs.flashcard) refs.flashcard.classList.remove('has-memory');
    if (refs.memoryLayer) {
      refs.memoryLayer.classList.remove('active');
      refs.memoryLayer.innerHTML = '';
    }
    if (refs.memoryFlag) refs.memoryFlag.classList.add('hidden');
  }

  function render(card, refs) {
    if (!refs || !refs.flashcard || !refs.memoryLayer || !refs.memoryFlag) return;

    const entry = getEntry(card);
    if (!entry) {
      clear(refs);
      return;
    }

    const imagePath = typeof root.MiMemoryData.getImagePath === 'function'
      ? root.MiMemoryData.getImagePath(entry)
      : '';

    refs.flashcard.classList.add('has-memory');
    refs.memoryFlag.classList.remove('hidden');
    refs.memoryLayer.classList.add('active');
    refs.memoryLayer.innerHTML = buildMarkup(entry, imagePath);
    wireImageFallback(refs.memoryLayer);
  }

  root.MiMemoryCard = {
    clear,
    render
  };
})(window);
