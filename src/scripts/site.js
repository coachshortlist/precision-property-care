/* Runs on every public page: sliders, menu, where-the-visitor-came-from, click tracking. */
const SRC_KEY = 'ppc_src';

function detectSource(){
  const q = new URLSearchParams(location.search);
  const utm = { source:q.get('utm_source'), medium:q.get('utm_medium'), campaign:q.get('utm_campaign') };
  const s = (utm.source || '').toLowerCase();
  let ref = null; try{ if(document.referrer) ref = new URL(document.referrer).hostname; }catch(e){}
  const external = ref && ref !== location.hostname;
  let source = 'direct';
  if(s) source = /google/.test(s) ? 'google' : /insta|^ig$/.test(s) ? 'instagram' : /facebook|^fb$|meta/.test(s) ? 'facebook' : s.slice(0, 40);
  else if(external && /instagram\./.test(ref)) source = 'instagram';
  else if(q.get('fbclid') || (external && /facebook\.|fb\.com|fb\.me/.test(ref))) source = 'facebook';
  else if(q.get('gclid') || (external && /(^|\.)google\./.test(ref))) source = 'google';
  else if(external && /bing\.|duckduckgo\.|yahoo\.|ecosia\./.test(ref)) source = 'search_other';
  else if(external) source = 'website';
  return { source, utm: utm.source ? utm : null, referrer: external ? ref : null, landing: location.pathname };
}

/* First page of this visit decides the source. Kept for this browser tab session only. */
export function getSource(){
  try{ const saved = sessionStorage.getItem(SRC_KEY); if(saved) return JSON.parse(saved); }catch(e){}
  return detectSource();
}

export function track(type, extra = {}){
  const payload = JSON.stringify({ type, src:getSource().source, page:location.pathname, ...extra });
  try{
    if(navigator.sendBeacon && navigator.sendBeacon('/api/event/', new Blob([payload], { type:'text/plain' }))) return;
  }catch(e){}
  fetch('/api/event/', { method:'POST', body:payload, keepalive:true }).catch(() => {});
}

export function initSliders(root = document){
  root.querySelectorAll('[data-ba]').forEach(el => {
    const input = el.querySelector('input[type=range]');
    if(input && !input.dataset.bound){ input.dataset.bound = '1'; input.addEventListener('input', () => el.style.setProperty('--pos', input.value + '%')); }
  });
}

export function initSite(){
  initSliders();
  const btn = document.getElementById('menuBtn'), nav = document.getElementById('mainNav');
  btn?.addEventListener('click', () => { nav.classList.toggle('open'); btn.setAttribute('aria-expanded', nav.classList.contains('open')); });

  let isNew = false;
  try{ if(!sessionStorage.getItem(SRC_KEY)){ sessionStorage.setItem(SRC_KEY, JSON.stringify(detectSource())); isNew = true; } }catch(e){ isNew = true; }
  if(isNew) track('visit');

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-track]');
    if(t) track(t.dataset.track, t.dataset.service ? { service:t.dataset.service } : {});
  });
}
