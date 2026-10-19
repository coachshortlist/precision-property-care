// Saves enquiries from the website and handles photo uploads.
// Shared by Vercel and Netlify. Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set as environment variables on the host.
// Optional new-lead email alerts: RESEND_API_KEY, ALERT_EMAIL, ALERT_FROM.
import { createClient } from '@supabase/supabase-js';
import { SERVICES, OTHER } from '../data/site.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers:{ 'content-type':'application/json' } });
const str = (v, max = 200) => (typeof v === 'string' && v.trim()) ? v.trim().slice(0, max) : null;
const num = v => (Number.isFinite(+v) && +v >= 0 && +v < 1e7) ? Math.round(+v) : null;
const MOBILE = /^(?:\+44|0044|0)7\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VIAS = ['Price estimator', 'Contact form'];
const label = k => SERVICES[k]?.label || OTHER[k] || k || 'Not given';
const escHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

async function alertEmail(lead){
  const key = process.env.RESEND_API_KEY, to = process.env.ALERT_EMAIL;
  if(!key || !to) return;
  const site = process.env.URL || '';
  const price = lead.est_low ? `£${lead.est_low.toLocaleString('en-GB')} to £${lead.est_high.toLocaleString('en-GB')}` : 'Not given';
  const rows = [['Name', lead.name], ['Mobile', lead.mobile], ['Email', lead.email], ['Postcode', lead.postcode], ['Job', label(lead.service)], ['Size', lead.size],
    ['Rough price shown', price], ['Budget', lead.budget], ['When', lead.timeframe], ['Notes', lead.notes], ['Came from', lead.source], ['Sent via', lead.via]]
    .filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5B6F80">${k}</td><td style="padding:4px 0"><b>${escHtml(v)}</b></td></tr>`).join('');
  const html = `<h2 style="font-family:Arial,sans-serif">New enquiry: ${escHtml(label(lead.service))}</h2><table style="font-family:Arial,sans-serif;font-size:15px">${rows}</table>
    <p style="font-family:Arial,sans-serif"><a href="tel:${escHtml(lead.mobile)}">Call ${escHtml(lead.name)}</a>${site ? ` &nbsp;|&nbsp; <a href="${site}/admin/">Open the lead dashboard</a>` : ''}</p>`;
  const r = await fetch('https://api.resend.com/emails', {
    method:'POST', headers:{ Authorization:`Bearer ${key}`, 'content-type':'application/json' },
    body:JSON.stringify({ from:process.env.ALERT_FROM || 'Website enquiries <onboarding@resend.dev>', to:to.split(',').map(s => s.trim()), subject:`New enquiry from ${lead.name}: ${label(lead.service)}`, html })
  });
  if(!r.ok) console.error('Lead alert email failed', r.status, await r.text());
}

export async function handleLead(req){
  if(req.method !== 'POST') return json({ error:'Method not allowed' }, 405);
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json({ error:'The website is not connected to the database yet' }, 500);
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth:{ persistSession:false } });

  let b; try{ b = await req.json(); }catch(e){ return json({ error:'Bad request' }, 400); }
  const action = b.action || 'create';

  if(action === 'create'){
    if(b.company) return json({ ok:true, id:null, token:null });           // hidden field only bots fill in
    const name = str(b.name, 100), mobile = str(b.mobile, 30), email = str(b.email, 200);
    if(!name || !mobile || !MOBILE.test(mobile.replace(/[\s()-]/g, ''))) return json({ error:'Name and a UK mobile number are needed' }, 400);
    if(email && !EMAIL.test(email)) return json({ error:'Email address looks wrong' }, 400);
    const service = str(b.service, 30);
    const utm = b.utm && typeof b.utm === 'object' ? { source:str(b.utm.source, 60), medium:str(b.utm.medium, 60), campaign:str(b.utm.campaign, 100) } : null;
    const lead = {
      name, mobile, email, postcode:str(b.postcode, 10)?.toUpperCase() || null,
      service:(SERVICES[service] || OTHER[service]) ? service : null,
      size:str(b.size, 100), budget:str(b.budget, 60), timeframe:str(b.timeframe, 60), notes:str(b.notes, 2000),
      extras:Array.isArray(b.extras) ? b.extras.slice(0, 8).map(x => str(x, 100)).filter(Boolean) : [],
      via:VIAS.includes(b.via) ? b.via : 'Contact form',
      source:str(b.source, 40) || 'direct', utm, referrer:str(b.referrer, 200), landing_page:str(b.landing, 200),
      est_low:num(b.est_low), est_high:num(b.est_high)
    };
    const { data, error } = await db.from('leads').insert(lead).select('id, edit_token').single();
    if(error){ console.error('Lead insert failed', error); return json({ error:'Could not save your enquiry' }, 500); }
    try{ await alertEmail(lead); }catch(e){ console.error('Lead alert email error', e); }
    return json({ ok:true, id:data.id, token:data.edit_token });
  }

  // Photo actions: only the visitor who created the enquiry (who holds its token) can add photos to it.
  const { data:lead } = await db.from('leads').select('id, edit_token, photos').eq('id', str(b.id, 40)).maybeSingle();
  if(!lead || lead.edit_token !== b.token) return json({ error:'Not allowed' }, 403);

  if(action === 'photos'){
    const room = Math.max(0, 10 - lead.photos.length);
    const files = Array.isArray(b.files) ? b.files.slice(0, room) : [];
    const uploads = [];
    for(const f of files){
      if(f.size > 15 * 1024 * 1024) continue;
      const ext = f.type === 'image/png' ? 'png' : f.type === 'image/webp' ? 'webp' : /hei[cf]/.test(f.type || '') ? 'heic' : 'jpg';
      const path = `${lead.id}/${crypto.randomUUID()}.${ext}`;
      const { data, error } = await db.storage.from('lead-photos').createSignedUploadUrl(path);
      if(!error) uploads.push({ path, url:data.signedUrl });
      else console.error('Signed upload URL failed', error);
    }
    return json({ ok:true, uploads });
  }

  if(action === 'attach'){
    const paths = (Array.isArray(b.paths) ? b.paths : []).filter(p => typeof p === 'string' && p.startsWith(lead.id + '/'));
    const photos = [...new Set([...lead.photos, ...paths])].slice(0, 10);
    const { error } = await db.from('leads').update({ photos }).eq('id', lead.id);
    if(error){ console.error('Photo attach failed', error); return json({ error:'Could not save photos' }, 500); }
    return json({ ok:true, count:photos.length });
  }

  return json({ error:'Unknown action' }, 400);
}
