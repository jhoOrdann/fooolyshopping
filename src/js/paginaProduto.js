// ====== Funções utilitárias ======
function mapDeliveryTag(p) {
  if (p.deliveryType === 'full') return `<span class="badge-entregafull"><i class="ri-flashlight-fill"></i> Entrega Full</span>`;
  if (p.deliveryType === 'gratis') return `<span class="badge-entregagratis"><i class="ri-gift-2-fill"></i> Entrega Grátis</span>`;
  if (p.deliveryType === 'frete') return `<span class="badge-entregafrete"><i class="ri-money-dollar-circle-fill"></i> Frete adicional</span>`;
  return '';
}

function mapDeliveryTagPt(p) {
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
  if (p.marketplacelogo === 'mercadolivrelg') return `<img src="https://vectorseek.com/wp-content/uploads/2023/08/Mercado-Livre-Icon-Logo-Vector.svg-.png" />`;
  if (p.marketplacelogo === 'shoppelg') return `<img src="https://www.freepnglogos.com/uploads/shopee-logo/shopee-bag-logo-free-transparent-icon-17.png" />`;
  if (p.marketplacelogo === 'amazonlg') return `<img src="https://cdn.logojoy.com/wp-content/uploads/20230629132639/current-logo-600x338.png" />`;
  return '';
}

function mapMarketPlaceLogoPt(p) {
  if (p.marketplacelogo === 'mercadolivrelg') return `<img class="marcaproduto" src="https://ecommerce.sejaumpartner.com/wp-content/uploads/2022/12/PARCEIRO3.webp" />`;
  if (p.marketplacelogo === 'shoppelg') return `<img class="marcaproduto" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/1200px-Shopee.svg.png" />`;
  if (p.marketplacelogo === 'amazonlg') return `<img class="marcaproduto" src="https://d24wuq6o951i2g.cloudfront.net/img/events/id/457/457835240/assets/68cf2b4ace3170b53a34066775dcc2bd.amazon_logo_RGB_REV.png" />`;
  return '';
}

function officialTag(p) {
  if (!p.officialStore) return '';
  return `<span class="badge-lojaoficial"><i class="ri-verified-badge-fill"></i> Loja Oficial ${p.officialStore}</span>`;
}

function officialTagPt(p) {
  if (!p.officialStore) return '';
  return `<span class="badge-lojaoficial"><i class="ri-verified-badge-fill"></i> ${p.officialStore}</span>`;
}

function promoTag(p) {
  if (!p.promoIsActive || !p.promoLabel) return '';
  return `<span class="tag tag-promo">${p.promoLabel}</span>`;
}

// ====== Cards de produtos relacionados ======
function relatedProductCard(p) {
  const delivery = mapDeliveryTagPt(p);
  const official = officialTagPt(p);
  const promo = promoTag(p);
  const nome = (p.name).trim();
  const nomeCurto = nome.length > 19 ? nome.slice(0, 19) + '...' : nome;
  const desc = (p.description || '').trim();
  const short = desc.length > 50 ? desc.slice(0, 50) + '...' : desc;
  const marketplacelogo = mapMarketPlaceLogoPt(p);
  return `
    <div class="vid-list js-open-related c-click related-cards" data-id="${p.id}">
      <img class="thumbnail" src="${p.imageUrl}" alt="${p.name}">
      <p class="m-p">${official}</p>
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

// ====== Carrossel de produtos relacionados ======
async function loadRelated(category, currentId) {
  const box = document.getElementById('related-cards');
  if (!box) return;

  if (!category) {
    box.innerHTML = `<p style="color:#888">Nenhuma categoria definida para este produto.</p>`;
    return;
  }

  try {
    const res = await fetch(`https://apifooolyshopping.shardweb.app/api/produtos?c=${encodeURIComponent(category)}`);
    const data = await res.json();
    let items = (data.items || []).filter(p => p.id !== currentId).slice(0, 6);
    if (!items.length) {
      box.innerHTML = `<p style="color:#888">Nenhum produto relacionado nesta categoria ainda.</p>`;
      return;
    }

    // cria container horizontal
    box.classList.add('list-container');
    box.innerHTML = items.map(relatedProductCard).join('');

    // instala navegação abaixo
    installListNavBelow(box);
  } catch (e) {
    console.error(e);
    box.innerHTML = `<p style="color:#f66">Erro ao carregar produtos relacionados.</p>`;
  }
}

// ====== Botões de navegação (<<  >>) ======
function installListNavBelow(container) {
  if (!container || container.__lcNavInstalled) return;
  container.__lcNavInstalled = true;

  const nav = document.createElement('div');
  nav.className = 'lc-nav';
  nav.innerHTML = `
    <button class="nav-btn lc-prev" aria-label="Rolar para esquerda"><i class="ri-arrow-left-s-line"></i></button>
    <button class="nav-btn lc-next" aria-label="Rolar para direita"><i class="ri-arrow-right-s-line"></i></button>`;
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

// ====== Compartilhar Produto ======
function setupShareButton(p) {
  const btn = document.getElementById('partilharProduto');
  if (!btn) return;

  // Monta link curto p.html?i={id}
  const link = `${location.origin}/p?i=${encodeURIComponent(p.id)}`;

  // substitui o href pra segurança
  btn.href = link;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    const shareData = {
      title: p.name,
      text: `${p.name} - Confira este produto no Foooly Shopping!`,
      url: link,
      files: []
    };

    // Preferência: usa imagem se o navegador suportar compartilhamento com arquivo
    try {
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      console.warn('Compartilhamento direto falhou:', err);
    }

    // Fallback: copia o link pro clipboard
    try {
      await navigator.clipboard.writeText(link);
      btn.innerHTML = `<i class="ri-check-line"></i>`;
      btn.title = "Link copiado!";
      setTimeout(() => {
        btn.innerHTML = `<i class="ri-share-2-line"></i>`;
        btn.title = "Compartilhar";
      }, 2000);
    } catch {
      alert('Copie o link: ' + link);
    }
  });
}

// ====== Produto principal ======
async function loadProduct() {
  const id = new URLSearchParams(location.search).get('i');
  const container = document.getElementById('prod-container');
  const breadcrumb = document.getElementById('breadcrumb');

  if (!id) {
    container.textContent = 'ID não informado.';
    return;
  }

  try {
    const res = await fetch(`https://apifooolyshopping.shardweb.app/api/produtos?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!res.ok) {
      container.textContent = data.error || 'Produto não encontrado.';
      return;
    }

    const p = data.item;
    const delivery = mapDeliveryTag(p);
    const official = officialTag(p);
    const marketplacelogo = mapMarketPlaceLogo(p);
    const promo = promoTag(p);
    const descHtml = (p.description || '').replace(/\n/g, '<br>');

    // === título e favicon dinâmicos ===
    document.title = `${p.name} – Foooly Shopping`;
    const fav = document.querySelector("link[rel='icon']") || document.createElement('link');
    fav.rel = 'icon';
    fav.href = p.imageUrl;
    document.head.appendChild(fav);

    // === OG META tags dinâmicas ===
    const ogs = [
      ['og:title', p.name],
      ['og:description', p.description.slice(0, 120) + '...'],
      ['og:image', p.imageUrl],
      ['og:url', location.href],
      ['og:type', 'product']
    ];
    ogs.forEach(([prop, val]) => {
      let tag = document.querySelector(`meta[property='${prop}']`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', prop);
        document.head.appendChild(tag);
      }
      tag.content = val;
    });

    // === breadcrumb ===
    breadcrumb.innerHTML = `<a href="/">Início</a><span>›</span><span>${p.category || 'Categoria'}</span>`;

    // === corpo principal ===
    container.innerHTML = `
      <div class="product-main">
        <div class="product-gallery">
          <div class="product-gallery-main"><img src="${p.imageUrl}" alt="${p.name}"></div>
        </div>
        <div class="product-info">
          <div class="product-meta-top">
            <span class="product-condition"></span>
            <span class="product-category">Categoria: ${p.category || 'Nenhuma categoria'}</span>
          </div>
          <div class="product-badge-mrg">${official}</div>
          <h1 class="product-title-large">${p.name}</h1>
          <div class="product-price-box">
            <div class="price-main-line">
              <span class="product-price-large">R$${p.price}</span>
              ${p.promoIsActive && p.promoLabel ? `<span class="badge-promo">${p.promoLabel}</span>` : ''}
            </div>
          </div>
          <button class="btn-buy" style="background:${p.buttonColor || '#ff751f'};"
            onclick="window.open('${p.link}','_blank')">${marketplacelogo} ${p.buttonText || 'Comprar'} <i class="ri-external-link-line"></i></button>
          <p class="comprar-linkexterno"><i class="ri-information-2-fill"></i> Você será redirecionado para ${p.marketplace || 'a loja oficial'}</p>
          <div class="product-extra-info">
            ${delivery ? `<p>${delivery}</p>` : ''}
            ${p.manufactory ? `<p style="margin-top: 15px;"><i class="ri-store-2-fill"></i> Vendido por: ${p.manufactory}</p>` : ''}
            <p><i class="ri-shield-check-fill"></i> Compra segura no(a) ${p.marketplace || ''}</p>
          </div>
        </div>
      </div>
      <div class="product-description-box">
        <h1 class="titleNow" style="margin-bottom: 15px;"><i class="ri-file-text-fill"></i> Descrição</h1>
        <p>${descHtml}</p>
      </div>
      <div class="product-related-box">
        <h1 class="titleNow" style="margin-bottom: 15px;"><i class="ri-add-circle-fill"></i> Produtos relacionados</h1>
        <div class="cards" id="related-cards">
          <p style="color:#888">Carregando produtos relacionados...</p>
        </div>
      </div>`;
    setupShareButton(p);
    loadRelated(p.category, p.id);
  } catch (e) {
    console.error(e);
    container.textContent = 'Erro ao carregar produto.';
  }
}

// ====== Clique em produtos relacionados ======
document.addEventListener('click', (e) => {
  const card = e.target.closest('.js-open-related');
  const lerMais = e.target.closest('.ler-mais');
  const id = (card && card.dataset.id) || (lerMais && lerMais.dataset.id);
  if (!id) return;
  e.preventDefault();
  window.location.href = `produto.html?i=${encodeURIComponent(id)}`;
});

loadProduct();