(() => {
  'use strict';

  const API = 'https://bnctkequiekxznkbntzd.supabase.co';
  // This is the site's existing public anon key. Never put a service-role key in browser code.
  const PUBLIC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuY3RrZXF1aWVreHpua2JudHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3ODg3MjMsImV4cCI6MjEwNTM2NDcyM30.ACSOu3xHIrykmdKJSiHD7hMndd-xirN0aohTj2XNTZo';
  const SITE = 'https://www.printfy3d-eg.com';
  const PHONE = '201063870873';
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug') || decodeURIComponent(location.pathname.split('/').filter(Boolean).at(-1) || '');
  const arabicRoute = location.pathname.startsWith('/ar/');
  let language = (params.get('lang') || localStorage.getItem('printify3d_lang') || (arabicRoute ? 'ar' : 'en')) === 'ar' ? 'ar' : 'en';
  let currentProduct = null;
  let siblings = [];
  let productVariants = [];
  let gallery = [];
  let galleryIndex = 0;

  const text = {
    en: {home:'Home', shop:'Shop', loading:'Loading product…', failed:'This product could not be loaded.', retry:'Try again', available:'Available to order', unavailable:'Currently unavailable', add:'Add to cart', added:'Added to cart', buy:'Order via WhatsApp', quantity:'Quantity', description:'Description', features:'Key features', specs:'Specifications', material:'Material', dimensions:'Dimensions', options:'Choose an option', customize:'Customization', request:'Tell us what you would like customized (optional)', related:'Related products', shipping:'Shipping', shippingText:'Delivery across Egypt is available; delivery cost is confirmed with your order.', returns:'Returns', returnsText:'See our returns and refunds policy.', support:'Support', supportText:'Questions? Message PRINTFY 3D on WhatsApp.', noImage:'Product photo unavailable', cartError:'Could not save your cart. Please enable browser storage and try again.'},
    ar: {home:'الرئيسية', shop:'المتجر', loading:'جارٍ تحميل المنتج…', failed:'تعذر تحميل هذا المنتج.', retry:'إعادة المحاولة', available:'متاح للطلب', unavailable:'غير متاح حالياً', add:'أضف إلى السلة', added:'تمت الإضافة إلى السلة', buy:'اطلب عبر واتساب', quantity:'الكمية', description:'الوصف', features:'المميزات', specs:'المواصفات', material:'الخامة', dimensions:'الأبعاد', options:'اختر خياراً', customize:'تخصيص', request:'اكتب تفاصيل التخصيص المطلوبة (اختياري)', related:'منتجات مشابهة', shipping:'الشحن', shippingText:'التوصيل متاح داخل مصر؛ ويتم تأكيد تكلفته مع الطلب.', returns:'الاستبدال والاسترجاع', returnsText:'اطلع على سياسة الاسترجاع.', support:'الدعم', supportText:'هل لديك سؤال؟ راسل PRINTFY 3D على واتساب.', noImage:'صورة المنتج غير متاحة', cartError:'تعذر حفظ السلة. فعّل مساحة التخزين في المتصفح ثم حاول مرة أخرى.'}
  };
  const t = (key) => text[language][key];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const getName = (p) => language === 'ar' ? (p.name_ar || p.name_en || p.name) : (p.name_en || p.name);
  const getDescription = (p) => language === 'ar' ? (p.desc_ar || p.desc_en || p.description || '') : (p.desc_en || p.description || '');
  const money = (value) => new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', {style:'currency', currency:'EGP', maximumFractionDigits:0}).format(Number(value || 0));
  const isImageUrl = (value) => typeof value === 'string' && (/^https?:\/\//i.test(value) || /^data:image\//i.test(value));
  const apiFetch = async (table, query) => {
    const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),12000);
    try {
      const response = await fetch(`${API}/rest/v1/${table}?${query}`, {headers:{apikey:PUBLIC_KEY, Authorization:`Bearer ${PUBLIC_KEY}`}, cache:'no-store',signal:controller.signal});
      if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
      return await response.json();
    } finally { clearTimeout(timer); }
  };
  function setMeta(selector, value, attr='content') {
    let node = document.head.querySelector(selector);
    if (!node) { node=document.createElement('meta'); if (selector.startsWith('meta[property=')) node.setAttribute('property', selector.match(/"([^"]+)/)[1]); else node.setAttribute('name', selector.match(/"([^"]+)/)[1]); document.head.append(node); }
    node.setAttribute(attr, value);
  }
  function setCanonical(href) {
    let node = document.head.querySelector('link[rel="canonical"]');
    if (!node) { node=document.createElement('link'); node.rel='canonical'; document.head.append(node); }
    node.href=href;
  }
  function updateStructuredData(product) {
    const title = getName(product);
    const description = getDescription(product) || `${title} by PRINTFY 3D. 3D Printing Cairo.`;
    const productSchema = {
      '@context':'https://schema.org', '@type':'Product', name:title, description,
      brand:{'@type':'Brand',name:'PRINTFY 3D'}, image:gallery.filter(isImageUrl),
      offers:{'@type':'Offer',url:`${SITE}/product.html?slug=${encodeURIComponent(product.slug)}${language==='ar'?'&lang=ar':''}`,price:Number(product.price),priceCurrency:'EGP',availability:product.available?'https://schema.org/InStock':'https://schema.org/OutOfStock',seller:{'@type':'Organization',name:'PRINTFY 3D'}}
    };
    const crumbs = {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:t('home'),item:`${SITE}/${language==='ar'?'ar/':''}`},
      {'@type':'ListItem',position:2,name:t('shop'),item:`${SITE}/${language==='ar'?'ar/':''}shop/`},
      {'@type':'ListItem',position:3,name:title,item:`${SITE}/product.html?slug=${encodeURIComponent(product.slug)}${language==='ar'?'&lang=ar':''}`}
    ]};
    let node = document.querySelector('#pdp-jsonld');
    if(!node){node=document.createElement('script');node.type='application/ld+json';node.id='pdp-jsonld';document.head.append(node);}
    node.textContent=JSON.stringify([productSchema,crumbs]);
  }
  function updateSeo(product) {
    const name = getName(product), description = `${getDescription(product) || name} — PRINTFY 3D, 3D printing in Cairo, Egypt.`;
    const title = `${name} | PRINTFY 3D`;
    const canonical=`${SITE}/product.html?slug=${encodeURIComponent(product.slug)}${language==='ar'?'&lang=ar':''}`;
    document.title=title;
    setMeta('meta[name="description"]', description.slice(0,160));
    setMeta('meta[property="og:type"]','product');
    setMeta('meta[property="og:site_name"]','PRINTFY 3D');
    setMeta('meta[property="og:title"]',title);
    setMeta('meta[property="og:description"]',description.slice(0,200));
    setMeta('meta[property="og:url"]',canonical);
    const image=gallery.find(isImageUrl);
    if(image){setMeta('meta[property="og:image"]',image);setMeta('meta[name="twitter:card"]','summary_large_image');}
    setCanonical(canonical);
    for(const [locale,url] of [['en',`${SITE}/product.html?slug=${encodeURIComponent(product.slug)}`],['ar',`${SITE}/product.html?slug=${encodeURIComponent(product.slug)}&lang=ar`],['x-default',`${SITE}/product.html?slug=${encodeURIComponent(product.slug)}`]]){
      let link=document.head.querySelector(`link[rel="alternate"][hreflang="${locale}"]`);
      if(!link){link=document.createElement('link');link.rel='alternate';link.hreflang=locale;document.head.append(link);}
      link.href=url;
    }
    updateStructuredData(product);
  }
  function imageSources(product) {
    const primary=product.image_url;
    const extra=product.slug==='nfc-display' ? ['/assets/products/nfc-display-detail-1.webp','/assets/products/nfc-display-detail-2.webp'] : [];
    const base=product.slug.startsWith('spring-lizard-')?'spring-lizard':product.slug;
    const fallback=primary?[]:[`/assets/products/${base}.webp`];
    return [...new Set([primary,...extra,...fallback].filter(value=>isImageUrl(value)||value?.startsWith('/assets/')))];
  }
  function renderGallery() {
    const stage=document.querySelector('#pdpImageStage'), thumbs=document.querySelector('#pdpThumbs');
    const src=gallery[galleryIndex];
    if (!src) {stage.innerHTML=`<div class="pdp-no-image" role="img" aria-label="${esc(t('noImage'))}">${esc(t('noImage'))}</div>`; thumbs.innerHTML='';return;}
    stage.innerHTML=`<button class="pdp-zoom" type="button" aria-label="${language==='ar'?'تكبير الصورة':'Zoom image'}"><img src="${esc(src)}" alt="${esc(getName(currentProduct))} — PRINTFY 3D" fetchpriority="high" decoding="async"></button>`;
    const image=stage.querySelector('img');
    const base=currentProduct.slug.startsWith('spring-lizard-')?'spring-lizard':currentProduct.slug;
    const fallbacks=[`/assets/products/${base}.webp`,`/assets/products/${base}.jpg`].filter(url=>url!==src);
    image.addEventListener('error',()=>{
      const next=fallbacks.shift();
      if(next)image.src=next;
      else {stage.innerHTML=`<div class="pdp-no-image" role="img" aria-label="${esc(t('noImage'))}">${esc(t('noImage'))}</div>`;}
    });
    stage.querySelector('.pdp-zoom').addEventListener('click',()=>{const dialog=document.querySelector('#pdpZoom');dialog.querySelector('img').src=src;dialog.querySelector('img').alt=getName(currentProduct);dialog.showModal();});
    thumbs.innerHTML=gallery.length>1?gallery.map((url,index)=>`<button type="button" class="pdp-thumb${index===galleryIndex?' is-active':''}" data-gallery-index="${index}" aria-label="${language==='ar'?'الصورة':'Image'} ${index+1}" aria-pressed="${index===galleryIndex}"><img src="${esc(url)}" alt="" loading="lazy"></button>`).join(''):'';
    thumbs.querySelectorAll('[data-gallery-index]').forEach(button=>button.addEventListener('click',()=>{galleryIndex=Number(button.dataset.galleryIndex);renderGallery();}));
  }
  function whatsappUrl(product, qty) {
    const note=document.querySelector('#customRequest')?.value.trim()||'';
    const option=language==='ar'?'تفاصيل التخصيص':'Customization';
    const message=language==='ar'
      ? `مرحباً PRINTFY 3D، أريد طلب ${getName(product)}، الكمية ${qty}، السعر ${money(product.price)} للقطعة، الإجمالي ${money(Number(product.price)*qty)}.${note?`\n${option}: ${note}`:''}`
      : `Hello PRINTFY 3D, I’d like to order ${getName(product)}. Quantity: ${qty}. Price: ${money(product.price)} each. Total: ${money(Number(product.price)*qty)}.${note?`\n${option}: ${note}`:''}`;
    return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
  }
  function updateWhatsapp() {
    const input=document.querySelector('#pdpQty');
    const qty=Math.max(1,Math.min(99,Math.trunc(Number(input.value)||1)));
    input.value=qty;
    if(currentProduct) document.querySelector('#pdpWhatsapp').href=whatsappUrl(currentProduct,qty);
  }
  function addToCart() {
    const product=currentProduct, qty=Number(document.querySelector('#pdpQty').value);
    if(!product || !product.available || !Number.isInteger(qty) || qty<1 || qty>99) return;
    try {
      const cart=JSON.parse(localStorage.getItem('printify3d_cart')||'{}');
      const id=String(product.id), prior=Number(cart[id]||0);
      cart[id]=Math.min(99,prior+qty);
      localStorage.setItem('printify3d_cart',JSON.stringify(cart));
      localStorage.setItem('printify3d_open_cart','1');
      const button=document.querySelector('#pdpAdd');
      button.textContent=t('added');
      setTimeout(()=>{if(button.isConnected)button.textContent=t('add');},1500);
      setTimeout(()=>{location.href=`/${language==='ar'?'ar/':''}#shop`;},250);
    } catch(e) { document.querySelector('#pdpStatus').textContent=t('cartError'); }
  }
  function relatedMarkup(products) {
    return products.filter(p=>p.slug!==currentProduct.slug).slice(0,6).map(p=>{
      const image=isImageUrl(p.image_url)?`<img src="${esc(p.image_url)}" alt="${esc(getName(p))}" loading="lazy" decoding="async">`:'<span class="pdp-related-placeholder" aria-hidden="true">3D</span>';
      return `<a class="pdp-related-card" href="/product.html?slug=${encodeURIComponent(p.slug)}&lang=${language}">${image}<span>${esc(getName(p))}</span><strong>${esc(money(p.price))}</strong></a>`;
    }).join('');
  }
  function variantMarkup() {
    const groups=[['spongebob-card-pink','spongebob-card-green','spongebob-card-bundle'],['spring-lizard-big','spring-lizard-small']];
    const group=groups.find(items=>items.includes(currentProduct.slug));
    if(!group)return '';
    const items=productVariants.filter(p=>group.includes(p.slug));
    const label=p=>p.slug==='spongebob-card-pink'?(language==='ar'?'وردي':'Pink'):p.slug==='spongebob-card-green'?(language==='ar'?'أخضر':'Green'):p.slug==='spongebob-card-bundle'?(language==='ar'?'اللونان':'Both colors'):p.slug==='spring-lizard-big'?(language==='ar'?'كبير':'Big'):(language==='ar'?'صغير':'Small');
    return items.length>1?`<section class="pdp-options" aria-labelledby="pdpVariantsTitle"><h2 id="pdpVariantsTitle">${esc(t('options'))}</h2><div class="pdp-variant-list">${items.map(p=>`<a class="pdp-variant${p.slug===currentProduct.slug?' is-selected':''}" href="/product.html?slug=${encodeURIComponent(p.slug)}&lang=${language}"${p.slug===currentProduct.slug?' aria-current="page"':''}>${esc(label(p))} · ${esc(money(p.price))}</a>`).join('')}</div></section>`:'';
  }
  function render(product, related, categoryMap, variants) {
    currentProduct=product; siblings=related; productVariants=variants;
    gallery=imageSources(product);galleryIndex=0;
    document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
    document.querySelector('#langToggle').href=`/product.html?slug=${encodeURIComponent(slug)}&lang=${language==='ar'?'en':'ar'}`;
    document.querySelector('#langToggle').textContent=language==='ar'?'English':'العربية';
    const nav=document.querySelector('.pdp-header nav');
    const navLinks=nav?.querySelectorAll('a');
    if(navLinks?.length>=3){navLinks[0].href=`/${language==='ar'?'ar/':''}shop/`;navLinks[0].textContent=t('shop');navLinks[1].textContent=language==='ar'?'طلبات مخصصة':'Custom orders';navLinks[2].textContent=language==='ar'?'تواصل معنا':'Contact';}
    const footer=document.querySelector('.pdp-footer');
    if(footer&&language==='ar'){
      const footerIntro=footer.querySelector('p');if(footerIntro)footerIntro.textContent='طباعة ثلاثية الأبعاد في القاهرة · القاهرة، مصر';
      const labels=['المتجر','الأسئلة الشائعة','تواصل معنا','الاسترجاع والاسترداد','دعم واتساب'];
      footer.querySelectorAll('nav a').forEach((link,index)=>{if(labels[index])link.textContent=labels[index];});
    }
    const name=getName(product),desc=getDescription(product),cat=categoryMap[product.category]||product.category||t('shop');
    document.querySelector('#pdpContent').innerHTML=`
      <nav class="pdp-crumbs" aria-label="${language==='ar'?'مسار التنقل':'Breadcrumb'}"><a href="/${language==='ar'?'ar/':''}">${esc(t('home'))}</a><span aria-hidden="true">›</span><a href="/${language==='ar'?'ar/':''}shop/">${esc(t('shop'))}</a><span aria-hidden="true">›</span><span aria-current="page">${esc(name)}</span></nav>
      <div class="pdp-layout"><section class="pdp-gallery" aria-label="${language==='ar'?'صور المنتج':'Product images'}"><div id="pdpImageStage" class="pdp-image-stage"></div><div id="pdpThumbs" class="pdp-thumbs" aria-label="${language==='ar'?'صور مصغرة':'Image thumbnails'}"></div></section>
      <section class="pdp-info"><p class="pdp-eyebrow">${esc(cat)} · PRINTFY 3D</p><h1>${esc(name)}</h1><p class="pdp-price">${esc(money(product.price))}</p><p class="pdp-stock ${product.available?'is-available':'is-unavailable'}"><span aria-hidden="true">${product.available?'●':'○'}</span> ${esc(product.available?t('available'):t('unavailable'))}</p>${desc?`<div class="pdp-description"><h2>${esc(t('description'))}</h2><p>${esc(desc)}</p></div>`:''}${variantMarkup()}<div class="pdp-purchase"><label for="pdpQty">${esc(t('quantity'))}</label><div class="pdp-quantity"><button type="button" id="qtyDown" aria-label="${language==='ar'?'تقليل الكمية':'Decrease quantity'}">−</button><input id="pdpQty" type="number" min="1" max="99" value="1" inputmode="numeric"><button type="button" id="qtyUp" aria-label="${language==='ar'?'زيادة الكمية':'Increase quantity'}">+</button></div><button id="pdpAdd" class="pdp-primary" type="button" ${product.available?'':'disabled'}>${esc(t('add'))}</button><a id="pdpWhatsapp" class="pdp-whatsapp" href="#" target="_blank" rel="noopener noreferrer">${esc(t('buy'))}</a></div>${product.customizable?`<div class="pdp-custom"><label for="customRequest">${esc(t('customize'))}</label><textarea id="customRequest" rows="3" maxlength="500" placeholder="${esc(t('request'))}"></textarea></div>`:''}<div class="pdp-trust"><section><h2>${esc(t('shipping'))}</h2><p>${esc(t('shippingText'))}</p></section><section><h2>${esc(t('returns'))}</h2><p>${esc(t('returnsText'))} <a href="/${language==='ar'?'ar/':''}refund-policy/">${language==='ar'?'التفاصيل':'Read policy'}</a></p></section><section><h2>${esc(t('support'))}</h2><p>${esc(t('supportText'))} <a href="https://wa.me/${PHONE}" target="_blank" rel="noopener noreferrer">WhatsApp</a></p></section></div></section></div>
      ${product.material||product.dims?`<section class="pdp-specs"><h2>${esc(t('specs'))}</h2><dl>${product.material?`<div><dt>${esc(t('material'))}</dt><dd>${esc(product.material)}</dd></div>`:''}${product.dims?`<div><dt>${esc(t('dimensions'))}</dt><dd>${esc(product.dims)}</dd></div>`:''}</dl></section>`:''}
      ${desc||product.material||product.dims||product.customizable?`<section class="pdp-features"><h2>${esc(t('features'))}</h2><ul>${product.material?`<li>${esc(t('material'))}: ${esc(product.material)}</li>`:''}${product.dims?`<li>${esc(t('dimensions'))}: ${esc(product.dims)}</li>`:''}${product.customizable?`<li>${language==='ar'?'يمكن طلب تخصيص هذا المنتج. أرسل التفاصيل عبر واتساب.':'Customization can be requested; share details via WhatsApp.'}</li>`:''}</ul></section>`:''}
      <section class="pdp-related"><h2>${esc(t('related'))}</h2><div class="pdp-related-grid">${relatedMarkup(related)}</div></section>`;
    renderGallery();updateSeo(product);
    document.querySelector('#pdpStatus').textContent='';
    document.querySelector('#pdpContent').hidden=false;
    document.querySelector('#qtyDown').addEventListener('click',()=>{const input=document.querySelector('#pdpQty');input.value=Math.max(1,Number(input.value||1)-1);updateWhatsapp();});
    document.querySelector('#qtyUp').addEventListener('click',()=>{const input=document.querySelector('#pdpQty');input.value=Math.min(99,Number(input.value||1)+1);updateWhatsapp();});
    document.querySelector('#pdpQty').addEventListener('input',updateWhatsapp);
    document.querySelector('#pdpAdd').addEventListener('click',addToCart);
    document.querySelector('#customRequest')?.addEventListener('input',updateWhatsapp);
    updateWhatsapp();
  }
  async function loadProduct() {
    const status=document.querySelector('#pdpStatus');status.textContent=t('loading');
    document.querySelector('#pdpRetry').hidden=true;
    try {
      const [rows,cats]=await Promise.all([
        apiFetch('products',`select=id,slug,name,name_en,name_ar,category,price,description,desc_en,desc_ar,material,dims,customizable,available,image_url&slug=eq.${encodeURIComponent(slug)}&limit=1`),
        apiFetch('categories','select=slug,name_en,name_ar')
      ]);
      if(!rows.length)throw new Error('Product not found');
      const product=rows[0];
      const variants=(product.slug.startsWith('spongebob-card-'))?['spongebob-card-pink','spongebob-card-green','spongebob-card-bundle']:(product.slug.startsWith('spring-lizard-'))?['spring-lizard-big','spring-lizard-small']:[];
      const relatedQuery=`select=id,slug,name,name_en,name_ar,category,price,image_url&available=eq.true&category=eq.${encodeURIComponent(product.category)}&order=slug.asc&limit=12`;
      const related=await apiFetch('products',relatedQuery);
      const variantRows=variants.length?await apiFetch('products',`select=id,slug,name,name_en,name_ar,category,price,image_url,available&available=eq.true&slug=in.(${variants.join(',')})`):[];
      const categoryMap=Object.fromEntries(cats.map(c=>[c.slug,language==='ar'?(c.name_ar||c.name_en):(c.name_en||c.name_ar)]));
      render(product,related,categoryMap,variantRows);
    } catch(error) {
      status.textContent=t('failed');document.querySelector('#pdpRetry').hidden=false;
    }
  }
  document.querySelector('#pdpRetry').addEventListener('click',loadProduct);
  document.querySelector('#langToggle').addEventListener('click',()=>{localStorage.setItem('printify3d_lang',language==='ar'?'en':'ar');});
  document.querySelector('#pdpZoomClose').addEventListener('click',()=>document.querySelector('#pdpZoom').close());
  document.querySelector('#pdpZoom').addEventListener('click',event=>{if(event.target.id==='pdpZoom')event.currentTarget.close();});
  if(!localStorage.getItem('printify3d_lang'))localStorage.setItem('printify3d_lang',language);
  loadProduct();
})();

