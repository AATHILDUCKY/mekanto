/* Mekanto — shared layouts, catalog and progressive storefront interactions. */
'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
const params = new URLSearchParams(location.search);
const page = document.body.dataset.page || '404';
if (location.pathname.endsWith('/index.html')) history.replaceState({}, '', location.pathname.slice(0, -10) + location.search + location.hash);
let catalog, posts, galleryItems = [], toastTimer;
const catalogIndex = { products: new Map(), categories: new Map(), search: new Map() };
const DEFAULT_SITE_URL = 'https://mekanto.com';
const icons = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  diagonal: '<path d="M6 18 18 6M6 6h12v12"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  bag: '<path d="M5 8h14l1 13H4L5 8Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  cube: '<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10 9-5M12 13 3 8m9 5v9M7.5 5.5l9 5"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  desk: '<path d="M3 12h18M5 12v8m14-8v8M7 4h10v8M9 8h6"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  drone: '<circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="m7 7 10 10M7 17 17 7"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  circuit: '<path d="M8 3v5h8V3M4 12h16M8 21v-5h8v5"/><circle cx="8" cy="3" r="1"/><circle cx="16" cy="3" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="20" cy="12" r="1"/>',
  tool: '<path d="m14 6 4 4M3 21l9-9m2-9 7 7-3 3-7-7 3-3ZM8 12l4 4-7 6-3-3 6-7Z"/>',
  leaf: '<path d="M20 3c-1 11-2 15-8 16a7 7 0 0 1-7-7c1-6 7-8 15-9ZM3 21l12-12"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  heart: '<path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15Z"/>',
  ruler: '<path d="m4 15 11-11 6 6-11 11-6-6ZM9 10l2 2m2-6 2 2m-2 6 2 2"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3H12a9 9 0 0 1 9 8.5Z"/><path d="M7 11h10m-10 4h6"/>',
  robot: '<path d="M3 21h18M7 21v-4h10v4M12 17l-5-7 5-6 7 6-5 5"/><circle cx="7" cy="10" r="2"/><circle cx="12" cy="4" r="2"/><path d="m18 10 3 2-2 3-3-1"/>',
  wall: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="m7 16 3-5 3 3 2-4 3 6M8 8h.01"/>',
  phone: '<rect x="7" y="2" width="10" height="16" rx="2"/><path d="M10 21h4m-6 0h8M10 5h4"/>',
  filter: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="var(--paper)"/><circle cx="15" cy="17" r="2" fill="var(--paper)"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
function icon(name, className = '') { return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.cube}</svg>`; }
function money(value) { return new Intl.NumberFormat(catalog.store.locale, { style: 'currency', currency: catalog.store.currency, maximumFractionDigits: 0 }).format(value); }
function siteUrl(path = location.pathname, query = location.search) {
  const configured = catalog?.store?.siteUrl || DEFAULT_SITE_URL;
  try { return new URL(`${path}${query}`, new URL(configured)).href; } catch { return new URL(`${path}${query}`, location.origin).href; }
}
function setSeo({title, description, type = 'website', image = 'aseets/maker-hero.webp', canonical = siteUrl(), schema} = {}) {
  if (title) document.title = title;
  if (description) $('meta[name="description"]').setAttribute('content', description);
  const imageUrl = new URL(image, catalog?.store?.siteUrl || location.origin).href;
  const values = {'meta[property="og:url"]':canonical,'meta[property="og:title"]':document.title,'meta[property="og:description"]':description || $('meta[name="description"]').content,'meta[property="og:type"]':type,'meta[property="og:image"]':imageUrl,'meta[name="twitter:title"]':document.title,'meta[name="twitter:description"]':description || $('meta[name="description"]').content,'meta[name="twitter:image"]':imageUrl};
  Object.entries(values).forEach(([selector, value]) => { const element = $(selector); if (element && value) element.setAttribute('content', value); });
  const canonicalElement = $('link[rel="canonical"]'); if (canonicalElement) canonicalElement.href = canonical;
  const node = $('#structured-data');
  if (node) node.textContent = JSON.stringify(schema || {'@context':'https://schema.org','@type':'WebSite',name:catalog.store.name,url:siteUrl('/'),potentialAction:{'@type':'SearchAction',target:`${siteUrl('/shop/')}?q={search_term_string}`,'query-input':'required name=search_term_string'}});
}
function storeSchema() { return {'@context':'https://schema.org','@type':'Organization',name:catalog.store.name,url:siteUrl('/'),logo:siteUrl('/aseets/favicon.svg'),contactPoint:{'@type':'ContactPoint',telephone:`+${catalog.store.whatsappNumber}`,contactType:'sales',availableLanguage:'en'}}; }
function category(id) { return catalogIndex.categories.get(id) || {id, name:'Custom objects'}; }
function searchText(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function normalizeCatalog(data) {
  if (!Array.isArray(data.categories) || !data.categories.length || !Array.isArray(data.products)) throw new Error('The catalog needs categories and a products array.');
  const store = {name:'Mekanto', currency:'LKR', locale:'en-LK', sampleCatalog:true, ...data.store};
  const categories = data.categories.map(c => ({description:'', icon:'cube', ...c}));
  catalogIndex.categories.clear(); catalogIndex.products.clear(); catalogIndex.search.clear();
  for (const item of categories) {
    if (!item.id || !item.name || catalogIndex.categories.has(item.id)) throw new Error('Each category needs a unique ID and a name.');
    catalogIndex.categories.set(item.id, item);
  }
  const products = data.products.map(raw => {
    const primary = raw.category || raw.categories?.[0];
    const name = raw.title || raw.name;
    if (!raw.id || !name || !catalogIndex.categories.has(primary) || !Number.isFinite(raw.price) || raw.price < 0 || catalogIndex.products.has(raw.id)) throw new Error(`Check the ID, title, category and price for product: ${raw.id || '(missing ID)'}`);
    const categoryIds = [...new Set([primary, ...(Array.isArray(raw.categories) ? raw.categories : [])])];
    if (categoryIds.some(id => !catalogIndex.categories.has(id))) throw new Error(`Unknown category on ${raw.id}`);
    const colors = Array.isArray(raw.colors) && raw.colors.length ? raw.colors.map(color => ({name:String(color.name || 'Standard'), hex:/^#[0-9a-f]{6}$/i.test(color.hex) ? color.hex : '#41413e'})) : [{name:'Standard',hex:'#41413e'}];
    const product = {subtitle:'', description:`Explore ${name} from Mekanto. Contact us to confirm the details.`, material:'To discuss', dimensions:'Custom sizing', compatibility:'Confirm compatibility with Mekanto before printing.', includes:'Confirm the included parts with Mekanto.', features:[], badge:'Made for your idea', featured:false, ...raw, name, category:primary, categories:categoryIds, colors, keywords:[...new Set([...(Array.isArray(raw.keywords) ? raw.keywords : []), ...(Array.isArray(raw.tags) ? raw.tags : [])].map(String))]};
    product.features = Array.isArray(product.features) ? product.features : [];
    product.imageLayout = product.imageLayout === 'atlas' ? 'atlas' : 'single';
    product.image = safeImagePath(product.image);
    catalogIndex.products.set(product.id, product);
    catalogIndex.search.set(product.id, searchText([product.name, product.subtitle, product.description, product.material, ...product.keywords, ...categoryIds.map(id => category(id).name)].join(' ')));
    return product;
  });
  return {...data, store, categories, products};
}
function safeImagePath(value) {
  const fallback = 'aseets/product-placeholder.svg';
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try { const url = new URL(value, document.baseURI); return ['https:','http:'].includes(url.protocol) ? value.trim() : fallback; } catch { return fallback; }
}
function matchesProduct(product, query) {
  return searchText(query).split(/\s+/).filter(Boolean).every(word => catalogIndex.search.get(product.id).includes(word));
}

function readBag() { try { const data = JSON.parse(localStorage.getItem('mekanto-bag') || '[]'); return Array.isArray(data) ? data.filter(item => item && typeof item.id === 'string' && typeof item.color === 'string' && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99) : []; } catch { return []; } }
function validBag() { return readBag().filter(item => catalogIndex.products.get(item.id)?.colors.some(c => c.name === item.color)); }
function saveBag(items) { try { localStorage.setItem('mekanto-bag', JSON.stringify(items)); updateBagCount(); return true; } catch { toast('Your browser could not save the bag. Please enable local storage.'); return false; } }
function updateBagCount() { const count = (catalog ? validBag() : readBag()).reduce((sum, item) => sum + item.quantity, 0); $$('.bag-count').forEach(el => { el.textContent = count; }); updateWhatsAppLinks(); }
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3600); }
const DEFAULT_WHATSAPP_NUMBER = '94754545398';
function whatsappUrl(message) {
  const configured = catalog?.store.whatsappNumber || DEFAULT_WHATSAPP_NUMBER;
  const number = /^\d{8,15}$/.test(configured) ? configured : DEFAULT_WHATSAPP_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function bagDetails(items = catalog ? validBag() : []) {
  if (!items.length) return '';
  let total = 0;
  const lines = items.map((item, index) => {
    const product = catalogIndex.products.get(item.id);
    total += product.price * item.quantity;
    return `${index + 1}. ${product.name}\n   Product: ${product.id}\n   Color: ${item.color} | Material: ${product.material}\n   Quantity: ${item.quantity}\n   Dimensions: ${product.dimensions}\n   Sample unit price: ${money(product.price)}\n   Sample item total: ${money(product.price * item.quantity)}`;
  });
  return ['PRODUCTS IN MY CART', ...lines, '', `Sample subtotal: ${money(total)}`].join('\n\n');
}
function contactMessage() {
  const details = bagDetails();
  return details ? `Hi Mekanto! I'd like a quote for these 3D prints.\n\n${details}\n\nPlease confirm the final price, compatibility and delivery.` : "Hi Mekanto! I'd like to discuss a custom 3D print.";
}
function customMessage(topic = '') {
  const item = catalogIndex.products.get(topic);
  const context = item ? ` a custom version of ${item.name}` : topic && catalogIndex.categories.has(topic) ? ` a custom ${category(topic).name.toLowerCase()} design` : ' a custom 3D design';
  const details = bagDetails();
  return `Hi Mekanto! I'd like to discuss${context}. Please help me with the design, material, price and delivery.${details ? '\n\n' + details : ''}`;
}
function customWhatsAppLink(label, className = '', topic = '') {
  return `<a class="${className}" data-whatsapp-custom="${esc(topic)}" href="${esc(whatsappUrl(customMessage(topic)))}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function updateWhatsAppLinks() {
  $$('[data-whatsapp-contact]').forEach(link => link.href = whatsappUrl(contactMessage()));
  $$('[data-whatsapp-custom]').forEach(link => link.href = whatsappUrl(customMessage(link.dataset.whatsappCustom))); 
}
function openWhatsApp(message) {
  const url = whatsappUrl(message);
  window.open(url, '_blank', 'noopener,noreferrer');
  return url;
}

function logo() { return `<span class="brand-icon">${icon('layers')}</span><span>mekanto<span class="brand-period">.</span></span>`; }
function updateCatalogNavigation() {
  const items = catalog?.categories || [];
  const target = $('#mobile-category-links');
  if (target) target.innerHTML = items.length ? items.map(c => {
    const count = catalog.products.filter(p => p.categories.includes(c.id)).length;
    return `<a class="mobile-category-link" href="shop/?category=${encodeURIComponent(c.id)}"><span class="mobile-category-icon">${icon(c.icon)}</span><span class="mobile-category-copy"><strong>${esc(c.name)}</strong><small>${esc(c.description)}</small></span><span class="mobile-category-count">${count}</span>${icon('chevron')}</a>`;
  }).join('') : '<p class="mobile-menu-loading">Loading the collection…</p>';
  const footer = $('#footer-category-links');
  if (footer) footer.innerHTML = items.map(c => `<a href="shop/?category=${encodeURIComponent(c.id)}">${esc(c.name)}</a>`).join('');
}
function renderHeader() {
  $('#site-header').innerHTML = `<div class="announcement"><span>Thoughtfully designed. Layer by layer.</span>${customWhatsAppLink(`Have an idea? Let's make it ${icon('arrow')}`)}</div>
    <header class="header"><div class="container header-inner flex items-center justify-between"><a class="brand" href="./" aria-label="Mekanto home">${logo()}</a>
    <nav class="desktop-nav" aria-label="Main navigation"><a href="shop/" ${['shop','product'].includes(page) ? 'aria-current="page"' : ''}>Shop all</a><a href="./#categories">Categories</a><a href="gallery/" ${page === 'gallery' ? 'aria-current="page"' : ''}>Gallery</a><a href="custom/" ${page === 'custom' ? 'aria-current="page"' : ''}>Custom prints<span class="nav-dot"></span></a><a href="blog/" ${['blog','article'].includes(page) ? 'aria-current="page"' : ''}>The journal</a><a href="about/" ${page === 'about' ? 'aria-current="page"' : ''}>Our story</a></nav>
    <div class="header-actions flex items-center"><button class="icon-button search-open" aria-label="Search products">${icon('search')}</button><a class="bag-link" href="cart/" aria-label="View cart">${icon('bag')}<span class="bag-count">0</span></a><button id="menu-toggle" class="icon-button menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-menu-dialog">${icon('menu')}</button></div></div></header>
    <dialog id="mobile-menu-dialog" class="mobile-menu-dialog" aria-labelledby="mobile-menu-title"><div class="mobile-menu-head"><div><span class="eyebrow">YOUR NEXT IDEA STARTS HERE</span><h2 id="mobile-menu-title">Explore Mekanto.</h2></div><button id="mobile-menu-close" class="icon-button" aria-label="Close navigation" autofocus>${icon('close')}</button></div><div class="mobile-menu-scroll"><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation"><a class="mobile-shop-link" href="shop/">${icon('cube')}<span>Shop all products</span>${icon('arrow')}</a><span class="mobile-menu-label">BROWSE BY CATEGORY</span><div id="mobile-category-links"></div><div class="mobile-secondary-links"><a href="gallery/">Gallery ${icon('diagonal')}</a><a href="blog/">The journal ${icon('diagonal')}</a><a href="about/">Our story ${icon('diagonal')}</a></div></nav></div><div class="mobile-menu-footer">${customWhatsAppLink(`Create something custom ${icon('chat')}`, 'button button-whatsapp')}<a class="mobile-cart-link" href="cart/">Your cart <span class="bag-count">0</span>${icon('arrow')}</a></div></dialog>`;
  const dialog = $('#mobile-menu-dialog');
  const toggle = $('#menu-toggle');
  function closeMenu() { if (dialog.open) dialog.close(); }
  toggle.addEventListener('click', () => {
    if (dialog.open) return closeMenu();
    const top = Math.max(0, Math.round($('.header').getBoundingClientRect().bottom));
    dialog.style.setProperty('--menu-top', `${top}px`);
    dialog.showModal(); document.body.classList.add('mobile-menu-open');
    toggle.setAttribute('aria-expanded','true'); toggle.setAttribute('aria-label','Close navigation');
  });
  $('#mobile-menu-close').addEventListener('click', closeMenu);
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = $$('a[href], button:not([disabled])', dialog).filter(el => el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  dialog.addEventListener('close', () => { document.body.classList.remove('mobile-menu-open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open navigation'); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu(); }
    if (event.target.closest('a')) closeMenu();
  });
  window.addEventListener('resize', () => { if (innerWidth > 760) closeMenu(); });
  $('.search-open').addEventListener('click', openSearch);
  updateCatalogNavigation(); updateBagCount();
}
function renderFooter() {
  $('#site-footer').innerHTML = `<footer class="footer"><div class="container footer-top"><div class="footer-brand"><a class="brand" href="./" aria-label="Mekanto home">${logo()}</a><p>Useful little things.<br>Made with a lot of thought.</p><span class="footer-note">Designed for real life. Made layer by layer.</span></div><div class="footer-categories"><h2>Find your thing</h2><div id="footer-category-links"></div></div><div><h2>Around the studio</h2><a href="about/">Our story</a><a href="gallery/">Gallery</a><a href="custom/">Custom printing</a><a href="blog/">The journal</a><a href="about/#faq">Questions & answers</a></div><div class="footer-idea"><h2>Something on your mind?</h2><p>A sketch, a file, or a small problem.<br>That's a good place to start.</p><a class="text-link" data-whatsapp-contact href="${whatsappUrl(contactMessage())}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp ${icon('chat')}</a><a class="footer-phone" href="tel:+${catalog?.store.whatsappNumber || DEFAULT_WHATSAPP_NUMBER}">${esc(catalog?.store.whatsappDisplay || '075 454 5398')}</a></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} Mekanto. Thoughtfully made.</span><div><a href="about/#privacy">Privacy</a><a href="about/#ordering">Ordering & delivery</a><span class="footer-location">Small ideas. Real possibilities.</span></div></div></footer><a class="whatsapp-float" data-whatsapp-contact href="${whatsappUrl(contactMessage())}" target="_blank" rel="noopener noreferrer" aria-label="Discuss your project with Mekanto on WhatsApp">${icon('chat')}<span>Let's talk</span></a>`;
}
function productImage(product, className = '') {
  const atlas = product.imageLayout === 'atlas';
  const position = /^(0|100)% (0|100)%$/.exec(product.imagePosition || '0% 0%');
  const x = atlas && position ? -Number(position[1]) : 0;
  const y = atlas && position ? -Number(position[2]) : 0;
  return `<div class="product-image-frame ${className}"><img class="product-image ${atlas ? 'product-image-atlas' : 'product-image-single'}" data-product-image src="${esc(safeImagePath(product.image))}" alt="${esc(product.imageAlt || product.name)}" width="1254" height="1254" loading="lazy" decoding="async" ${atlas ? `style="--atlas-x:${x}%;--atlas-y:${y}%"` : ''}></div>`;
}
function productCard(p) { return `<article class="product-card"><a class="product-photo-link" href="product/?id=${encodeURIComponent(p.id)}" aria-label="View ${esc(p.name)}">${productImage(p)}<span class="product-badge">${esc(p.badge)}</span><span class="card-arrow">${icon('diagonal')}</span></a><div class="product-meta"><span>${esc(category(p.category).name)}</span><span>${esc(p.material)}</span></div><a href="product/?id=${encodeURIComponent(p.id)}" class="product-name">${esc(p.name)}</a><div class="product-bottom"><span class="price">${money(p.price)}</span><div class="swatches" aria-label="${esc(p.colors.map(c => c.name).join(', '))}">${p.colors.map(c => `<span style="--swatch:${c.hex}" title="${esc(c.name)}"></span>`).join('')}</div></div></article>`; }
function articleCard(post) { return `<article class="journal-card"><a class="journal-image-link ${esc(post.imageClass)}" href="article/?id=${encodeURIComponent(post.id)}"><img src="${esc(post.image)}" alt="${esc(post.category === 'Material notes' ? 'Peach, sage and charcoal material sample blocks' : post.category === 'Everyday design' ? 'Thoughtfully arranged 3D printed desk accessories' : '3D printed electronics enclosure concepts')}" loading="lazy" width="800" height="520"><span class="card-arrow">${icon('diagonal')}</span></a><div class="journal-meta"><span>${esc(post.category)}</span><span>${esc(post.readTime)}</span></div><h3><a href="article/?id=${encodeURIComponent(post.id)}">${esc(post.title)}</a></h3><p>${esc(post.excerpt)}</p></article>`; }
function customBanner() { return `<section class="custom-banner"><div class="custom-art" aria-hidden="true"><div class="wire-cube cube-back"></div><div class="wire-cube cube-front"></div><span class="art-plus plus-one">+</span><span class="art-plus plus-two">+</span><span class="art-note">FROM AN IDEA<br>TO SOMETHING REAL.</span></div><div class="custom-copy"><span class="eyebrow">YOUR IDEA. OUR NEXT PRINT.</span><h2>Can't find it?<br>Let's make it.</h2><p>A custom enclosure. A part that finally fits. That idea you've been sketching. Let's bring it to life.</p>${customWhatsAppLink(`Start a custom project ${icon('chat')}`, 'button button-dark')}</div><div class="custom-caption">One piece or a small batch.<br>Made around your idea.</div></section>`; }
function showcaseSection({id,number,eyebrow,title,description,image,alt,theme,points,href,label,topic}) {
  return `<section class="home-showcase showcase-${theme}" id="${id}" aria-labelledby="${id}-title"><div class="showcase-image"><img src="${image}" alt="${alt}" width="1254" height="1254" loading="lazy" decoding="async"><span class="showcase-image-caption">${number} / ${eyebrow}</span></div><div class="showcase-copy"><div class="showcase-kicker"><span class="eyebrow">${eyebrow}</span><span class="showcase-number">${number}</span></div><h2 id="${id}-title">${title}</h2><p>${description}</p><ul class="showcase-points">${points.map(point => `<li>${icon('check')}<span>${point}</span></li>`).join('')}</ul><div class="showcase-actions"><a class="button button-dark" href="${href}">${label} ${icon('arrow')}</a><a class="text-link" href="custom/?type=${topic}">Make it your own ${icon('diagonal')}</a></div><p class="showcase-note">Your dimensions. Your idea. Let's work out the details.</p></div></section>`;
}
function renderHome() {
  setSeo({title:'Mekanto — Custom 3D printing for useful ideas',description:'Custom 3D printed wall décor, mobile stands, drone frames, robotic parts, Raspberry Pi cases, IoT enclosures and useful desk accessories from Mekanto.',canonical:siteUrl('/'),schema:storeSchema()});
  $('#main').innerHTML = `<div class="container"><section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="tiny-line"></span> GOOD IDEAS, MADE REAL</div><h1>Small things.<br>Better <span>everyday.</span></h1><p>Drone frames, robotic arm parts, clever IoT enclosures.<br class="desktop-break"> Thoughtful 3D prints for whatever you're building next.</p><div class="hero-buttons flex flex-wrap gap-2.5"><a class="button button-dark" href="shop/">Explore the collection ${icon('arrow')}</a>${customWhatsAppLink(`Create something custom ${icon('chat')}`, 'button button-outline')}</div><div class="hero-topics"><a href="shop/?category=drones">Drones & propellers</a><span>·</span><a href="#robotics">Robotics</a><span>·</span><a href="#iot-design">IoT design</a></div><div class="hero-footnote"><span class="mini-layer">${icon('layers')}</span><span>Purpose in every detail.<br><strong>Possibility in every layer.</strong></span></div></div><div class="hero-visual maker-hero-visual"><img src="aseets/maker-hero.webp" width="1254" height="1254" alt="Charcoal drone frame, peach propellers and robotic arm, with a sage IoT enclosure" fetchpriority="high" decoding="async"><span class="hero-label"><span class="status-dot"></span> FOR THE BUILDERS. FOR THE CURIOUS.</span><div class="hero-image-note"><span>What will you make next?</span><a href="shop/?category=drones" aria-label="Explore drone frames and parts">${icon('diagonal')}</a></div><span class="vertical-label">THE MAKER COLLECTION — 01</span></div></section>
    <div class="values-strip"><span>${icon('cube')}Made to order, just for you</span><span>${icon('ruler')}Designed around your dimensions</span><span>${icon('layers')}One prototype or a small batch</span><span>${icon('chat')}Plan your print on WhatsApp</span></div>
    <section class="section categories-section" id="categories"><div class="section-heading"><div><span class="eyebrow">A PLACE FOR EVERY IDEA</span><h2>What are you making?</h2></div><a class="text-link" href="shop/">Explore all categories ${icon('arrow')}</a></div><div class="category-grid">${catalog.categories.map(c => `<a class="category-card category-${c.id}" href="shop/?category=${c.id}"><span class="category-icon">${icon(c.icon)}</span><div><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p></div>${icon('diagonal', 'category-arrow')}</a>`).join('')}</div></section>
    <section class="new-collection-grid" aria-label="New home and desk collections"><a class="new-collection-card collection-wall" href="shop/?category=wall-decor"><img src="aseets/wall-decor.webp" width="1254" height="1254" loading="lazy" decoding="async" alt="Three charcoal botanical 3D printed wall décor panels in a modern room"><span class="new-collection-shade"></span><span class="new-collection-copy"><span class="eyebrow">NEW FOR YOUR SPACE</span><strong>Wall décor,<br>made for the room.</strong><span>Explore wall décor ${icon('diagonal')}</span></span></a><a class="new-collection-card collection-mobile" href="shop/?category=mobile-stands"><img src="aseets/mobile-stand.webp" width="1254" height="1254" loading="lazy" decoding="async" alt="Peach 3D printed charging mobile stand"><span class="new-collection-shade"></span><span class="new-collection-copy"><span class="eyebrow">A BETTER VIEW</span><strong>Mobile stands,<br>made for everyday.</strong><span>Explore mobile stands ${icon('diagonal')}</span></span></a></section>
    <div class="showcase-intro"><span class="eyebrow">A CLOSER LOOK AT WHAT'S POSSIBLE</span><p>A part for your project.<br>A possibility for your next one.</p></div>
    ${showcaseSection({id:'robotics',number:'01',eyebrow:'ROBOTICS & ARM PARTS',title:'Put your ideas<br>in <span>motion.</span>',description:'From a first servo experiment to a desktop robotic arm. Give your build the links, joints and little details it needs to move forward.',image:'aseets/robotics.webp',alt:'Peach 3D printed robotic arm with charcoal joints, servo brackets and gripper parts',theme:'robotics',points:['Arm links, grippers & servo brackets','Mounting points made for your hardware','Start with a prototype. Refine the fit.'],href:'shop/?category=robotics',label:'Explore robotics parts',topic:'robotics'})}
    ${showcaseSection({id:'iot-design',number:'02',eyebrow:'IoT & CUSTOM ENCLOSURES',title:'A smarter home<br>for your <span>smart ideas.</span>',description:'Your circuit deserves more than a loose bundle of wires. Create an enclosure that fits your board, keeps ports accessible, and belongs wherever your project lives.',image:'aseets/iot.webp',alt:'Open sage electronics enclosure with development board, ventilated lid, Pi case and sensor mount',theme:'iot',points:['Raspberry Pi, ESP32 & sensor projects','Custom port openings & mounting posts','Designed around fit, access & airflow'],href:'shop/?category=iot',label:'Find an enclosure',topic:'iot'})}
    ${showcaseSection({id:'tech-gadgets',number:'03',eyebrow:'TECH GADGETS & EVERYDAY FIXES',title:'Little upgrades.<br><span>Better everyday.</span>',description:'A cable that stays put. A device with a proper stand. A workspace that feels a little more considered. Simple useful prints, made around the way you work.',image:'aseets/hero.webp',alt:'Peach printed cable organizer and pencil cup beside a charcoal Raspberry Pi enclosure',theme:'gadgets',points:['Cable organizers & desk accessories','Device mounts, stands & practical holders','Custom sizes for your own setup'],href:'shop/?category=desk',label:'Explore everyday gadgets',topic:'desk'})}
    <section class="section collection-section"><div class="section-heading"><div><span class="eyebrow">FROM THE WORKBENCH TO YOUR BUILD</span><h2>Meet your next useful thing.</h2></div><a href="shop/" class="text-link">Shop the collection ${icon('arrow')}</a></div><div class="product-grid grid grid-cols-2 md:grid-cols-4">${catalog.products.filter(p => p.featured).slice(0,4).map(productCard).join('')}</div><p class="catalog-caption">Concept collection · Sample pricing in ${esc(catalog.store.currency)} · Final details confirmed together.</p></section>
    ${customBanner()}
    <section class="thought-section"><div><span class="eyebrow">MORE THOUGHT. LESS STUFF.</span><h2>Not just printed.<br><span>Considered.</span></h2></div><div class="thought-copy"><p>We believe the best objects quietly make life better. A cable that stays put. A case that fits just right. A little solution to an everyday problem.</p><p>That's what we're here to make. Useful things, with a little character — and room for your own ideas.</p><a href="about/" class="text-link">A little about Mekanto ${icon('arrow')}</a></div><div class="thought-mark" aria-hidden="true">${icon('layers')}</div></section>
    <section class="section journal-section"><div class="section-heading"><div><span class="eyebrow">NOTES FROM THE WORKBENCH</span><h2>A little curiosity goes a long way.</h2></div><a href="blog/" class="text-link">Visit the journal ${icon('arrow')}</a></div><div class="journal-grid">${posts.map(articleCard).join('')}</div></section></div>`;
}
function renderShop() {
  const requestedCategory = params.get('category');
  let activeCategory = catalogIndex.categories.has(requestedCategory) ? requestedCategory : 'all';
  const selectedCategory = activeCategory === 'all' ? null : category(activeCategory);
  const categoryQuery = selectedCategory ? `?category=${encodeURIComponent(activeCategory)}` : '';
  setSeo({title:selectedCategory ? `${selectedCategory.name} — 3D printed products | Mekanto` : 'Shop 3D printed products — Mekanto',description:selectedCategory ? `Explore custom and made-to-order ${selectedCategory.name.toLowerCase()} 3D printed products from Mekanto.` : 'Explore 3D printed desk accessories, Raspberry Pi cases, drone frames, robotic parts and IoT enclosures from Mekanto.',canonical:siteUrl('/shop/',categoryQuery),schema:{'@context':'https://schema.org','@type':'CollectionPage',name:selectedCategory ? `${selectedCategory.name} products` : 'Mekanto product collection',url:siteUrl('/shop/',categoryQuery),mainEntity:{'@type':'ItemList',itemListElement:catalog.products.filter(product => activeCategory === 'all' || product.categories.includes(activeCategory)).map((product,position) => ({'@type':'ListItem',position:position+1,url:siteUrl('/product/',`?id=${encodeURIComponent(product.id)}`)}))}}});
  let draftCategory = activeCategory;
  const categoryCount = id => catalog.products.filter(p => id === 'all' || p.categories.includes(id)).length;
  const choices = [{id:'all',name:'All objects',description:'A little of everything we make.',icon:'layers'}, ...catalog.categories];
  $('#main').innerHTML = `<div class="container page-content shop-page"><div class="breadcrumb"><a href="./">Home</a>${icon('chevron')}<span>The collection</span></div><div class="page-heading"><span class="eyebrow">DESIGNED TO EARN ITS PLACE</span><h1>Find your useful thing.</h1><p>Small solutions for your desk, your electronics, and your next big idea.</p></div>
  <form id="catalog-search" class="catalog-search" role="search"><label class="sr-only" for="product-search">Search products</label>${icon('search')}<input id="product-search" name="q" type="search" placeholder="Find your next useful thing…" value="${esc(params.get('q') || '')}" autocomplete="off" enterkeyhint="search"><button class="button button-dark" type="submit" aria-label="Search products"><span>Search</span>${icon('arrow')}</button></form>
  <div class="shop-controls"><button id="open-category-filter" class="category-filter-toggle" aria-haspopup="dialog" aria-expanded="false" aria-controls="category-filter-dialog">${icon('filter')}<span><small>Category</small><strong id="category-filter-value">All objects</strong></span>${icon('chevron')}</button><div class="filter-chips shop-category-chips" role="group" aria-label="Filter by category">${choices.map(c => `<button class="filter-chip" data-category="${esc(c.id)}" aria-pressed="false">${esc(c.name)}${c.id === 'all' ? `<span>${catalog.products.length}</span>` : ''}</button>`).join('')}</div><label class="sort-label" for="product-sort"><span>Sort by</span><select id="product-sort"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select>${icon('chevron')}</label></div>
  <div class="shop-results-bar"><p id="results-count" class="results-count" role="status" aria-live="polite"></p><button id="reset-shop-filters" class="reset-shop-filters" hidden>Clear filters ${icon('close')}</button></div><div id="shop-products" class="product-grid shop-grid"></div><p class="notice catalog-notice">${esc(catalog.store.notice)}</p>${customBanner()}</div>
  <dialog id="category-filter-dialog" class="category-filter-dialog" aria-labelledby="category-filter-title"><div class="category-sheet-head"><div><span class="eyebrow">FIND YOUR THING</span><h2 id="category-filter-title">Browse by category.</h2></div><button id="close-category-filter" class="icon-button" aria-label="Close categories" autofocus>${icon('close')}</button></div><form id="category-filter-form"><fieldset class="category-sheet-options"><legend class="sr-only">Choose a product category</legend>${choices.map(c => `<label class="category-sheet-option"><input type="radio" name="shop-category" value="${esc(c.id)}" ${c.id === activeCategory ? 'checked' : ''}><span class="category-sheet-icon">${icon(c.icon)}</span><span class="category-sheet-copy"><strong>${esc(c.name)}</strong><small>${esc(c.description || '')}</small></span><span class="category-sheet-count">${categoryCount(c.id)}</span><span class="category-sheet-check">${icon('check')}</span></label>`).join('')}</fieldset><div class="category-sheet-footer"><button type="submit" class="button button-dark" id="apply-category-filter">Show products ${icon('arrow')}</button></div></form></dialog>`;
  const sort = $('#product-sort'), dialog = $('#category-filter-dialog'), toggle = $('#open-category-filter');
  if (['featured','price-low','price-high','name'].includes(params.get('sort'))) sort.value = params.get('sort');
  const matchingProducts = (categoryId, query = $('#product-search').value) => catalog.products.filter(p => (categoryId === 'all' || p.categories.includes(categoryId)) && matchesProduct(p, query));
  function updateCategoryControls() {
    $$('.shop-category-chips button').forEach(button => { const active = button.dataset.category === activeCategory; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); });
    $('#category-filter-value').textContent = activeCategory === 'all' ? 'All objects' : category(activeCategory).name;
    toggle.classList.toggle('has-filter', activeCategory !== 'all');
  }
  function resetFilters() { $('#product-search').value = ''; activeCategory = 'all'; sort.value = 'featured'; updateCategoryControls(); filterProducts(); }
  function filterProducts(updateUrl = true) {
    const query = $('#product-search').value.trim();
    const matches = matchingProducts(activeCategory, query);
    if (sort.value === 'price-low') matches.sort((a,b) => a.price - b.price);
    if (sort.value === 'price-high') matches.sort((a,b) => b.price - a.price);
    if (sort.value === 'name') matches.sort((a,b) => a.name.localeCompare(b.name));
    $('#results-count').textContent = `${matches.length} ${matches.length === 1 ? 'object' : 'objects'}${query ? ` for “${query}”` : ', thoughtfully made'}`;
    $('#reset-shop-filters').hidden = activeCategory === 'all' && !query && sort.value === 'featured';
    $('#shop-products').innerHTML = matches.length ? matches.map(productCard).join('') : `<div class="empty-state">${icon('search')}<h2>No objects found. Plenty of possibilities.</h2><p>Try a broader search or clear your filters. Have something specific in mind?</p><div class="empty-actions"><button class="button button-outline" id="clear-filters">Clear filters</button><a class="button button-dark" href="custom/">Make it custom ${icon('arrow')}</a></div></div>`;
    $('#clear-filters')?.addEventListener('click', resetFilters);
    if (updateUrl) { const url = new URL(location.href); url.search = ''; if (activeCategory !== 'all') url.searchParams.set('category', activeCategory); if (query) url.searchParams.set('q', query); if (sort.value !== 'featured') url.searchParams.set('sort', sort.value); history.replaceState({}, '', url); }
  }
  function updateSheetCount() { const count = matchingProducts(draftCategory).length; $('#apply-category-filter').innerHTML = `Show ${count} ${count === 1 ? 'object' : 'objects'} ${icon('arrow')}`; }
  toggle.addEventListener('click', () => { draftCategory = activeCategory; $$('input[name="shop-category"]').forEach(input => input.checked = input.value === draftCategory); updateSheetCount(); dialog.showModal(); document.body.classList.add('category-sheet-open'); toggle.setAttribute('aria-expanded','true'); });
  const closeSheet = () => { if (dialog.open) dialog.close(); };
  $('#close-category-filter').addEventListener('click', closeSheet);
  dialog.addEventListener('close', () => { document.body.classList.remove('category-sheet-open'); toggle.setAttribute('aria-expanded','false'); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const b = dialog.getBoundingClientRect(); if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) closeSheet(); } });
  dialog.addEventListener('keydown', event => { if (event.key !== 'Tab') return; const first = $('#close-category-filter'), last = $('#apply-category-filter'); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } });
  $$('input[name="shop-category"]').forEach(input => input.addEventListener('change', () => { draftCategory = input.value; updateSheetCount(); }));
  $('#category-filter-form').addEventListener('submit', event => { event.preventDefault(); activeCategory = draftCategory; updateCategoryControls(); filterProducts(); closeSheet(); });
  window.addEventListener('resize', () => { if (innerWidth > 760) closeSheet(); });
  $$('.shop-category-chips button').forEach(button => button.addEventListener('click', () => { activeCategory = button.dataset.category; updateCategoryControls(); filterProducts(); }));
  $('#reset-shop-filters').addEventListener('click', resetFilters);
  $('#product-search').addEventListener('input', () => filterProducts());
  $('#catalog-search').addEventListener('submit', event => { event.preventDefault(); filterProducts(); });
  sort.addEventListener('change', () => filterProducts());
  updateCategoryControls(); filterProducts(false);
}
function renderProduct() {
  const p = catalogIndex.products.get(params.get('id'));
  if (!p) return renderNotFound('That object is still an idea.', 'We could not find this product. Explore the collection or start something custom.', 'shop/', 'Explore the collection');
  setSeo({title:`${p.name} — 3D printed ${category(p.category).name} | Mekanto`,description:p.description,type:'product',image:p.image,canonical:siteUrl('/product/',`?id=${encodeURIComponent(p.id)}`),schema:{'@context':'https://schema.org','@type':'Product',name:p.name,description:p.description,image:[new URL(p.image,catalog.store.siteUrl).href],sku:p.id,category:category(p.category).name,material:p.material,offers:{'@type':'Offer',priceCurrency:catalog.store.currency,price:p.price,url:siteUrl('/product/',`?id=${encodeURIComponent(p.id)}`),availability:'https://schema.org/PreOrder',itemCondition:'https://schema.org/NewCondition'}}});
  $('#main').innerHTML = `<div class="container page-content"><div class="breadcrumb"><a href="shop/">The collection</a>${icon('chevron')}<a href="shop/?category=${p.category}">${esc(category(p.category).name)}</a>${icon('chevron')}<span>${esc(p.name)}</span></div><div class="product-detail"><div><div class="detail-visual">${productImage(p)}<span class="product-badge">Made around your everyday</span></div><p class="image-caption">Concept visualization. Color and print texture may vary.</p></div><div class="detail-copy"><span class="eyebrow">${esc(category(p.category).name)} / ${p.material}</span><h1>${esc(p.name)}</h1><p class="detail-subtitle">${esc(p.subtitle)}</p><div class="detail-price">${money(p.price)} <span>sample price</span></div><p>${esc(p.description)}</p><form id="product-form"><fieldset class="color-options"><legend>Color <span id="selected-color">${esc(p.colors[0].name)}</span></legend>${p.colors.map((c,i) => `<label class="color-option" style="--swatch:${c.hex}"><input type="radio" name="color" value="${esc(c.name)}" ${i === 0 ? 'checked' : ''}><span class="color-circle"></span><span>${esc(c.name)}</span></label>`).join('')}</fieldset><p class="field-hint">The image is a concept. Confirm the color and finish before printing.</p><div class="add-row"><label class="quantity-control"><span class="sr-only">Quantity</span><input type="number" name="quantity" min="1" max="99" value="1" required></label><button class="button button-dark" type="submit">Add to cart ${icon('bag')}</button></div></form><p class="detail-small">${icon('check')} Made to order · Final details confirmed before printing</p><a class="text-link" href="custom/?product=${encodeURIComponent(p.id)}">Need a different fit? Make it custom ${icon('arrow')}</a><div class="spec-accordions"><details open><summary>Details & dimensions ${icon('plus')}</summary><dl><div><dt>Material</dt><dd>${esc(p.material)}</dd></div><div><dt>Example size</dt><dd>${esc(p.dimensions)}</dd></div></dl><ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></details><details><summary>Compatibility & what's included ${icon('plus')}</summary><p>${esc(p.compatibility)}</p><p>${esc(p.includes)}</p></details><details><summary>How ordering works ${icon('plus')}</summary><p>Add your chosen items to the cart, then send the complete request to Mekanto on WhatsApp. Your message includes colors, materials, quantities and sample prices. Confirm the final quote and delivery in chat before printing.</p></details></div></div></div><section class="section"><div class="section-heading"><div><span class="eyebrow">WHILE YOU'RE HERE</span><h2>More good little ideas.</h2></div><a href="shop/" class="text-link">View all ${icon('arrow')}</a></div><div class="product-grid related-grid">${catalog.products.filter(other => other.id !== p.id).slice(0,3).map(productCard).join('')}</div></section></div>`;
  $$('input[name="color"]').forEach(input => input.addEventListener('change', () => $('#selected-color').textContent = input.value));
  $('#product-form').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.currentTarget); const color = data.get('color'); const quantity = Number(data.get('quantity')); if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99 || !p.colors.some(c => c.name === color)) return; const bag = validBag(); const existing = bag.find(item => item.id === p.id && item.color === color); if (existing && existing.quantity + quantity > 99) return toast('You can request up to 99 of each color. Use a custom brief for a larger batch.'); if (existing) existing.quantity += quantity; else bag.push({id:p.id, color, quantity}); if (saveBag(bag)) location.href = new URL('cart/', document.baseURI).href; });
}
function renderBlog() {
  setSeo({title:'3D printing guides & ideas — Mekanto journal',description:'Practical 3D printing guides, material notes and thoughtful ideas for drones, electronics, IoT and everyday objects.',canonical:siteUrl('/blog/'),schema:{'@context':'https://schema.org','@type':'Blog',name:'Mekanto journal',url:siteUrl('/blog/'),blogPost:posts.map(post => ({'@type':'BlogPosting',headline:post.title,url:siteUrl('/article/',`?id=${encodeURIComponent(post.id)}`),datePublished:post.date}))}});
  $('#main').innerHTML = `<div class="container page-content"><div class="page-heading journal-page-heading"><span class="eyebrow">THE MEKANTO JOURNAL</span><h1>Curiosity, in good company.</h1><p>Small discoveries, practical guides, and a few things we've been thinking about.</p></div><a href="article/?id=${posts[0].id}" class="featured-story"><div class="featured-image"><img src="${posts[0].image}" alt="3D printed desk objects in warm afternoon light" width="1254" height="1254"></div><div class="featured-story-copy"><span class="eyebrow">THE EVERYDAY EDIT / 01</span><h2>${esc(posts[0].title)}</h2><p>${esc(posts[0].excerpt)}</p><span class="text-link">Settle in for a read ${icon('arrow')}</span><span class="story-time">${esc(posts[0].category)} <span>·</span> ${esc(posts[0].readTime)}</span></div></a><section class="section"><div class="section-heading"><h2>From the workbench.</h2><span class="muted">A little reading. A lot of possibility.</span></div><div class="filter-chips blog-filters" role="group" aria-label="Filter journal"><button class="filter-chip active" data-topic="all" aria-pressed="true">All notes</button>${[...new Set(posts.map(p => p.category))].map(topic => `<button class="filter-chip" data-topic="${esc(topic)}" aria-pressed="false">${esc(topic)}</button>`).join('')}</div><div class="journal-grid" id="journal-posts">${posts.map(articleCard).join('')}</div><p id="journal-count" class="sr-only" role="status"></p></section>${customBanner()}</div>`;
  $$('.blog-filters button').forEach(button => button.addEventListener('click', () => { $$('.blog-filters button').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', b === button); }); const matching = posts.filter(p => button.dataset.topic === 'all' || p.category === button.dataset.topic); $('#journal-posts').innerHTML = matching.map(articleCard).join(''); $('#journal-count').textContent = `${matching.length} journal notes`; }));
}
function renderArticle() {
  const post = posts.find(p => p.id === params.get('id'));
  if (!post) return renderNotFound('This page has turned.', 'We could not find that journal note. There are more ideas waiting in the journal.', 'blog/', 'Visit the journal');
  setSeo({title:`${post.title} — Mekanto journal`,description:post.excerpt,type:'article',image:post.image,canonical:siteUrl('/article/',`?id=${encodeURIComponent(post.id)}`),schema:{'@context':'https://schema.org','@type':'BlogPosting',headline:post.title,description:post.excerpt,datePublished:post.date,author:{'@type':'Organization',name:'Mekanto journal'},publisher:{'@type':'Organization',name:catalog.store.name},image:[new URL(post.image,catalog.store.siteUrl).href],mainEntityOfPage:siteUrl('/article/',`?id=${encodeURIComponent(post.id)}`)}});
  $('#main').innerHTML = `<article class="container page-content article"><div class="breadcrumb"><a href="blog/">The journal</a>${icon('chevron')}<span>${esc(post.category)}</span></div><header class="article-heading"><span class="eyebrow">${esc(post.category)}</span><h1>${esc(post.title)}</h1><p>${esc(post.excerpt)}</p><div class="article-byline"><span>${esc(post.author)}</span><span>·</span><time datetime="${post.date}">${new Date(post.date + 'T12:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</time><span>·</span><span>${esc(post.readTime)}</span></div></header><div class="article-cover ${esc(post.imageClass)}"><img src="${esc(post.image)}" alt="${esc(post.category)} illustration" width="1254" height="800"></div><div class="article-body"><p class="article-intro">${esc(post.intro)}</p>${post.sections.map(section => `<section><h2>${esc(section.heading)}</h2>${section.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</section>`).join('')}${post.sources.length ? `<aside class="article-sources"><h2>Keep exploring</h2>${post.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ${icon('diagonal')}</a>`).join('')}</aside>` : ''}<div class="article-cta"><span class="eyebrow">PUT THAT IDEA TO WORK</span><h2>Make something useful.</h2><p>Explore the collection, or tell us about the part you haven't found yet.</p><div class="empty-actions"><a class="button button-dark" href="shop/?category=${post.relatedCategory}">Explore related objects ${icon('arrow')}</a><a class="button button-outline" href="custom/">Start a custom brief</a></div></div></div><section class="section"><div class="section-heading"><h2>A little more to think about.</h2></div><div class="journal-grid related-journal">${posts.filter(p => p.id !== post.id).map(articleCard).join('')}</div></section></article>`;
}
function renderCustom() {
  setSeo({title:'Custom 3D printing in Sri Lanka — Mekanto',description:'Discuss a custom 3D printed enclosure, drone part, robotics component or IoT design with Mekanto on WhatsApp.',canonical:siteUrl('/custom/')});
  const related = catalogIndex.products.get(params.get('product'));
  const requestedType = related?.category || params.get('type') || '';
  const types = [...catalog.categories.map(c => ({id:c.id, name:c.name})), {id:'other',name:'Something else'}];
  $('#main').innerHTML = `<div class="container page-content"><div class="breadcrumb"><a href="./">Home</a>${icon('chevron')}<span>Custom prints</span></div><div class="custom-layout"><div class="custom-intro"><span class="eyebrow">IT STARTS WITH “WHAT IF?”</span><h1>Your idea.<br>Made real.</h1><p>A perfect-fit enclosure. A robotic arm part. A little invention for your everyday. Tell us what you have in mind.</p><div class="process-list"><div><span>01</span><div><h3>Give it a little context.</h3><p>What should it do? Where will it live? A sketch or a model helps, but an idea is enough to begin.</p></div></div><div><span>02</span><div><h3>Send it on WhatsApp.</h3><p>We'll prepare your project details and cart items in one message. Review it and tap Send in the chat.</p></div></div><div><span>03</span><div><h3>Work out the details together.</h3><p>Confirm material, fit, finish, pricing and delivery with Mekanto before your print starts.</p></div></div></div><div class="custom-help">${icon('chat')}<div><strong>Let's talk about your idea.</strong><p><a data-whatsapp-contact href="${whatsappUrl(contactMessage())}" target="_blank" rel="noopener noreferrer">WhatsApp · ${esc(catalog.store.whatsappDisplay)}</a></p></div></div></div><form id="custom-form" class="custom-form"><span class="eyebrow">THE PROJECT BRIEF</span><h2>What are we making?</h2><p class="form-intro">A few details help us understand your idea. Send the brief straight to Mekanto on WhatsApp.</p><div class="form-row"><label>Your name <span>*</span><input name="name" autocomplete="name" required maxlength="100" placeholder="Alex Perera"></label><label>Email address <span class="optional">(optional)</span><input name="email" type="email" autocomplete="email" maxlength="254" placeholder="alex@example.com"></label></div><label>Project type<select name="type">${types.map(type => `<option value="${type.name}" ${type.id === requestedType ? 'selected' : ''}>${type.name}</option>`).join('')}</select></label><label>Project name <span>*</span><input name="project" required maxlength="150" placeholder="A home for my weather station" value="${related ? esc(`Custom ${related.name}`) : ''}"></label><label>Tell us about your idea <span>*</span><textarea name="description" required minlength="20" maxlength="3000" rows="5" placeholder="What does it need to do? Include mounting points, your hardware, and where the part will be used."></textarea><span class="field-hint">At least 20 characters. Mention the exact board or servo model if relevant.</span></label><label>Dimensions <span class="optional">(if known)</span><input name="dimensions" maxlength="150" placeholder="e.g. 85 × 60 × 30 mm"></label><div class="form-row"><label>Material preference<select name="material"><option>Help me choose</option>PLA</option>PETG</option>ASA</option>TPU</option></select></label><label>How many?<input name="quantity" type="number" min="1" max="10000" value="1" required></label></div><label>Color or finish<input name="color" maxlength="100" placeholder="Peach, graphite, or something else"></label>${validBag().length ? `<div class="brief-cart-note">${icon('bag')}<span>Your ${validBag().reduce((sum,item) => sum+item.quantity,0)} cart ${validBag().reduce((sum,item) => sum+item.quantity,0) === 1 ? 'item is' : 'items are'} included in this message too.</span></div>` : ''}<button class="button button-whatsapp form-submit" type="submit">Send project on WhatsApp ${icon('chat')}</button><button class="brief-download" id="download-brief" type="button">Keep a copy of my brief ${icon('download')}</button><p class="form-privacy">Your details are shared when you tap Send in WhatsApp.</p><div id="brief-result" class="brief-result" role="status" tabindex="-1" hidden></div></form></div></div>`;
  function projectMessage() {
    const form = new FormData($('#custom-form'));
    const details = bagDetails();
    return ["Hi Mekanto! I'd like a quote for a custom 3D print.", '', 'CUSTOM PROJECT', `Name: ${form.get('name').trim()}`, `Email: ${form.get('email').trim() || 'Not provided'}`, `Project type: ${form.get('type')}`, `Project: ${form.get('project').trim()}`, '', 'THE IDEA', form.get('description').trim(), '', `Dimensions: ${form.get('dimensions').trim() || 'To discuss'}`, `Material: ${form.get('material')}`, `Quantity: ${form.get('quantity')}`, `Color / finish: ${form.get('color').trim() || 'To discuss'}`, ...(details ? ['', details] : []), '', 'Please confirm the design, material, final price and delivery.'].join('\n');
  }
  $('#custom-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const url = openWhatsApp(projectMessage());
    const result = $('#brief-result'); result.hidden = false;
    result.innerHTML = `<strong>Your project message is ready.</strong><p>Review the details and tap Send in WhatsApp.</p><a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open WhatsApp again ${icon('diagonal')}</a>`;
    result.focus();
  });
  $('#download-brief').addEventListener('click', () => { if ($('#custom-form').reportValidity()) { downloadFile('mekanto-project-brief.txt', projectMessage(), 'text/plain'); toast('Your project brief has been downloaded.'); } });
}
function downloadFile(filename, content, type) { const url = URL.createObjectURL(new Blob([content], {type})); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function renderCart() {
  setSeo({title:'Your cart — Mekanto',description:'Your selected Mekanto products.',canonical:siteUrl('/cart/')});
  const bag = validBag();
  const total = bag.reduce((sum,item) => sum + catalogIndex.products.get(item.id).price * item.quantity, 0);
  $('#main').innerHTML = `<div class="container page-content"><div class="breadcrumb"><a href="shop/">The collection</a>${icon('chevron')}<span>Your cart</span></div><div class="page-heading"><span class="eyebrow">GOOD IDEAS, KEPT TOGETHER</span><h1>Your cart.</h1><p>Choose your quantities, then send everything to Mekanto on WhatsApp.</p></div>${bag.length ? `<div class="cart-layout"><div class="cart-items">${bag.map((item,i) => { const p = catalogIndex.products.get(item.id); return `<article class="cart-item"><a class="cart-image" href="product/?id=${p.id}" aria-label="View ${esc(p.name)}">${productImage(p)}</a><div class="cart-item-info"><a class="product-name" href="product/?id=${p.id}">${esc(p.name)}</a><p>${esc(item.color)} · ${p.material}</p><label class="cart-quantity">Quantity <input type="number" min="1" max="99" value="${item.quantity}" data-bag-quantity="${i}" aria-label="Quantity of ${esc(p.name)} in ${esc(item.color)}"></label><button class="remove-button" data-remove="${i}" aria-label="Remove ${esc(p.name)} in ${esc(item.color)}">Remove</button></div><strong class="cart-item-price">${money(p.price * item.quantity)}</strong></article>`; }).join('')}</div><aside class="cart-summary"><span class="eyebrow">LET'S MAKE IT HAPPEN</span><h2>Ready to talk details?</h2><div class="summary-total"><span>Sample subtotal</span><strong>${money(total)}</strong></div><p>Send all your items, colors, materials and quantities in one message. We'll confirm the final price and delivery together.</p><button id="send-bag-whatsapp" class="button button-whatsapp">Send cart on WhatsApp ${icon('chat')}</button><a class="button button-outline" href="shop/">Keep exploring ${icon('arrow')}</a><a class="cart-custom-link text-link" href="custom/">Add a custom design request ${icon('plus')}</a><button id="download-bag" class="brief-download">Download a copy ${icon('download')}</button><p class="field-hint">Opens a prepared message to ${esc(catalog.store.whatsappDisplay)}. Review it and tap Send.</p><p id="cart-whatsapp-status" role="status" class="field-hint"></p></aside></div>` : `<div class="empty-state bag-empty">${icon('bag')}<h2>A little room for possibility.</h2><p>Your cart is empty. Find something that makes your everyday better.</p><div class="empty-actions"><a href="shop/" class="button button-dark">Explore the collection ${icon('arrow')}</a><a href="custom/" class="button button-outline">Request a custom design ${icon('plus')}</a></div></div>`}</div>`;
  $$('[data-remove]').forEach(button => button.addEventListener('click', () => { const current = validBag(); current.splice(Number(button.dataset.remove), 1); if (saveBag(current)) { renderCart(); toast('Item removed from your cart.'); } }));
  $$('[data-bag-quantity]').forEach(input => input.addEventListener('change', () => {
    if (!input.checkValidity()) { input.reportValidity(); return; }
    const current = validBag(); current[Number(input.dataset.bagQuantity)].quantity = Number(input.value);
    if (saveBag(current)) { const item = current[Number(input.dataset.bagQuantity)]; const product = catalogIndex.products.get(item.id); $('.cart-item-price', input.closest('.cart-item')).textContent = money(product.price * item.quantity); $('.summary-total strong').textContent = money(current.reduce((sum, entry) => sum + catalogIndex.products.get(entry.id).price * entry.quantity, 0)); $('#cart-whatsapp-status').textContent = ''; }
  }));
  function checkQuantities() { return $$('[data-bag-quantity]').every(input => input.reportValidity()); }
  $('#send-bag-whatsapp')?.addEventListener('click', () => {
    if (!checkQuantities()) return;
    const url = openWhatsApp(contactMessage());
    $('#cart-whatsapp-status').innerHTML = `Your message is ready. Review the details and tap Send in WhatsApp. <a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open WhatsApp again ${icon('diagonal')}</a>`;
  });
  $('#download-bag')?.addEventListener('click', () => { if (!checkQuantities()) return; downloadFile('mekanto-product-request.txt', contactMessage(), 'text/plain'); toast('A copy of your request has been downloaded.'); });
}
function renderGallery() {
  setSeo({title:'3D printing inspiration gallery — Mekanto',description:"Browse Mekanto's 3D printing inspiration gallery and send selected images on WhatsApp as references for your custom project.",canonical:siteUrl('/gallery/'),image:galleryItems[0]?.image || 'aseets/maker-hero.webp',schema:{'@context':'https://schema.org','@type':'ImageGallery',name:'Mekanto 3D printing inspiration gallery',url:siteUrl('/gallery/'),image:galleryItems.map(item => ({'@type':'ImageObject',contentUrl:new URL(item.image,catalog.store.siteUrl).href,caption:item.alt}))}});
  $('#main').innerHTML = `<div class="container page-content gallery-page"><div class="breadcrumb"><a href="./">Home</a>${icon('chevron')}<span>Gallery</span></div><header class="gallery-heading"><div><span class="eyebrow">MADE LAYER BY LAYER</span><h1>Find your starting point.</h1></div><p>Tap the images that feel close to your idea. Send your selection to us on WhatsApp, and we'll use it as a visual reference.</p></header><div id="gallery-grid" class="gallery-grid" aria-label="Mekanto inspiration images"></div><div id="gallery-sentinel" class="gallery-sentinel" aria-hidden="true"><span></span></div><p id="gallery-status" class="gallery-status sr-only" role="status" aria-live="polite"></p><div id="gallery-end" class="gallery-end" hidden><span class="tiny-line"></span><p>You've reached the end of the gallery.</p></div></div><div id="gallery-selection-bar" class="gallery-selection-bar" hidden><div class="gallery-selection-copy"><strong id="gallery-selection-count">0 selected</strong><button id="clear-gallery-selection" type="button">Clear</button></div><button id="send-gallery-whatsapp" class="button button-whatsapp" type="button">Send references ${icon('chat')}</button></div>`;
  const selected = new Set();
  const batchSize = 10;
  let visibleCount = 0;
  const grid = $('#gallery-grid'), sentinel = $('#gallery-sentinel'), status = $('#gallery-status'), bar = $('#gallery-selection-bar');
  function galleryCard(item) {
    return `<button class="gallery-card" type="button" data-gallery-id="${esc(item.id)}" aria-pressed="false" aria-label="Select ${esc(item.alt)}"><img data-gallery-image src="${esc(safeImagePath(item.image))}" alt="${esc(item.alt)}" loading="lazy" decoding="async"><span class="gallery-check">${icon('check')}</span></button>`;
  }
  function updateSelection() {
    $$('.gallery-card', grid).forEach(card => { const active = selected.has(card.dataset.galleryId); card.classList.toggle('selected', active); card.setAttribute('aria-pressed', String(active)); });
    const count = selected.size;
    $('#gallery-selection-count').textContent = `${count} ${count === 1 ? 'image' : 'images'} selected`;
    bar.hidden = count === 0;
    document.body.classList.toggle('gallery-selection-active', count > 0);
  }
  function bindCards() {
    $$('.gallery-card:not([data-ready])', grid).forEach(card => { card.dataset.ready = 'true'; card.addEventListener('click', () => { const id = card.dataset.galleryId; if (selected.has(id)) selected.delete(id); else if (selected.size < 10) selected.add(id); else return toast('Choose up to 10 reference images at a time.'); updateSelection(); }); });
  }
  function appendBatch() {
    const next = galleryItems.slice(visibleCount, visibleCount + batchSize);
    if (!next.length) return;
    grid.insertAdjacentHTML('beforeend', next.map(galleryCard).join(''));
    visibleCount += next.length; bindCards(); updateSelection();
    status.textContent = `${visibleCount} of ${galleryItems.length} gallery images loaded.`;
    if (visibleCount >= galleryItems.length) { sentinel.hidden = true; $('#gallery-end').hidden = false; window.removeEventListener('scroll', onGalleryScroll); }
  }
  let scrollFrame = 0, batchLocked = false;
  function onGalleryScroll() {
    if (scrollFrame || batchLocked || window.scrollY <= 0) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (batchLocked || sentinel.getBoundingClientRect().top > window.innerHeight + 300) return;
      batchLocked = true;
      appendBatch();
      window.setTimeout(() => { batchLocked = false; }, 700);
    });
  }
  appendBatch();
  if (visibleCount < galleryItems.length) window.addEventListener('scroll', onGalleryScroll, {passive:true});
  $('#clear-gallery-selection').addEventListener('click', () => { selected.clear(); updateSelection(); });
  $('#send-gallery-whatsapp').addEventListener('click', () => {
    const images = galleryItems.filter(item => selected.has(item.id));
    if (!images.length) return;
    const references = images.map((item,index) => `${index + 1}. Reference: ${item.id}${item.customerName ? `\n   Customer: ${item.customerName}` : ''}\n   Image: ${new URL(item.image,catalog.store.siteUrl).href}`).join('\n\n');
    openWhatsApp(`Hi Mekanto! I'd like to use these gallery images as references for my custom 3D print.\n\n${references}\n\nPlease help me plan something with a similar direction.`);
  });
}
function renderAbout() {
  setSeo({title:'About Mekanto — Useful 3D printed objects',description:'Learn how Mekanto turns practical ideas into thoughtful custom 3D printed objects.',canonical:siteUrl('/about/')});
  $('#main').innerHTML = `<div class="container page-content"><section class="about-hero"><div><span class="eyebrow">A LITTLE ABOUT MEKANTO</span><h1>Good design.<br>Everyday possibility.</h1><p>Some ideas start with a big ambition. Others start with a cable that won't stay on the desk.</p><p>Mekanto is a place for both. We make custom 3D printed objects for electronics projects, desktop setups, and the small practical problems that deserve a thoughtful solution.</p><a href="custom/" class="text-link">Bring your idea ${icon('arrow')}</a></div><img src="aseets/hero.webp" alt="Warm peach printed accessories and a charcoal electronics case" width="1254" height="1254"></section><section class="about-principles"><article>${icon('ruler')}<h2>Useful comes first.</h2><p>A part should have a reason to exist. We start with what it needs to do, then work on how it looks and feels.</p></article><article>${icon('layers')}<h2>Room to refine.</h2><p>3D printing makes it possible to try a fit, adjust a detail, and make a better version. A prototype is part of the process.</p></article><article>${icon('heart')}<h2>A little personality.</h2><p>Practical doesn't have to mean forgettable. Simple shapes, considered colors, and honest textures give an object character.</p></article></section><section class="faq-section" id="faq"><div><span class="eyebrow">A FEW USEFUL ANSWERS</span><h2>Good questions.<br>Clear answers.</h2></div><div class="spec-accordions"><details open><summary>Can you print my own model? ${icon('plus')}</summary><p>Describe the model, its dimensions and what it needs to do. Contact us directly on WhatsApp or use the text-only project brief. We can review printability, size and material together before production.</p></details><details><summary>What if I only have a sketch? ${icon('plus')}</summary><p>A description, sketch, or reference image is a useful starting point. Include measurements and what the part should do. Modeling work and any design charges can be discussed before proceeding.</p></details><details><summary>Which material should I choose? ${icon('plus')}</summary><p>Tell us where the part will live and what it needs to handle. Heat, outdoor exposure, flexibility and load all matter. <a href="article/?id=pla-petg-or-asa">Read our material notes</a> for a starting point.</p></details><details><summary>Will a printed part look exactly like the image? ${icon('plus')}</summary><p>The collection uses concept imagery. FDM prints have visible layer lines, and color, texture and small details can vary. Confirm the final model, dimensions and finish before ordering.</p></details><details><summary>Can I order a batch? ${icon('plus')}</summary><p>Include the quantity in your custom brief. It is useful to check a first sample before agreeing to a larger run.</p></details></div></section><section class="policy-grid"><div id="ordering"><span class="eyebrow">BEFORE WE MAKE IT</span><h2>Ordering & delivery</h2><p>This site is a storefront preview with sample products and pricing. The cart and custom brief prepare your selected items and project details for WhatsApp. Review the message and tap Send to share it with Mekanto. Final pricing and production are agreed in chat.</p><p>Confirm the final quote, compatibility, material, production schedule, delivery options and applicable returns terms directly with Mekanto before production. No delivery times or shipping rates have been assumed.</p></div><div id="privacy"><span class="eyebrow">YOUR DETAILS</span><h2>A simple privacy note</h2><p>Your cart is saved in this browser's local storage. You can remove its items at any time. Custom form details and cart selections are passed to WhatsApp when you open the chat. The message is sent when you tap Send there. This website does not request file uploads.</p><p>This site loads fonts from Google Fonts and Tailwind from jsDelivr. Those services receive the network information needed to deliver their resources. No analytics or advertising trackers are included.</p></div></section>${customBanner()}</div>`;
}
function renderNotFound(title, description, href, label) { document.title = 'Page not found — Mekanto'; $('#main').innerHTML = `<div class="container page-content"><div class="empty-state">${icon('cube')}<span class="eyebrow">A SMALL DETOUR</span><h1>${esc(title)}</h1><p>${esc(description)}</p><a class="button button-dark" href="${href}">${esc(label)} ${icon('arrow')}</a></div></div>`; }
function openSearch() {
  if (!catalog) { toast('The collection is still loading. Please try again in a moment.'); return; }
  const dialog = $('#search-dialog');
  dialog.innerHTML = `<div class="search-dialog-head"><span class="eyebrow" id="search-title">FIND YOUR USEFUL THING</span><button class="icon-button" id="close-search" aria-label="Close search">${icon('close')}</button></div><form action="shop/" class="search-dialog-form" role="search"><label for="global-search" class="sr-only">Search products</label>${icon('search')}<input id="global-search" name="q" type="search" placeholder="What are you looking for?" autocomplete="off"><button class="icon-button" aria-label="Search all products">${icon('arrow')}</button></form><div id="search-suggestions"></div><div class="search-hint">Try a product, material, or an idea. <span>Esc to close</span></div>`;
  const showMatches = () => { const query = $('#global-search').value.trim().toLowerCase(); const matches = catalog.products.filter(p => matchesProduct(p, query)); $('#search-suggestions').innerHTML = `<p class="suggestion-label" role="status">${query ? `${matches.length} matching objects` : 'A few good places to start'}</p>${matches.length ? matches.map(p => `<a class="search-result" href="product/?id=${p.id}"><div class="search-result-image">${productImage(p)}</div><span><strong>${esc(p.name)}</strong><small>${esc(category(p.category).name)}</small></span><span>${money(p.price)}</span>${icon('arrow')}</a>`).join('') : '<p class="search-empty">No matches yet. Try “case”, “cable” or “PETG”.</p>'}`; };
  showMatches(); dialog.showModal(); $('#global-search').focus(); $('#close-search').addEventListener('click', () => dialog.close()); $('#global-search').addEventListener('input', showMatches);
  dialog.onclick = event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } };
}
async function init() {
  $('.skip-link').addEventListener('click', event => { event.preventDefault(); $('#main').focus(); $('#main').scrollIntoView({behavior:'instant'}); });
  renderHeader(); renderFooter();
  try {
    const responses = await Promise.all([fetch('products.json'), fetch('posts.json'), ...(page === 'gallery' ? [fetch('gallery.json')] : [])]);
    if (responses.some(response => !response.ok)) throw new Error('Catalog files could not be loaded.');
    const data = await Promise.all(responses.map(response => response.json())); catalog = normalizeCatalog(data[0]); posts = data[1].posts; galleryItems = page === 'gallery' && Array.isArray(data[2]?.images) ? [...new Map(data[2].images.map(item => [item.image, item])).values()] : [];
    renderFooter(); updateCatalogNavigation(); updateBagCount();
    const routes = {index:renderHome, shop:renderShop, product:renderProduct, custom:renderCustom, blog:renderBlog, article:renderArticle, gallery:renderGallery, about:renderAbout, cart:renderCart, '404':() => renderNotFound('A small detour.', 'That page could not be found. Let’s get you back to the collection.', 'shop/', 'Explore the collection')};
    (routes[page] || routes['404'])();
    updateWhatsAppLinks();
    if (location.hash) requestAnimationFrame(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
  } catch (error) {
    $('#main').innerHTML = `<div class="container page-content"><div class="empty-state"><h1>A small pause in the making.</h1><p>We couldn't load the collection. Please refresh and try again.</p>${location.protocol === 'file:' ? '<p>For a local preview, serve this folder over HTTP so the product and journal JSON files can load. See README.md for the one-command setup.</p>' : ''}<button class="button button-dark" id="retry-load">Try again ${icon('arrow')}</button></div></div>`;
    $('#retry-load').addEventListener('click', () => location.reload());
    console.error('Mekanto:', error);
  }
}
window.addEventListener('storage', event => { if (event.key === 'mekanto-bag') { updateBagCount(); if (page === 'cart' && catalog) renderCart(); } });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('#search-dialog').open) { event.preventDefault(); $('#search-dialog').close(); } });
document.addEventListener('error', event => {
  const img = event.target;
  if (img instanceof HTMLImageElement && (img.hasAttribute('data-product-image') || img.hasAttribute('data-gallery-image')) && !img.dataset.fallbackApplied) {
    img.dataset.fallbackApplied = 'true'; img.className = 'product-image product-image-single'; img.removeAttribute('style');
    img.src = new URL('aseets/product-placeholder.svg', document.baseURI).href;
  }
}, true);
init();
