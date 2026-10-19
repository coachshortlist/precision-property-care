/* Lead dashboard. Reads from Supabase as the signed-in owner; security rules in supabase/schema.sql
   make sure only emails in the admins table can see anything. */
import { createClient } from '@supabase/supabase-js';
import { SERVICES, STAGES, SOURCES, OTHER } from '../data/site.js';
import { esc, gbp, labelOf, validMobile, validEmail } from '../lib/util.js';
import { icon } from '../lib/icons.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const URL_ = import.meta.env.PUBLIC_SUPABASE_URL, KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
let db, LEADS = [], EVENTS = [], stageFilter = 'All', query = '', photoCache = {};

const show = id => ['vLoading','vSetup','vLogin','vNoAccess','vDash'].forEach(v => $('#' + v).hidden = v !== id);
const srcLabel = s => SOURCES[s] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown');
const waNum = m => { const d = String(m).replace(/\D/g, ''); return d.startsWith('0') ? '44' + d.slice(1) : d; };
const fmtDate = t => { const d = new Date(t); return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' }) + ', ' + d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }); };
const estMid = l => (l.est_low && l.est_high) ? (+l.est_low + +l.est_high) / 2 : (+l.est_low || +l.est_high || 0);
const val = l => +l.final_value || estMid(l);

async function load(){
  const days = +$('#period').value;
  const since = days ? new Date(Date.now() - days * 864e5).toISOString() : '1970-01-01';
  const [leads, events] = await Promise.all([
    db.from('leads').select('*').gte('created_at', since).order('created_at', { ascending:false }).limit(2000),
    db.from('events').select('type,source,created_at').gte('created_at', since).order('created_at', { ascending:false }).limit(50000)
  ]);
  if(leads.error || events.error){ $('#dUpdated').textContent = "Couldn't load leads. Check your connection and press Refresh."; return; }
  LEADS = leads.data; EVENTS = events.data;
  $('#dUpdated').textContent = 'Updated ' + new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  render();
}

function render(){
  const ev = EVENTS, L = LEADS;
  const count = (type, src) => ev.filter(x => x.type === type && (!src || x.source === src)).length;
  const starts = count('est_start'), done = count('est_complete'), visits = count('visit');
  const won = L.filter(l => l.stage === 'Won'), open = L.filter(l => l.stage !== 'Won' && l.stage !== 'Lost');
  const k = [
    [visits, 'Website visits'],
    [L.length, 'Leads', visits ? Math.round(L.filter(l => l.via !== 'Added by hand').length / visits * 100) + '% of visits' : ''],
    [`${done} of ${starts}`, 'Price guides finished', starts ? Math.round(done / starts * 100) + '% finish rate' : ''],
    [count('form_submit'), 'Contact forms sent'],
    [count('wa_click') + count('msg_click'), 'WhatsApp and message taps'],
    [count('phone_click'), 'Phone taps'],
    [gbp(open.reduce((a, l) => a + val(l), 0)), 'Open pipeline (estimated)'],
    [gbp(won.reduce((a, l) => a + val(l), 0)), `Won revenue from ${won.length} job${won.length === 1 ? '' : 's'}`]
  ];
  $('#kpis').innerHTML = k.map(([b, s, e]) => `<div class="kpi"><b>${b}</b><span>${s}</span>${e ? `<em>${e}</em>` : ''}</div>`).join('');

  const srcs = [...new Set([...Object.keys(SOURCES), ...L.map(l => l.source), ...ev.map(e => e.source)].filter(Boolean))];
  const rows = srcs.map(s => { const ls = L.filter(l => l.source === s), w = ls.filter(l => l.stage === 'Won'), vis = count('visit', s);
    return { s, vis, leads:ls.length, rate:vis ? Math.round(ls.length / vis * 100) + '%' : '', won:w.length, rev:w.reduce((a, l) => a + val(l), 0) }; })
    .filter(r => r.vis || r.leads).sort((a, b) => b.rev - a.rev || b.leads - a.leads || b.vis - a.vis);
  const maxRev = Math.max(1, ...rows.map(r => r.rev));
  $('#srcTable').innerHTML = rows.length ? `<div class="tscroll"><table><thead><tr><th>Source</th><th class="num">Visits</th><th class="num">Leads</th><th class="num">Lead rate</th><th class="num">Jobs won</th><th class="num">Revenue</th><th style="width:22%"></th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${esc(srcLabel(r.s))}</td><td class="num">${r.vis}</td><td class="num">${r.leads}</td><td class="num">${r.rate}</td><td class="num">${r.won}</td><td class="num"><b>${gbp(r.rev)}</b></td><td><div class="bar" style="width:${r.rev / maxRev * 100}%"></div></td></tr>`).join('')}</tbody></table></div>`
    : '<p class="note">Nothing yet for this period.</p>';

  const svcRows = [...new Set(L.map(l => l.service || 'other'))].map(s => { const ls = L.filter(l => (l.service || 'other') === s), w = ls.filter(l => l.stage === 'Won');
    return { s, n:ls.length, won:w.length, rev:w.reduce((a, l) => a + val(l), 0), pipe:ls.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').reduce((a, l) => a + val(l), 0) }; });
  $('#svcTable').innerHTML = svcRows.length ? `<div class="tscroll"><table><thead><tr><th>Service</th><th class="num">Leads</th><th class="num">Open pipeline</th><th class="num">Jobs won</th><th class="num">Revenue</th></tr></thead><tbody>${svcRows.sort((a, b) => b.rev - a.rev || b.n - a.n).map(x => `<tr><td>${esc(labelOf(x.s))}</td><td class="num">${x.n}</td><td class="num">${gbp(x.pipe)}</td><td class="num">${x.won}</td><td class="num"><b>${gbp(x.rev)}</b></td></tr>`).join('')}</tbody></table></div>` : '<p class="note">No leads yet for this period.</p>';

  $('#stageChips').innerHTML = ['All', ...STAGES].map(s => `<button type="button" class="chip" data-stage="${s}" aria-pressed="${s === stageFilter}">${s} (${s === 'All' ? L.length : L.filter(l => l.stage === s).length})</button>`).join('');
  renderList();
}

function renderList(){
  const q = query.toLowerCase().replace(/\s/g, '');
  const list = LEADS.filter(l => (stageFilter === 'All' || l.stage === stageFilter) &&
    (!q || [l.name, l.mobile, l.postcode, l.email].some(x => String(x || '').toLowerCase().replace(/\s/g, '').includes(q))));
  $('#leadList').innerHTML = list.length ? list.map(l => `
    <details class="lrow st-${l.stage.replace(' ', '')}" data-id="${l.id}">
      <summary>
        <div class="who"><b>${esc(l.name)}</b><small>${l.postcode ? esc(l.postcode) + ', ' : ''}${fmtDate(l.created_at)}</small></div>
        <div>${esc(labelOf(l.service || 'other'))}<br><span class="mut">${esc(l.via || '')}${l.photos?.length ? `, ${l.photos.length} photo${l.photos.length > 1 ? 's' : ''}` : ''}</span></div>
        <div class="hide-m"><b>${estMid(l) ? gbp(estMid(l)) : 'n/a'}</b><br><span class="mut">${l.est_low && l.est_high && +l.est_low !== +l.est_high ? gbp(l.est_low) + ' to ' + gbp(l.est_high) : l.via === 'Added by hand' && l.est_low ? 'your estimate' : l.budget ? esc(l.budget) : ''}</span></div>
        <div class="hide-m">${esc(srcLabel(l.source))}</div>
        <div><select data-stage-for="${l.id}" aria-label="Stage for ${esc(l.name)}">${STAGES.map(s => `<option ${s === l.stage ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
      </summary>
      <div class="body">
        <div class="lead-acts"><a class="btn small" href="tel:${esc(String(l.mobile).replace(/\s/g, ''))}">${icon('phone')}Call</a><a class="btn wa small" target="_blank" rel="noopener" href="https://wa.me/${waNum(l.mobile)}">${icon('chat')}WhatsApp</a>${l.email ? `<a class="btn line small" href="mailto:${esc(l.email)}">Email</a>` : ''}</div>
        <div><span>Mobile</span>${esc(l.mobile)}</div>
        <div><span>Email</span>${l.email ? esc(l.email) : 'Not given'}</div>
        <div><span>Size</span>${esc(l.size || 'Not given')}</div>
        ${l.budget ? `<div><span>Budget</span>${esc(l.budget)}</div>` : ''}
        ${l.timeframe ? `<div><span>Timeframe</span>${esc(l.timeframe)}</div>` : ''}
        ${l.extras?.length ? `<div><span>Extras</span>${esc(l.extras.join(', '))}</div>` : ''}
        ${l.utm?.campaign ? `<div><span>Campaign</span>${esc(l.utm.campaign)}</div>` : ''}
        ${l.landing_page ? `<div><span>First page seen</span>${esc(l.landing_page)}</div>` : ''}
        ${l.stage === 'Won' ? `<div><label><span>Final job value (£)</span><input type="number" min="0" data-final="${l.id}" value="${l.final_value ?? ''}" placeholder="${Math.round(estMid(l))}"></label></div>` : ''}
        <div class="lead-notes"><label><span>Notes</span><textarea data-notes="${l.id}" rows="2" placeholder="e.g. Called, survey booked for Tuesday">${esc(l.notes || '')}</textarea></label></div>
        ${l.photos?.length ? `<div class="lead-photos" data-photos="${l.id}"><span>Photos</span><div class="thumbs">Loading photos...</div></div>` : ''}
        <div class="lead-del"><button type="button" class="link danger" data-del="${l.id}">Delete this lead</button></div>
      </div>
    </details>`).join('') : `<div class="empty">${LEADS.length ? 'No leads match.' : 'No leads yet for this period. New enquiries from the website appear here automatically.'}</div>`;
}

async function loadPhotos(id){
  const l = LEADS.find(x => x.id === id); const box = $(`[data-photos="${id}"] .thumbs`);
  if(!l || !box) return;
  if(!photoCache[id]){
    const { data, error } = await db.storage.from('lead-photos').createSignedUrls(l.photos, 3600);
    if(error){ box.textContent = "Couldn't load photos."; return; }
    photoCache[id] = data.filter(d => d.signedUrl).map(d => d.signedUrl);
  }
  box.innerHTML = photoCache[id].map(u => `<a href="${u}" target="_blank" rel="noopener"><img alt="Customer photo" src="${u}"></a>`).join('');
}

async function update(id, patch){
  const l = LEADS.find(x => x.id === id); if(!l) return;
  Object.assign(l, patch);
  const { error } = await db.from('leads').update(patch).eq('id', id);
  if(error) alertBar("That change didn't save. Check your connection and try again.");
}
function alertBar(msg){ $('#dUpdated').textContent = msg; }

function initAddLead(){
  const f = $('#addLead'), btn = $('#addLeadBtn');
  $('#aSvc').innerHTML = Object.keys(SERVICES).map(k => `<option value="${k}">${SERVICES[k].label}</option>`).join('') + `<option value="other">${OTHER.other}</option>`;
  $('#aSrc').innerHTML = ['phone','whatsapp','referral','repeat','facebook','instagram','google','direct'].map(k => `<option value="${k}">${SOURCES[k]}</option>`).join('');
  const toggle = open => { f.hidden = !open; btn.setAttribute('aria-expanded', open); if(open) $('#aName').focus(); };
  btn.onclick = () => toggle(f.hidden);
  $('#addCancel').onclick = () => { f.reset(); toggle(false); };
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const v = id => $(id).value.trim();
    const checks = [['#aName', v('#aName') ? '' : 'Enter their name'], ['#aMob', validMobile(v('#aMob')) ? '' : 'Enter a UK mobile number'], ['#aEmail', !v('#aEmail') || validEmail(v('#aEmail')) ? '' : 'Check the email address']];
    const ok = checks.map(([id, msg]) => { $(id).nextElementSibling.textContent = msg; $(id).setAttribute('aria-invalid', !!msg); return !msg; }).every(Boolean);
    if(!ok){ f.querySelector('[aria-invalid="true"]').focus(); return; }
    const value = +v('#aVal') || null;
    $('#addSave').disabled = true;
    const { error } = await db.from('leads').insert({ name:v('#aName'), mobile:v('#aMob'), email:v('#aEmail') || null, postcode:v('#aPc').toUpperCase() || null,
      service:v('#aSvc'), source:v('#aSrc'), notes:v('#aNotes') || null, via:'Added by hand', est_low:value, est_high:value });
    $('#addSave').disabled = false;
    if(error){ $('#addMsg').textContent = "The lead didn't save. Check your connection and try again."; return; }
    $('#addMsg').textContent = ''; f.reset(); toggle(false); load();
  });
}

function wire(){
  $('#period').onchange = load;
  $('#refresh').onclick = load;
  $('#search').oninput = e => { query = e.target.value; renderList(); };
  $('#signOut').onclick = async () => { await db.auth.signOut(); location.reload(); };
  document.addEventListener('click', e => {
    const st = e.target.closest('[data-stage]'); if(st){ stageFilter = st.dataset.stage; render(); return; }
    if(e.target.closest('summary') && e.target.closest('select,input')) e.preventDefault();
    const del = e.target.closest('[data-del]');
    if(del){
      if(del.dataset.armed){ const id = del.dataset.del;
        db.from('leads').delete().eq('id', id).then(async ({ error }) => {
          if(error){ alertBar("That lead wasn't deleted. Try again."); return; }
          const l = LEADS.find(x => x.id === id); if(l?.photos?.length) await db.storage.from('lead-photos').remove(l.photos);
          LEADS = LEADS.filter(x => x.id !== id); render(); });
      } else { del.dataset.armed = '1'; del.textContent = 'Click again to permanently delete this lead and its photos';
        setTimeout(() => { del.dataset.armed = ''; del.textContent = 'Delete this lead'; }, 5000); }
    }
  });
  document.addEventListener('toggle', e => { if(e.target.matches?.('details.lrow') && e.target.open) loadPhotos(e.target.dataset.id); }, true);
  $('#leadList').addEventListener('change', e => {
    const t = e.target;
    if(t.dataset.stageFor){ update(t.dataset.stageFor, { stage:t.value }).then(render); }
    else if(t.dataset.final !== undefined && t.dataset.final){ update(t.dataset.final, { final_value:t.value ? +t.value : null }).then(render); }
    else if(t.dataset.notes){ update(t.dataset.notes, { notes:t.value || null }); }
  });
  initAddLead();
}

async function enter(session){
  $('#signOut').hidden = false;
  const { data:isAdmin } = await db.rpc('is_admin');
  if(!isAdmin){ $('#naEmail').textContent = session.user.email; show('vNoAccess'); return; }
  show('vDash'); load();
}

export async function initAdmin(){
  if(!URL_ || !KEY){ show('vSetup'); return; }
  db = createClient(URL_, KEY);
  wire();
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#lEmail').value.trim();
    if(!validEmail(email)){ $('#lEmail').nextElementSibling.textContent = 'Enter your email address'; $('#lEmail').focus(); return; }
    $('#lEmail').nextElementSibling.textContent = ''; $('#lBtn').disabled = true;
    const { error } = await db.auth.signInWithOtp({ email, options:{ shouldCreateUser:false, emailRedirectTo:location.origin + '/admin/' } });
    $('#lBtn').disabled = false;
    $('#lMsg').className = 'form-msg' + (error ? ' bad' : '');
    $('#lMsg').textContent = error ? "We couldn't send a link to that address. Check it's the email set up for the dashboard." : `Check your inbox. We've sent a sign-in link to ${email}.`;
  });
  const { data:{ session } } = await db.auth.getSession();
  if(session) enter(session); else show('vLogin');
  db.auth.onAuthStateChange((evt, s) => { if(evt === 'SIGNED_IN' && s && $('#vDash').hidden) enter(s); });
}
