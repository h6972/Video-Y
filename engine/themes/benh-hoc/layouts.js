/* BỆNH HỌC: thanh chương (TL.rail), pathway (bệnh sinh), ảnh bìa sách */
if(TL.rail&&TL.rail.length){document.body.classList.add('rail');
 const r=document.createElement('div');r.id='rail';
 r.innerHTML=`<div class="rt">NỘI DUNG</div>`+TL.rail.map((x,i)=>`<div class="ri" data-k="${x.k}"><i>${i+1}</i><span>${esc(x.t)}</span></div>`).join('');
 document.getElementById('stage').appendChild(r);}
L.pathway=s=>`<div class="pw">${s.steps.map((p,i)=>`${i?`<div class="ar" data-in="${at(p.at)}">→</div>`:''}<div class="st"><div class="card ${C(p.c||'teal')}" data-in="${at(p.at)}" data-a="up" data-hl="${at(p.at)}">
  <div class="sn">${esc(p.n||('BƯỚC '+(i+1)))}</div><div class="stt">${esc(p.t)}</div><div class="sd">${esc(p.d||'')}</div></div></div>`).join('')}</div>`;
const _title=L.title; L.title=s=>_title({...s,art:'none'}).replace(/<svg[\s\S]*?<\/svg>/,`<svg style="position:absolute;right:30px;top:150px" width="640" height="560" viewBox="0 0 640 560">
  <path d="M320 120 C250 80 140 80 60 110 V470 C140 440 250 440 320 480 Z" fill="#fff" stroke="#9f1239" stroke-width="5" data-a="draw" data-in="0.3"/>
  <path d="M320 120 C390 80 500 80 580 110 V470 C500 440 390 440 320 480 Z" fill="#fff" stroke="#9f1239" stroke-width="5" data-a="draw" data-in="0.5"/>
  <path d="M110 170 H270 M110 215 H270 M110 260 H240 M110 305 H270 M370 170 H530 M370 215 H500 M370 260 H530" stroke="rgba(30,41,59,.25)" stroke-width="6" stroke-linecap="round" data-a="draw" data-in="0.9"/>
  <path d="M400 330 h40 v-40 h30 v40 h40 v30 h-40 v40 h-30 v-40 h-40 Z" fill="rgba(15,118,110,.15)" stroke="#0f766e" stroke-width="4" data-a="pop" data-in="1.3"/></svg>`);
window.THEME_TICK=(t,cur,S)=>{if(!TL.rail)return;const k=S[cur].sc.rail;const keys=TL.rail.map(x=>x.k);const ci=keys.indexOf(k);
 document.querySelectorAll('#rail .ri').forEach((e,i)=>{e.classList.toggle('on',i===ci);e.classList.toggle('done',ci>=0&&i<ci);});
 const r=document.getElementById('rail'); if(r) r.style.display=S[cur].sc.layout==='title'?'none':'flex';};
