/* "Tell us about your job" form on the contact page. */
import { SERVICES, GROUPS, OTHER, WA } from '../data/site.js';
import { keysIn, validMobile, validEmail, validPc } from '../lib/util.js';
import { track } from './site.js';
import { createLead, uploadPhotos } from './api.js';

const $ = s => document.querySelector(s);

export function initContact(){
  const form = $('#sendForm'); if(!form) return;
  $('#sType').innerHTML = '<option value="">Choose one</option>' +
    Object.entries(GROUPS).map(([g, gl]) => `<optgroup label="${gl}">${keysIn(g).map(k => `<option value="${k}">${SERVICES[k].label}</option>`).join('')}</optgroup>`).join('') +
    `<option value="repairs">${SERVICES.repairs.label}</option><option value="other">${OTHER.other}</option>`;
  const pre = new URLSearchParams(location.search).get('type');
  if(pre && (SERVICES[pre] || pre === 'other')) $('#sType').value = pre;

  let files = [];
  $('#sPhotos').onchange = e => {
    files = [...e.target.files].slice(0, 10);
    $('#sThumbs').innerHTML = files.map(f => `<img alt="" src="${URL.createObjectURL(f)}">`).join('') + (files.length ? `<span class="hint">${files.length} photo${files.length > 1 ? 's' : ''} added</span>` : '');
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const v = id => $(id).value.trim();
    const checks = [['#sName', v('#sName') ? '' : 'Enter your name'], ['#sMob', validMobile(v('#sMob')) ? '' : 'Enter a UK mobile number, e.g. 07700 900123'],
      ['#sEmail', validEmail(v('#sEmail')) ? '' : 'Enter an email address like name@example.com'], ['#sPc', validPc(v('#sPc')) ? '' : 'Enter your full postcode, e.g. G61 1AB'],
      ['#sType', v('#sType') ? '' : 'Choose the type of work']];
    let first = null;
    checks.forEach(([id, msg]) => { $(id).nextElementSibling.textContent = msg; $(id).setAttribute('aria-invalid', !!msg); if(msg && !first) first = $(id); });
    if(first){ first.focus(); return; }

    const btn = $('#sSubmit'), msg = $('#sMsg'), b = $('#sBudget');
    btn.disabled = true; btn.textContent = 'Sending...'; msg.className = 'form-msg'; msg.textContent = '';
    try{
      const lead = await createLead({ name:v('#sName'), mobile:v('#sMob'), email:v('#sEmail'), postcode:v('#sPc').toUpperCase(), service:v('#sType'),
        size:v('#sSize'), budget:b.value ? b.options[b.selectedIndex].text : '', timeframe:v('#sWhen'), notes:v('#sNotes'), via:'Contact form', company:v('#sCo') });
      track('form_submit', { service:v('#sType') });
      let sent = 0;
      if(files.length){ btn.textContent = 'Sending photos...'; try{ sent = await uploadPhotos(lead, files); }catch(err){} }
      const first = v('#sName').split(' ')[0];
      form.reset(); $('#sThumbs').innerHTML = ''; files = [];
      msg.className = 'form-msg done';
      msg.textContent = `Thanks ${first}, we've got your enquiry${sent ? ` and ${sent} photo${sent > 1 ? 's' : ''}` : ''}. We'll be in touch within one working day.`;
    }catch(err){
      msg.className = 'form-msg bad';
      msg.innerHTML = `Your enquiry didn't send. Check your connection and try again, or <a href="https://wa.me/${WA}" target="_blank" rel="noopener">message us on WhatsApp</a>.`;
    }finally{ btn.disabled = false; btn.textContent = 'Send enquiry'; }
  });
}
