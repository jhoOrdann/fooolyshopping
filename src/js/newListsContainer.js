// ----- NAV inferior para .list-container (<<  >>) -----
  function installListNavBelow(container) {
    if (!container || container.__lcNavInstalled) return;
    container.__lcNavInstalled = true;

    // cria barra de navegação logo após a lista
    const nav = document.createElement('div');
    nav.className = 'lc-nav';
    nav.innerHTML = `
      <button class="nav-btn lc-prev" aria-label="Rolar para esquerda">
        <i class="ri-arrow-left-s-line"></i>
      </button>
      <button class="nav-btn lc-next" aria-label="Rolar para direita">
        <i class="ri-arrow-right-s-line"></i>
      </button>
    `;
    container.insertAdjacentElement('afterend', nav);

    const btnPrev = nav.querySelector('.lc-prev');
    const btnNext = nav.querySelector('.lc-next');
    const step = () => Math.max(container.clientWidth * 0.9, 260);
    const go = dir => container.scrollBy({ left: dir * step(), behavior: 'smooth' });

    btnPrev.addEventListener('click', () => go(-1));
    btnNext.addEventListener('click', () => go(1));

    const update = () => {
      const max = Math.max(container.scrollWidth - container.clientWidth, 0);
      const x = Math.round(container.scrollLeft);
      btnPrev.disabled = !(x > 0);
      btnNext.disabled = !(x < max - 1);
    };
    container.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(container);
    requestAnimationFrame(update);
  }

  // varre e instala nas listas já existentes
  function enhanceAllListsWithNav() {
    document.querySelectorAll('.list-container').forEach(installListNavBelow);
  }

  // expõe caso queira chamar manualmente
  window.FOOSHOP = window.FOOSHOP || {};
  window.FOOSHOP.enhanceLists = enhanceAllListsWithNav;