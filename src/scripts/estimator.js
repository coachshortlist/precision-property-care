/* The "Start Your Property Upgrade Here" price guide. Prices come from src/data/site.js. */
import { SERVICES, EXTRAS, STEPS, WA } from '../data/site.js';
import { esc, gbp, nice, keysIn, fromText, validMobile, validEmail, validPc } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { art } from '../lib/art.js';
import { track } from './site.js';
import { createLead, uploadPhotos } from './api.js';
import { serviceUrl } from '../data/site.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let EST = { step:1, tab:'inside', service:null, size:null, choice:null, extras:new Set(), lead:null };

function calc(){
  const p = SERVICES[EST.service]; let pct = 0, al = 0, ah = 0, low, high;
  EST.extras.forEach(k => { const x = EXTRAS[k]; if(x.pct) pct += x.pct; if(x.add){ al += x.add[0]; ah += x.add[1]; } });
  if(p.choices){ const c = p.choices[EST.choice || p.def]; low = c[1]; high = c[2]; }
  else { const s = Math.max(1, +EST.size || p.def); low = Math.max(p.min, s * p.low); high = Math.max(p.min * 1.3, s * p.high); }
  low = nice(low * (1 + pct) + al); high = nice(high * (1 + pct) + ah);
  return { low, high, mid:(low + high) / 2 };
}
const sizeText = () => { const p = SERVICES[EST.service]; return p.choices ? p.choices[EST.choice || p.def][0] : `${EST.size} ${p.unit}`; };

function startEstimate(kind, size, silent){
  const p = SERVICES[kind];
  let choice = null, sz = null;
  if(p.choices) choice = (size && p.choices[size]) ? size : p.def;
  else sz = (Number(size) > 0 ? Math.round(Number(size)) : p.def);
  EST = { step:2, tab:p.group, service:kind, size:sz, choice, extras:new Set(), lead:null };
  if(!silent) track('est_start', { service:kind });
  render();
}

function renderStepper(){
  $('#stepper').innerHTML = STEPS.map((t,i) => { const n = i + 1, cls = n < EST.step ? 'done' : n === EST.step ? 'now' : '';
    return `<li class="${cls}"${n === EST.step ? ' aria-current="step"' : ''}><span>${n < EST.step ? '✓' : n}</span><span class="t">${t}</span></li>`; }).join('');
}
function jobSummary(){
  const p = SERVICES[EST.service];
  return `<aside class="job-sum"><span class="job-img">${art(EST.service,'after',9)}</span><div><span class="hint">Your job</span><b>${p.label}</b>
    ${EST.step > 2 ? `<span class="hint">${esc(sizeText())}</span>` : ''}<button type="button" class="link" data-go="1">Change job</button></div></aside>`;
}
function jobTile(k){
  const q = SERVICES[k];
  if(q.noEst) return `<a class="job job-other" href="/contact/?type=repairs"><span class="job-img">${icon('repairs')}</span><span class="job-body"><b>${q.label}</b><span class="from">Send us photos for a price</span></span></a>`;
  return `<button type="button" class="job" data-svc="${k}"><span class="job-img">${art(k,'after',9)}</span><span class="job-body"><b>${q.label}</b><span class="from">${fromText(k)}</span></span></button>`;
}
const section = () => $('#estBlock').closest('section');

function render(){
  const c = $('#estCard'); renderStepper();
  $('#estTabs').classList.toggle('hidden', EST.step !== 1);
  $$('#estTabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === EST.tab));
  const p = SERVICES[EST.service];
  if(EST.step === 1){ c.innerHTML = `<div class="job-grid">${[...keysIn(EST.tab), 'repairs'].map(jobTile).join('')}</div>`; return; }
  let panel = '';
  if(EST.step === 2){
    const extras = Object.entries(EXTRAS).filter(([,x]) => x.for.includes(EST.service));
    const extrasHtml = extras.length ? `<p class="hint" style="margin:18px 0 0">Anything else we should allow for?</p><div class="checks">${extras.map(([k,x]) => `<label><input type="checkbox" data-extra="${k}" ${EST.extras.has(k)?'checked':''}> ${x.label}</label>`).join('')}</div>` : '';
    panel = p.choices
      ? `<h3>${p.q}</h3><div class="choice-grid">${Object.entries(p.choices).map(([k,v]) => `<button type="button" class="choice" data-choice="${k}" aria-pressed="${EST.choice===k}">${v[0]}</button>`).join('')}</div>${extrasHtml}`
      : `<h3>Roughly how big is it?</h3>
        <div class="size-row"><input type="range" id="eRange" min="1" max="${p.max}" value="${Math.min(p.max, EST.size)}" aria-label="Size in ${p.unit}">
        <span><input type="number" id="eNum" min="1" max="${p.max*3}" value="${EST.size}" aria-label="Size in ${p.unit}"> <span class="unit">${p.unit}</span></span></div>
        <p class="hint">${p.hint} A best guess is fine, we measure properly on site.</p>${extrasHtml}`;
    panel += `<div class="row-btns"><button type="button" class="link" data-go="1">Back</button><button type="button" class="btn" data-go="3">See my price</button></div>`;
  }
  else if(EST.step === 3){
    panel = `<h3>Your price is ready</h3>
      <div class="locked" aria-hidden="true">£8,800 to £12,400</div>
      <p>Where should we send it? You'll see it here straight away and we'll text you a copy.</p>
      <form id="gate" novalidate><div class="fgrid">
        <div class="field"><label for="gName">Name</label><input id="gName" autocomplete="name"><span class="err"></span></div>
        <div class="field"><label for="gMob">Mobile</label><input id="gMob" type="tel" inputmode="tel" autocomplete="tel"><span class="err"></span></div>
        <div class="field"><label for="gEmail">Email</label><input id="gEmail" type="email" autocomplete="email"><span class="err"></span></div>
        <div class="field"><label for="gPc">Postcode</label><input id="gPc" autocomplete="postal-code"><span class="err"></span></div>
      </div>
      <div class="hp" aria-hidden="true"><label>Company<input id="gCo" tabindex="-1" autocomplete="off"></label></div>
      <p class="consent">We only use these to send your price and arrange a free survey if you'd like one. See our <a href="/privacy/">privacy policy</a>.</p>
      <div class="row-btns"><button type="button" class="link" data-go="2">Back</button><button class="btn" type="submit" id="gSubmit">Show my price</button></div>
      <p class="form-msg bad" id="gMsg" role="alert"></p></form>`;
  }
  else {
    const r = calc(), first = (EST.lead?.name || '').split(' ')[0];
    panel = `<h3>Thanks ${esc(first)}, here's your rough price</h3>
      <div class="price-box"><span class="hint">${p.label}, ${esc(sizeText())}${EST.extras.size ? ', including ' + [...EST.extras].map(k => EXTRAS[k].label.toLowerCase()).join(' and ') : ''}</span>
      <div class="price">${gbp(r.low)} to ${gbp(r.high)}</div>
      <span class="hint">Based on similar jobs we've done. We confirm a fixed price in writing after a free survey.</span></div>
      <div class="next"><b>What happens next</b><ol><li>We call or text you within one working day.</li><li>We book a free survey to look at the job.</li><li>You get a fixed written quote.</li></ol></div>
      <label class="upload" for="ePhotos"><input id="ePhotos" type="file" accept="image/*" multiple>${icon('camera')}<span><b>Add photos for a more accurate price</b><span class="hint">Optional, but it helps us plan the job. Up to 10 photos.</span></span></label>
      <div class="thumbs" id="eThumbs"></div><p class="upload-status" id="eStatus" role="status"></p>
      <div class="row-btns"><button type="button" class="link" data-go="1">Price another job</button>
      <a class="btn wa" target="_blank" rel="noopener" data-track="wa_click" href="https://wa.me/${WA}?text=${encodeURIComponent('Hi, I just got a rough price for ' + p.label.toLowerCase() + ' on your website')}">${icon('chat')}Contact us on WhatsApp</a></div>`;
  }
  c.innerHTML = `<div class="est-flow">${jobSummary()}<div class="est-panel">${panel}</div></div>`;
  if(EST.step === 2 && !p.choices){
    $('#eRange').oninput = e => { EST.size = +e.target.value; $('#eNum').value = EST.size; };
    $('#eNum').oninput = e => { EST.size = Math.max(1, +e.target.value || 1); $('#eRange').value = Math.min(p.max, EST.size); };
  }
  if(EST.step === 3) $('#gate').addEventListener('submit', submitGate);
  if(EST.step === 4) $('#ePhotos').onchange = onPhotos;
}

async function submitGate(e){
  e.preventDefault();
  const f = { name:$('#gName'), mobile:$('#gMob'), email:$('#gEmail'), postcode:$('#gPc') };
  const errs = { name: f.name.value.trim() ? '' : 'Enter your name', mobile: validMobile(f.mobile.value) ? '' : 'Enter a UK mobile number, e.g. 07700 900123',
    email: validEmail(f.email.value) ? '' : 'Enter an email address like name@example.com', postcode: validPc(f.postcode.value) ? '' : 'Enter your full postcode, e.g. G61 1AB' };
  let ok = true;
  for(const k in f){ f[k].nextElementSibling.textContent = errs[k]; f[k].setAttribute('aria-invalid', !!errs[k]); if(errs[k]) ok = false; }
  if(!ok){ $('#estCard [aria-invalid="true"]').focus(); return; }
  const r = calc(), btn = $('#gSubmit');
  btn.disabled = true; btn.textContent = 'Sending...'; $('#gMsg').textContent = '';
  try{
    const res = await createLead({ name:f.name.value.trim(), mobile:f.mobile.value.trim(), email:f.email.value.trim(), postcode:f.postcode.value.trim().toUpperCase(),
      service:EST.service, size:sizeText(), extras:[...EST.extras].map(k => EXTRAS[k].label), via:'Price estimator', est_low:r.low, est_high:r.high, company:$('#gCo').value });
    EST.lead = { id:res.id, token:res.token, name:f.name.value.trim() };
    track('est_complete', { service:EST.service });
    EST.step = 4; render(); section().scrollIntoView();
  }catch(err){
    btn.disabled = false; btn.textContent = 'Show my price';
    $('#gMsg').innerHTML = `Your details didn't send. Check your connection and try again, or <a href="https://wa.me/${WA}" target="_blank" rel="noopener">message us on WhatsApp</a>.`;
  }
}

async function onPhotos(e){
  const files = [...e.target.files]; if(!files.length) return;
  $('#eThumbs').innerHTML = files.slice(0, 10).map(f => `<img alt="" src="${URL.createObjectURL(f)}">`).join('');
  const st = $('#eStatus');
  try{
    const n = await uploadPhotos(EST.lead, files, (i, t) => st.textContent = `Uploading photo ${i} of ${t}...`);
    st.textContent = n ? `${n} photo${n > 1 ? 's' : ''} sent. Thanks, that helps us plan the job.` : "Your photos didn't upload. Try again, or send them on WhatsApp.";
  }catch(err){ st.textContent = "Your photos didn't upload. Try again, or send them on WhatsApp."; }
}

export function initEstimator(){
  const block = $('#estBlock'); if(!block) return;
  const start = block.dataset.start;
  if(start && SERVICES[start] && !SERVICES[start].noEst){
    const q = new URLSearchParams(location.search).get('start');
    startEstimate(start, q, true);
  } else render();

  document.addEventListener('click', e => {
    const t = e.target;
    const tab = t.closest('#estTabs button'); if(tab){ EST.tab = tab.dataset.tab; render(); return; }
    if(!t.closest('#estCard')) return;
    const svc = t.closest('[data-svc]'); if(svc){ startEstimate(svc.dataset.svc); section().scrollIntoView(); return; }
    const ch = t.closest('[data-choice]'); if(ch){ EST.choice = ch.dataset.choice; render(); return; }
    const go = t.closest('[data-go]');
    if(go){
      const n = +go.dataset.go;
      // On a service page, "Change job" goes to the full list of jobs on the home page.
      if(n === 1 && block.dataset.start && EST.step < 4 && go.textContent.includes('Change')){ location.href = '/#quote'; return; }
      EST.step = n; if(n === 1){ EST.service = null; EST.lead = null; } render(); section().scrollIntoView(); return;
    }
    const ex = t.closest('[data-extra]'); if(ex){ ex.checked ? EST.extras.add(ex.dataset.extra) : EST.extras.delete(ex.dataset.extra); }
  });
}
