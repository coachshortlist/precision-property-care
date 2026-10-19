import { SERVICES } from '../data/site.js';

/* ===== illustrations: stand-ins until real job photos go in ===== */
export function rng(seed){ let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
export function art(kind, state, seed){
  const r = rng(seed * 13 + (state === 'after' ? 5 : 1));
  const pick = a => a[Math.floor(r() * a.length)];
  const before = state === 'before';
  const HZ = 104, YV = 40, F = 250, FX = 270, ZF = F / (HZ - YV);
  const P = (u, z) => [(200 + FX * u / z).toFixed(1), (YV + F / z).toFixed(1)];
  const quad = (u0, u1, z0, z1, fill) => { const a = P(u0,z0), b = P(u1,z0), c = P(u1,z1), d = P(u0,z1); return `<polygon points="${a} ${b} ${c} ${d}" fill="${fill}"/>`; };
  const R = (x, y, w, h, f, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${extra}/>`;
  const ground = c => R(0, HZ, 400, 260 - HZ, c);
  const paving = (tw, td, cols, joint, gap, z0 = 0.86, z1 = ZF + .1) => {
    let o = joint ? ground(joint) : ''; let row = 0;
    for(let z = z0; z < z1; z += td, row++){ const off = row % 2 ? tw / 2 : 0;
      for(let u = -4 - off; u < 4; u += tw) o += quad(u + gap, u + tw - gap, z + gap, Math.min(z + td, z1) - gap, pick(cols)); }
    return o; };
  const planks = (cols, joint, w = .34) => { let o = ground(joint);
    for(let u = -4; u < 4; u += w){ let z = .5 + r() * .4; while(z < ZF + .1){ const L = .7 + r() * 1.1; o += quad(u + .012, u + w - .012, z + .012, Math.min(z + L, ZF + .1) - .012, pick(cols)); z += L; } }
    return o; };
  const stripes = (c1, c2, z0 = 0.86, z1 = ZF + .1) => { let o = '', i = 0; for(let u = -4; u < 4; u += .55, i++) o += quad(u, u + .55, z0, z1, i % 2 ? c1 : c2); return o; };
  const patches = (n, cols, size) => { let o = ''; for(let i = 0; i < n; i++){ const z = 0.9 + r() * (ZF - .9), [x, y] = P(-2.5 + r() * 5, z), rx = (size * (0.5 + r())) / z;
      o += `<ellipse cx="${x}" cy="${y}" rx="${rx.toFixed(1)}" ry="${(rx * .32).toFixed(1)}" fill="${pick(cols)}" opacity="${(.5 + r() * .4).toFixed(2)}"/>`; } return o; };
  const weeds = n => { let o = ''; for(let i = 0; i < n; i++){ const z = 0.9 + r() * (ZF - .9), [x, y] = P(-2.4 + r() * 4.8, z), h = (26 + r() * 20) / z;
      o += `<path d="M${x} ${y}l${(-h*.25).toFixed(1)} ${(-h).toFixed(1)}M${x} ${y}l0 ${(-h*1.1).toFixed(1)}M${x} ${y}l${(h*.3).toFixed(1)} ${(-h*.9).toFixed(1)}" stroke="${pick(['#4E6A2C','#5F7A34','#3F5A25'])}" stroke-width="${(3.2/z).toFixed(2)}" stroke-linecap="round"/>`; } return o; };
  const tiles = (x0, y0, x1, y1, tw, th, cols, grout) => { let o = R(x0, y0, x1 - x0, y1 - y0, grout); for(let y = y0; y < y1; y += th) for(let x = x0; x < x1; x += tw) o += R(x + 1, y + 1, Math.min(tw, x1 - x) - 2, Math.min(th, y1 - y) - 2, pick(cols)); return o; };
  const skirting = c => R(0, HZ - 6, 400, 6, c);
  let g = '';

  /* ---- inside ---- */
  if(kind === 'kitchens'){
    g += R(0, 0, 400, HZ, before ? '#E7D9B9' : '#F1F4F6');
    g += before ? planks(['#B49B72','#A88F67','#BFA67C'], '#8E7756', .5) + patches(14, ['#8A7656','#9C8662'], 30) : paving(.6, .6, ['#DADDDF','#D0D4D7','#E1E3E5'], '#BFC4C8', .01);
    g += before ? tiles(10, 38, 390, 66, 14, 14, ['#C9AE84','#BFA276'], '#A98E64') : R(10, 38, 380, 28, '#DCE5EC') + `<path d="M10 52h380" stroke="#CBD6DF"/>`;
    for(let x = 10; x < 390; x += 47.5) g += R(x + 1, 4, 45.5, 32, before ? '#8E5F36' : '#FFFFFF', before ? 'stroke="#6E4726" stroke-width="2"' : 'stroke="#D6DDE3" stroke-width="1"');
    g += R(6, 66, 388, 7, before ? '#D8C79E' : '#F7F7F5') + R(6, 72, 388, 2, before ? '#B8A57A' : '#D9DCDE');
    for(let x = 10; x < 390; x += 47.5) g += R(x + 1, 75, 45.5, 36, before ? '#8E5F36' : '#24415F', before ? 'stroke="#6E4726" stroke-width="2"' : '') + (before ? `<circle cx="${x + 38}" cy="84" r="2" fill="#D9C08A"/>` : R(x + 6, 78, 34, 2, '#3A5A7A'));
    g += R(6, 111, 388, 5, before ? '#5E4027' : '#1A3048');
    g += R(240, 63, 46, 4, before ? '#C9C3B5' : '#B7C0C7') + `<path d="M263 63v-12h8" stroke="${before ? '#B9B3A5' : '#9AA5AE'}" stroke-width="3" fill="none"/>`;
    if(!before) g += `<path d="M120 0v14M280 0v14" stroke="#24415F" stroke-width="1.5"/><circle cx="120" cy="18" r="6" fill="#E7B94C"/><circle cx="280" cy="18" r="6" fill="#E7B94C"/>`;
  }
  else if(kind === 'bathrooms'){
    g += before ? tiles(0, 0, 400, HZ, 16, 16, ['#E7DDB4','#E1D6A9'], '#C9BC8F') : tiles(0, 0, 400, HZ, 64, 32, ['#E8EBED','#E2E6E9','#ECEEF0'], '#D2D7DB');
    g += before ? paving(.45, .45, ['#C9B58C','#BFAA80'], '#A99670', .01) : paving(.7, .7, ['#7E878E','#858E95','#78818A'], '#6A737A', .01);
    const suite = before ? '#A9BC8E' : '#FFFFFF', edge = before ? '#8FA373' : '#DDE2E6';
    g += R(14, 60, 210, 54, suite, `stroke="${edge}" stroke-width="2"`) + R(10, 56, 218, 8, suite, `stroke="${edge}" stroke-width="2" rx="3"`);
    if(!before) g += R(150, 6, 4, 52, '#C8D6E0') + `<rect x="154" y="6" width="70" height="52" fill="#D9ECF7" opacity=".55"/>` + `<circle cx="200" cy="14" r="5" fill="#B8C2C9"/>`;
    g += R(258, 34, 46, 26, suite, `stroke="${edge}" stroke-width="2" rx="3"`) + `<path d="M262 62h38l-4 30h-30z" fill="${suite}" stroke="${edge}" stroke-width="2"/>` + R(268, 92, 26, 22, suite, `stroke="${edge}" stroke-width="2"`);
    if(before) g += `<path d="M336 70h50l-4 14h-42z" fill="${suite}" stroke="${edge}" stroke-width="2"/>` + R(353, 84, 16, 30, suite, `stroke="${edge}" stroke-width="2"`) + R(338, 18, 46, 36, '#D3DCE0', 'stroke="#B9A97C" stroke-width="3"');
    else g += R(322, 72, 72, 42, '#2B4A66') + R(318, 66, 80, 7, '#F4F5F6') + R(338, 10, 40, 48, '#D6E3EC', 'stroke="#B7C3CB" stroke-width="2" rx="4"');
  }
  else if(kind === 'boilers' || kind === 'electrical' || kind === 'plumbing' || kind === 'flooring'){
    g += R(0, 0, 400, HZ, before ? '#E4DAC6' : '#F1F4F6') + skirting(before ? '#D3C6AA' : '#FFFFFF');
    if(kind === 'flooring') g += before ? ground('#8C7262') + patches(40, ['#7A6152','#9B8070','#6E5649','#A68B78'], 40) + `<ellipse cx="160" cy="190" rx="34" ry="10" fill="#6A5244" opacity=".6"/>` : planks(['#C99D6E','#BC9063','#D2A979','#C49668'], '#9E7752');
    else g += before ? planks(['#B49B72','#A88F67'], '#8E7756', .5) : planks(['#D8C8B0','#CFBEA4','#DFD1BB'], '#BDAA8E', .4);
    if(kind === 'boilers'){
      if(before){ g += R(146, 6, 108, 84, '#E9E1CF', 'stroke="#C9BB9C" stroke-width="2"') + R(158, 18, 84, 46, '#B89C74') + R(170, 70, 60, 10, '#7F6A4C');
        for(let i = 0; i < 6; i++) g += `<path d="M${165 + i * 13} 90q${(r()-.5)*20} 10 ${(r()-.5)*10} ${HZ - 90}" stroke="${pick(['#B87333','#A0632B'])}" stroke-width="3" fill="none"/>`;
        g += `<path d="M170 64l3 14M210 64l-2 18" stroke="#9A5B2A" stroke-width="3" opacity=".6"/>`; }
      else { g += R(168, 12, 64, 74, '#FFFFFF', 'stroke="#D5DCE2" stroke-width="2" rx="4"') + R(184, 60, 32, 10, '#2F9BD7', 'rx="2"') + `<circle cx="200" cy="40" r="3" fill="#D5DCE2"/>`;
        for(let i = 0; i < 4; i++) g += R(178 + i * 13, 86, 4, HZ - 86, '#C9CED2'); }
    } else if(kind === 'electrical'){
      if(before){ g += R(146, 20, 108, 58, '#7A6A55', 'stroke="#5F513F" stroke-width="2"');
        for(let i = 0; i < 6; i++) g += R(156 + i * 15, 32, 11, 32, '#EFE9DC', 'stroke="#BFB49F"');
        for(let i = 0; i < 5; i++) g += `<path d="M${160 + i * 18} 78q${(r()-.5)*60} 14 ${(r()-.5)*40} ${HZ - 78}" stroke="${pick(['#2E2E2E','#8A8A8A','#B23A2E'])}" stroke-width="2.5" fill="none"/>`; }
      else { g += R(128, 22, 144, 52, '#FFFFFF', 'stroke="#D5DCE2" stroke-width="2" rx="4"') + R(136, 38, 128, 22, '#E9EDF0', 'rx="2"');
        for(let i = 0; i < 9; i++) g += R(140 + i * 11, 42, 8, 14, '#4A5560', 'rx="1"');
        g += R(244, 40, 14, 18, '#2F9BD7', 'rx="2"') + R(190, 74, 20, HZ - 74, '#FFFFFF', 'stroke="#D5DCE2"'); }
    } else if(kind === 'plumbing'){
      const rc = before ? '#E6DCC4' : '#FFFFFF';
      g += R(70, 44, 260, 50, rc, `stroke="${before ? '#C9BB98' : '#DDE2E6'}" stroke-width="2" rx="3"`);
      for(let x = 80; x < 326; x += 10) g += R(x, 48, 2, 42, before ? '#D6CAB0' : '#EEF1F3');
      g += R(60, 80, 10, 10, before ? '#B87333' : '#C9CED2') + R(330, 80, 10, 10, before ? '#B87333' : '#C9CED2') + R(63, 90, 4, HZ - 90, before ? '#B87333' : '#C9CED2') + R(333, 90, 4, HZ - 90, before ? '#B87333' : '#C9CED2');
      if(before) g += `<path d="M120 94q4 8 2 16M250 94q-3 9 1 18" stroke="#A8743A" stroke-width="4" opacity=".55"/><ellipse cx="335" cy="${HZ + 8}" rx="18" ry="5" fill="#9C7A55" opacity=".5"/>`;
    }
  }
  /* ---- outside ---- */
  else if(kind === 'gutters'){
    g += R(0, 0, 400, 260, '#CFE7F7') + `<polygon points="-20,150 200,30 420,150" fill="#5C6670"/>`;
    for(let y = 50; y < 150; y += 14) g += R(0, y, 400, 1.5, '#4E5761', 'opacity=".7"');
    g += R(0, 150, 400, 110, '#EDE7DC') + R(60, 182, 70, 56, '#B9CFDD', 'stroke="#fff" stroke-width="5"') + R(250, 182, 70, 56, '#B9CFDD', 'stroke="#fff" stroke-width="5"');
    g += R(-10, 146, 420, 16, before ? '#B7BDB9' : '#F6F8F9', 'rx="3"') + R(360, 158, 12, 102, before ? '#B7BDB9' : '#F6F8F9');
    if(before) for(let i = 0; i < 46; i++) g += `<ellipse cx="${(r()*400).toFixed(0)}" cy="${(141+r()*7).toFixed(0)}" rx="${(5+r()*8).toFixed(0)}" ry="${(3+r()*4).toFixed(0)}" fill="${pick(['#7A5A2A','#5B6B2E','#8C6B33','#46582A'])}"/>`;
  } else {
    const house = kind === 'driveway' || kind === 'washing';
    if(house){ g += R(0, 0, 400, HZ, before ? '#D8D0C2' : '#EDE7DC') + R(40, 18, 70, 52, '#B9CFDD', 'stroke="#FFFFFF" stroke-width="5"') + R(200, 22, 150, HZ - 22, before ? '#8E969C' : '#A9B3BA');
      for(let i = 0; i < 5; i++) g += R(200, 30 + i * 15, 150, 2, '#8F99A1'); }
    else { g += R(0, 0, 400, HZ, '#CFE7F7') + R(0, HZ - 46, 400, 46, '#E2F1FB');
      for(let i = 0; i < 9; i++) g += `<circle cx="${(i * 50 + r() * 30).toFixed(0)}" cy="${(HZ - 54 + r() * 12).toFixed(0)}" r="${(22 + r() * 16).toFixed(0)}" fill="${pick(['#6E9A5B','#5F8B4E','#7FA868'])}"/>`;
      const worn = before && (kind === 'fencing' || kind === 'garden' || kind === 'turf');
      g += R(0, HZ - 52, 400, 52, worn ? '#6D5B47' : '#9A7653');
      for(let x = 0; x < 400; x += 13){ const c = worn ? pick(['#7A6650','#665441','#857059']) : pick(['#A7825C','#9C7854','#B08B63']);
        const h = worn ? 30 + r() * 24 : 52, tilt = worn ? (r() - .5) * 8 : 0; if(worn && r() < .12) continue;
        g += `<rect x="${x}" y="${HZ - h}" width="12" height="${h}" fill="${c}" transform="rotate(${tilt.toFixed(1)} ${x + 6} ${HZ})"/>`; }
      if(!worn) for(let x = 0; x < 400; x += 104) g += R(x, HZ - 56, 7, 56, '#7C5D3F'); }
    if(before){
      if(kind === 'washing') g += paving(.62, .42, ['#7A7C74','#6C6E66','#83847B','#727067'], '#45602B', .025) + patches(26, ['#3D4136','#4B5C32','#5A5444'], 34);
      else if(kind === 'driveway'){ g += ground('#8C9094') + patches(30, ['#7C8085','#9A9EA2','#6F7378'], 40);
        for(let i = 0; i < 7; i++){ const z = 1 + r() * 2.5, [x, y] = P(-1.5 + r() * 3, z); g += `<path d="M${x} ${y}l${(r()*30-15).toFixed(0)} ${(8/z).toFixed(1)}l${(r()*30-15).toFixed(0)} ${(6/z).toFixed(1)}" stroke="#4F5357" stroke-width="1.6" fill="none"/>`; }
        g += weeds(16); }
      else g += ground('#7F8A54') + patches(60, ['#8C7A55','#6E7C45','#9A8A63','#5E6E3A','#A08C66'], 46) + weeds(46);
    } else {
      if(kind === 'washing') g += paving(.62, .42, ['#D6D2C7','#CCC7BB','#DDD9CF'], '#B5AFA1', .025);
      else if(kind === 'patio') g += paving(.7, .46, ['#D3D0C8','#C7C3BA','#DAD7D0'], '#A9A497', .022) + R(300, HZ - 30, 46, 34, '#4C5A63') + `<circle cx="323" cy="${HZ-34}" r="18" fill="#5C9150"/>`;
      else if(kind === 'driveway') g += paving(.22, .11, ['#8E7466','#7E6558','#9A8070','#6F5A4F'], '#5A4A41', .008);
      else if(kind === 'turf') g += stripes('#6DAE4F', '#5E9F44') + quad(-4, 4, .86, .98, '#B9B3A6');
      else if(kind === 'fencing') g += stripes('#74AE58', '#68A24D');
      else { g += stripes('#73AD56', '#66A04B') + paving(.7, .46, ['#D3D0C8','#C7C3BA','#DAD7D0'], null, .022, .86, 1.7);
        for(let i = 0; i < 12; i++) g += `<circle cx="${(i * 35 + r() * 14).toFixed(0)}" cy="${(HZ + 4 + r() * 6).toFixed(0)}" r="${(10 + r() * 7).toFixed(0)}" fill="${pick(['#3F7A45','#558B4A','#6A9E55','#4E8A50','#3F7A45','#B48AA4','#CDB36A'])}"/>`; }
    }
  }
  const align = SERVICES[kind]?.group === 'inside' ? 'xMidYMin' : 'xMidYMid';
  return `<svg viewBox="0 0 400 260" preserveAspectRatio="${align} slice" aria-hidden="true">${g}</svg>`;
}
export function beforeAfter(el, kind, seed){
  el.innerHTML = `<div class="before">${art(kind,'before',seed)}</div><div class="after">${art(kind,'after',seed)}</div>
    <span class="tag l">Before</span><span class="tag r">After</span>
    <input type="range" min="0" max="100" value="50" aria-label="Slide to compare before and after"><div class="handle"></div>`;
  el.querySelector('input').addEventListener('input', e => el.style.setProperty('--pos', e.target.value + '%'));
}

