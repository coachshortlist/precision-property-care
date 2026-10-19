// Counts anonymous website activity (visits, button taps) for the dashboard. Stores no personal details.
import { createClient } from '@supabase/supabase-js';

const TYPES = new Set(['visit','est_start','est_complete','form_submit','photos_added','wa_click','msg_click','phone_click','cta_similar','cta_header','cta_mobile']);
const str = (v, max) => (typeof v === 'string' && v.trim()) ? v.trim().slice(0, max) : null;

export async function handleEvent(req){
  if(req.method !== 'POST') return new Response(null, { status:405 });
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return new Response(null, { status:204 });
  let b; try{ b = JSON.parse(await req.text()); }catch(e){ return new Response(null, { status:400 }); }
  if(!TYPES.has(b.type)) return new Response(null, { status:400 });
  if(/bot|crawl|spider|slurp|headless|lighthouse/i.test(req.headers.get('user-agent') || '')) return new Response(null, { status:204 });
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth:{ persistSession:false } });
  const { error } = await db.from('events').insert({ type:b.type, source:str(b.src, 40), page:str(b.page, 200), service:str(b.service, 30) });
  if(error) console.error('Event insert failed', error);
  return new Response(null, { status:204 });
}
