function mapDeliveryTag(p) {
    if (p.deliveryType === 'full') {
        return `<span class="tag tag-delivery"><i class="ri-flashlight-fill"></i> Full</span>`;
    }
    if (p.deliveryType === 'gratis') {
        return `<span class="tag tag-delivery-add" title="Talvez seja necessário selecionar uma opção de entrega."><i class="ri-box-3-fill"></i></span>`;
    }
    if (p.deliveryType === 'frete') {
        return `<span class="tag tag-delivery-add" title="Talvez seja necessário selecionar uma opção de entrega."><i class="ri-box-3-fill"></i></span>`;
    }
    return '';
}

function mapMarketPlaceLogo(p) {
  if (p.marketplacelogo === 'mercadolivrelg') return `<img class="marcaproduto" src="https://ecommerce.sejaumpartner.com/wp-content/uploads/2022/12/PARCEIRO3.webp" />`;
  if (p.marketplacelogo === 'shoppelg') return `<img class="marcaproduto" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/1200px-Shopee.svg.png" />`;
  if (p.marketplacelogo === 'amazonlg') return `<img class="marcaproduto" src="https://d24wuq6o951i2g.cloudfront.net/img/events/id/457/457835240/assets/68cf2b4ace3170b53a34066775dcc2bd.amazon_logo_RGB_REV.png" />`;
  return '';
}

function officialTag(p) {
    if (!p.officialStore) return '';
    return `<span class="tag tag-official"><i class="ri-verified-badge-fill"></i> ${p.officialStore}</span>`;
}

(function () {
    const API_BASE = 'https://apifooolyshopping.shardweb.app';

    function productCard(p) {
        const desc = (p.description || '').trim();
        const short = desc.length > 50 ? desc.slice(0, 50) + '...' : desc;
        const nome = (p.name).trim();
        const nomeCurto = nome.length > 19 ? nome.slice(0, 19) + '...' : nome;
        const promo = p.promoIsActive && p.promoLabel ? `<span class="tag tag-promo">${p.promoLabel}</span>` : '';
        const delivery = mapDeliveryTag(p);
        const marketplacelogo = mapMarketPlaceLogo(p);
        const tagOficial = officialTag(p);

        // estrutura próxima do seu exemplo <div class="vid-list">
        return `
            <div class="vid-list js-open-produto c-click" data-id="${p.id}">
                <img class="thumbnail" src="${p.imageUrl}" alt="${p.name}">
                <p class="m-p">${tagOficial}</p>
                <a class="product-title">${nomeCurto}</a>
                <a><p class="product-desc">${short} <span class="ler-mais">Ler mais</span></p></a>
                <div class="product-price-row">
                    <span class="preco">R$${p.price}</span>
                </div>
                <p class="m-g">${promo} ${delivery}</p>
                <p>${marketplacelogo}</p>
            </div>
        `;
    }

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

    async function hydrateProductsSection(el) {
        try {
            let url = el.dataset.api || '';
            if (!url) {
                const m = el.id?.match(/^(.+)-produtos$/i);
                if (!m) return;
                const categoria = m[1];
                url = `${API_BASE}/api/produtos?c=${encodeURIComponent(categoria)}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            const items = data.items || [];
            if (!items.length) {
                el.innerHTML = `<p style="color:gray">Nenhum produto aqui ainda.</p>`;
                // mesmo sem itens, instala nav (pra manter layout consistente se quiser)
                installListNavBelow(el);
                return;
            }
            el.innerHTML = items.map(productCard).join('');

            // instala nav depois de popular a lista
            installListNavBelow(el);
        } catch (e) {
            console.warn('falha ao carregar produtos', e);
            el.innerHTML = `<p style="color:gray">Falha ao carregar produtos.</p>`;
            installListNavBelow(el);
        }
    }

    function bootProductSections() {
        const nodes = Array.from(document.querySelectorAll('[id$="-produtos"], [data-api*="/api/produtos"]'));
        nodes.forEach(hydrateProductsSection);
    }

    // clique global pra abrir produto.html ou p.html
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.js-open-produto');
        if (!card) return;
        e.preventDefault();
        const id = card.dataset.id;
        if (!id) return;
        // você escolhe: produto.html ou p.html
        window.location.href = `/produto.html?i=${encodeURIComponent(id)}`;
    });

    window.FOOSHOP = window.FOOSHOP || {};
    window.FOOSHOP.bootProductSections = bootProductSections;
    window.FOOSHOP.enhanceLists = enhanceAllListsWithNav;

    window.addEventListener('DOMContentLoaded', () => {
        bootProductSections();
        // se em algum lugar você criar .list-container na mão antes de popular via API:
        // FOOSHOP.enhanceLists();
    });
})();