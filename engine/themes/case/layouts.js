/* CASE LÂM SÀNG: vitals, labs, course, decision + ảnh bìa monitor */
const WAVE={ecg:'M0 50 H40 L50 40 L60 50 H75 L82 58 L92 8 L102 70 L110 50 H150 L165 40 L180 50 H200',
 pleth:'M0 60 C20 60 25 15 45 15 C65 15 70 45 85 45 C95 45 98 38 110 40 C130 44 150 60 200 60',
 resp:'M0 55 C30 55 40 20 70 20 C100 20 110 55 140 55 C160 55 180 55 200 55'};
const waveSvg=(w,c)=>{const one=WAVE[w]||WAVE.ecg;
 const segs=[];for(let i=0;i<12;i++)segs.push(`<path d="${one}" transform="translate(${i*200} 0)" fill="none" stroke="${c}" stroke-width="3.5" stroke-linejoin="round"/>`);
 return `<svg class="wave" viewBox="0 0 2400 80" preserveAspectRatio="none">${segs.join('')}</svg>`};
L.vitals=s=>`<div class="mon">
  <div class="pt"><div class="card c-blue" data-in="${at(s.patient.at??0)}" data-a="left"><div class="tagc c-blue">${esc(s.patient.tag||'BỆNH NHÂN')}</div>
    <div style="font-size:36px;font-weight:800;margin-top:12px;line-height:1.2">${esc(s.patient.t)}</div>
    <div class="mut" style="font-size:27px;margin-top:12px;line-height:1.45">${esc(s.patient.d||'')}</div></div>
   ${(s.findings||[]).map(f=>`<div class="card ${C(f.c||'amber')}" style="padding:16px 24px" data-in="${at(f.at)}" data-a="left" data-hl="${at(f.at)}"><div style="font-size:27px;font-weight:600;line-height:1.4"><span class="acc">▸</span> ${esc(f.t)}</div></div>`).join('')}</div>
  <div class="vgrid">${s.vitals.map(v=>`<div class="vt ${C(v.c||'green')} ${v.wave?'wide':''} ${v.alarm?'alarm':''}" style="--c:var(--${v.c||'green'})" data-in="${at(v.at)}" data-a="pop">
    <div class="k">${esc(v.k)}</div><div class="v mono">${esc(v.v)}<span class="u">${esc(v.u||'')}</span></div>${v.f?`<div class="f">${esc(v.f)}</div>`:''}
    ${v.wave?waveSvg(v.wave,`var(--${v.c||'green'})`):''}</div>`).join('')}</div></div>`;
L.labs=s=>`<div class="labs" style="grid-template-columns:repeat(${s.groups.length},1fr)">${s.groups.map(g=>`<div class="card lg ${C(g.c||'teal')}" data-in="${at(g.at)}" data-a="up" data-hl="${at(g.at)}">
  <div class="gt">${esc(g.g)}</div>${g.rows.map(r=>`<div class="lr"><span>${esc(r.k)}</span><span class="lv mono f${r.f||'N'}">${esc(r.v)}${r.f==='H'?' ↑':r.f==='L'?' ↓':''}</span><span class="rg">${esc(r.r||'')}</span></div>`).join('')}
  ${g.note?`<div style="font-size:24px;margin-top:14px;line-height:1.4" class="acc">${esc(g.note)}</div>`:''}</div>`).join('')}</div>`;
L.course=s=>`<div class="course"><div class="ax"></div>${s.events.map(e=>`<div class="card ce ${C(e.c||'teal')}" data-in="${at(e.at)}" data-a="left" data-hl="${at(e.at)}">
  <div class="tm mono">${esc(e.time)}</div><div class="dt"></div><div class="et">${esc(e.t)}</div>${e.d?`<div class="ed">${esc(e.d)}</div>`:''}</div>`).join('')}</div>`;
L.decision=s=>`<div class="dp" data-in="${at(s.q_at??0)}"><div class="no">${esc(s.step||'ĐIỂM QUYẾT ĐỊNH')}</div><div class="q">${esc(s.q)}</div></div>
  ${s.context?`<div class="card c-blue" style="padding:16px 26px;margin-bottom:22px" data-in="${at(s.q_at??0)}"><div style="font-size:28px;line-height:1.45">${esc(s.context)}</div></div>`:''}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">${s.options.map((o,i)=>`<div class="card ${i===s.answer?'c-green':'c-coral'}" data-in="${at(s.q_at??0)}+${0.3+i*0.25}" data-a="up" ${i===s.answer?`data-hl="${at(s.answer_at)}+"`:`data-dim="${at(s.answer_at)}"`}>
   <div style="font-size:30px;font-weight:700">${String.fromCharCode(65+i)}. ${esc(o)}</div></div>`).join('')}</div>
  <div class="card c-green" style="margin-top:22px" data-in="${at(s.answer_at)}" data-a="up"><div class="ans"><span class="acc">Chọn ${String.fromCharCode(65+s.answer)}.</span> ${esc(s.explain)}</div></div>`;
const _title=L.title; L.title=s=>{const m=s.monitor||{};return _title({...s,art:'none'}).replace(/<svg[\s\S]*?<\/svg>/,`<svg style="position:absolute;right:20px;top:150px" width="700" height="520" viewBox="0 0 700 520">
  <rect x="20" y="20" width="660" height="420" rx="28" fill="#020606" stroke="rgba(110,231,183,.35)" stroke-width="4" data-a="pop" data-in="0.3"/>
  <path d="M40 150 H170 L190 125 L210 150 H240 L255 170 L280 50 L305 220 L325 150 H430 L450 125 L470 150 H500 L515 170 L540 50 L565 220 L585 150 H660" fill="none" stroke="#4ade80" stroke-width="5" stroke-linejoin="round" data-a="draw" data-in="0.6"/>
  <path d="M40 300 C80 300 90 250 120 250 C150 250 155 285 175 285 C200 285 210 300 260 300 C300 300 310 250 340 250 C370 250 375 285 395 285 C420 285 430 300 480 300 C520 300 530 250 560 250 C590 250 595 285 615 285 C640 285 650 300 660 300" fill="none" stroke="#38bdf8" stroke-width="4" data-a="draw" data-in="1.0"/>
  <text x="660" y="400" text-anchor="end" fill="#f87171" font-size="64" font-weight="800" font-family="Inter" data-in="1.4">${esc(m.hr||'128')}</text>
  <text x="60" y="400" fill="#facc15" font-size="44" font-weight="800" font-family="Inter" data-in="1.6">${esc(m.bp||'82/46')}</text>
  <rect x="290" y="460" width="120" height="40" rx="12" fill="rgba(248,113,113,.25)" stroke="#f87171" stroke-width="3" data-a="pop" data-in="1.8"/></svg>`);};
window.THEME_TICK=(t)=>{document.querySelectorAll('.wave').forEach(w=>{w.style.transform=`translateX(${-((t*0.9)%1)*8.333}%)`;});};
