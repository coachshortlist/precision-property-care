/* Talks to the website's own server functions. No database keys live in the browser. */
import { getSource, track } from './site.js';

async function post(body){
  const r = await fetch('/api/lead/', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify(body) });
  let data = {}; try{ data = await r.json(); }catch(e){}
  if(!r.ok || data.error) throw new Error(data.error || 'Request failed');
  return data;
}

export async function createLead(fields){
  const s = getSource();
  return post({ action:'create', ...fields, source:s.source, utm:s.utm, referrer:s.referrer, landing:s.landing });
}

/* Shrink phone photos before upload so they send quickly and don't fill the storage allowance. */
async function shrink(file){
  try{
    if(!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
    const img = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.82));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type:'image/jpeg' }) : file;
  }catch(e){ return file; }
}

export async function uploadPhotos(lead, files, onProgress = () => {}){
  if(!lead?.id || !files.length) return 0;
  const ready = await Promise.all([...files].slice(0, 10).map(shrink));
  const { uploads } = await post({ action:'photos', id:lead.id, token:lead.token, files:ready.map(f => ({ type:f.type, size:f.size })) });
  const done = [];
  for(let i = 0; i < uploads.length; i++){
    onProgress(i + 1, uploads.length);
    const fd = new FormData(); fd.append('cacheControl', '3600'); fd.append('', ready[i]);
    const r = await fetch(uploads[i].url, { method:'PUT', body:fd, headers:{ 'x-upsert':'false' } });
    if(r.ok) done.push(uploads[i].path);
  }
  if(done.length){ await post({ action:'attach', id:lead.id, token:lead.token, paths:done }); track('photos_added'); }
  return done.length;
}
