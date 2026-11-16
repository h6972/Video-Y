/* CIRCUIT: hoạt hình mạch lọc máu liên tục (CRRT) với chống đông citrate vùng.
   Trường: steps[{k: access|pump|citrate|filter|effluent|ica|calcium|return, at}] (bộ phận hiện dần),
   flow_at (lúc hạt máu bắt đầu chạy), labels{k: chữ thay nhãn mặc định}, ica_t (chữ ô Ca ion), dose_t (chữ liều),
   notes[{tag,t,d,at,c}] (cột phải, notes_w), w (rộng hình, mặc định 960).
   Hạt máu: đỏ trước điểm citrate → cam (đã chống đông trong mạch) → xanh sau khi trả canxi. */
(()=>{
const LB={access:'Đường ra',pump:'Bơm máu',citrate:'Citrate',filter:'Quả lọc',effluent:'Dịch thải',
  calcium:'Canxi',ret:'Đường về',patient:'NGƯỜI BỆNH'};
const SEG={s1:'M160 280 L500 280',s2:'M500 280 L700 280 L700 530',s2b:'M700 530 L700 590 L420 590',s3:'M420 590 L200 590 L200 360 L160 360',s4:'M740 340 L878 340'};
const SEGC={s1:'var(--coral)',s2:'var(--amber)',s2b:'var(--amber)',s3:'var(--blue)',s4:'#eab308'};
let CID=0;
L.circuit=s=>{const st={};(s.steps||[]).forEach(x=>st[x.k]=at(x.at));const A=k=>st[k]??'0';
 const lb={...LB,...(s.labels||{})};const id='cc'+(CID++);const W=s.w||960;
 const dots=(seg,n,sp)=>Array.from({length:n},(_,i)=>`<circle class="cdot" r="9" fill="${SEGC[seg]}" data-seg="${id}-${seg}" data-off="${i/n}" data-sp="${sp}" data-t0="${at(s.flow_at??0)}" style="opacity:0"/>`).join('');
 const drop=(x,y1,y2,c,k)=>[0,0.5].map(o=>`<circle class="cdrop" r="7" fill="${c}" data-x="${x}" data-y1="${y1}" data-y2="${y2}" data-off="${o}" data-t0="${A(k)}" style="opacity:0"/>`).join('');
 const txt=(x,y,t,c,anc='middle',sz=26,w=700)=>`<text x="${x}" y="${y}" text-anchor="${anc}" font-size="${sz}" font-weight="${w}" fill="${c}">${esc(t)}</text>`;
 const svg=`<svg viewBox="0 0 960 640" width="${W}" height="${W*640/960}" style="overflow:visible">
  ${Object.entries(SEG).map(([k,d])=>`<path id="${id}-${k}" d="${d}" fill="none" stroke="none"/>`).join('')}
  <g data-in="0" data-a="pop"><rect x="20" y="220" width="140" height="200" rx="26" fill="rgba(255,255,255,.04)" stroke="var(--violet)" stroke-width="4"/>
   <circle cx="90" cy="275" r="26" fill="none" stroke="var(--violet)" stroke-width="4"/><path d="M50 360 Q90 312 130 360" fill="none" stroke="var(--violet)" stroke-width="4"/>
   ${txt(90,405,lb.patient,'var(--violet)','middle',19,800)}</g>
  <g data-in="${A('access')}"><path d="M160 280 L500 280" stroke="var(--coral)" stroke-width="12" fill="none" stroke-linecap="round" data-a="draw" data-in="${A('access')}"/>
   ${txt(222,262,lb.access,'var(--coral)','middle',22)}</g>
  <g data-in="${A('pump')}" data-a="pop"><circle cx="340" cy="280" r="50" fill="rgba(0,0,0,.25)" stroke="var(--teal)" stroke-width="6"/>
   <g class="crotor" data-cx="340" data-cy="280"><line x1="304" y1="280" x2="376" y2="280" stroke="var(--teal)" stroke-width="8" stroke-linecap="round"/><circle cx="304" cy="280" r="9" fill="var(--teal)"/><circle cx="376" cy="280" r="9" fill="var(--teal)"/></g>
   ${txt(340,365,lb.pump,'var(--teal)','middle',24)}</g>
  <g data-in="${A('citrate')}" data-a="pop"><rect x="465" y="70" width="70" height="100" rx="14" fill="rgba(251,146,60,.18)" stroke="var(--amber)" stroke-width="4"/>
   <rect x="473" y="105" width="54" height="57" rx="8" fill="var(--amber)" opacity=".55"/>
   <line x1="500" y1="170" x2="500" y2="272" stroke="var(--amber)" stroke-width="4" stroke-dasharray="8 8"/>
   ${txt(500,52,lb.citrate,'var(--amber)','middle',26,800)}${drop(500,176,268,'var(--amber)','citrate')}</g>
  <g data-in="${A('filter')}"><path d="M500 280 L700 280 L700 300" stroke="var(--amber)" stroke-width="12" fill="none" data-a="draw" data-in="${A('filter')}"/>
   <rect x="660" y="300" width="80" height="230" rx="30" fill="rgba(255,255,255,.05)" stroke="var(--green)" stroke-width="5" data-a="pop" data-in="${A('filter')}"/>
   ${[675,690,705,720].map(x=>`<line x1="${x}" y1="318" x2="${x}" y2="512" stroke="var(--green)" stroke-width="3" opacity=".6"/>`).join('')}
   ${txt(610,420,lb.filter,'var(--green)','end',26,800)}</g>
  <g data-in="${A('effluent')}"><path d="M740 340 L880 340" stroke="#eab308" stroke-width="8" fill="none" data-a="draw" data-in="${A('effluent')}"/>
   <rect x="880" y="290" width="66" height="110" rx="14" fill="rgba(234,179,8,.15)" stroke="#eab308" stroke-width="4"/>
   <rect x="888" y="340" width="50" height="52" rx="8" fill="#eab308" opacity=".45"/>
   ${txt(913,276,lb.effluent,'#eab308','middle',22)}${s.dose_t?txt(913,428,s.dose_t,'#eab308','middle',18,600):''}</g>
  <g data-in="${A('return')}"><path d="M700 530 L700 590 L200 590 L200 360 L160 360" stroke="var(--blue)" stroke-width="12" fill="none" stroke-linejoin="round" data-a="draw" data-in="${A('return')}"/>
   ${txt(300,628,lb.ret,'var(--blue)','middle',22)}</g>
  <g data-in="${A('calcium')}" data-a="pop"><rect x="385" y="440" width="70" height="90" rx="14" fill="rgba(34,211,238,.15)" stroke="var(--teal)" stroke-width="4"/>
   <rect x="393" y="470" width="54" height="52" rx="8" fill="var(--teal)" opacity=".5"/>
   <line x1="420" y1="530" x2="420" y2="582" stroke="var(--teal)" stroke-width="4" stroke-dasharray="8 8"/>
   ${txt(420,425,lb.calcium,'var(--teal)','middle',26,800)}${drop(420,535,580,'var(--teal)','calcium')}</g>
  <g data-in="${A('ica')}" data-a="pop"><circle cx="700" cy="560" r="12" fill="var(--amber)"/><line x1="712" y1="556" x2="752" y2="522" stroke="var(--amber)" stroke-width="3"/>
   <rect x="752" y="474" width="206" height="96" rx="16" fill="rgba(0,0,0,.35)" stroke="var(--amber)" stroke-width="3"/>
   ${(s.ica_t||'Ca ion sau quả lọc|0,25–0,35 mmol/L').split('|').map((t,i)=>txt(855,506+i*36,t,'var(--amber)','middle',i?22:18,i?800:600)).join('')}</g>
  <g class="cflow" data-in="${at(s.flow_at??0)}"></g><g data-in="${A('access')}">${dots('s1',4,170)}</g><g data-in="${A('filter')}">${dots('s2',4,170)}</g><g data-in="${A('return')}">${dots('s2b',3,170)}${dots('s3',6,170)}</g><g data-in="${A('effluent')}">${dots('s4',3,90)}</g>
 </svg>`;
 const N=s.notes||[];
 return `<div style="display:flex;gap:30px;align-items:flex-start;height:100%">
  <div style="flex:0 0 ${W}px;position:relative">${svg}</div>
  ${N.length?`<div style="flex:1;display:flex;flex-direction:column;gap:16px;max-width:${s.notes_w||440}px">${N.map(x=>`
   <div class="card ${C(x.c)}" style="padding:16px 22px" data-in="${at(x.at)}" data-a="left" data-hl="${at(x.at)}${x.hl?','+x.hl:''}">
    ${x.tag?`<div><span class="tagc ${C(x.c)}">${esc(x.tag)}</span></div>`:''}
    <div style="font-size:27px;font-weight:700;line-height:1.35;margin-top:6px">${esc(x.t)}</div>
    ${x.d?`<div style="font-size:23px;opacity:.85;line-height:1.35;margin-top:4px">${esc(x.d)}</div>`:''}</div>`).join('')}</div>`:''}</div>`;};

const _tick=window.COMMON_TICK;
window.COMMON_TICK=(t,cur,S)=>{_tick&&_tick(t,cur,S);const sc=S[cur];if(!sc)return;const root=sc.el;const fl=root.querySelector('.cflow');if(!fl)return;
 const lt=t-sc.sc.start;const tin=v=>{const it=sc.items.find(i=>i.e===v);return it?it.tin:0;};
 const go=lt-tin(fl);
 root.querySelectorAll('.cdot').forEach(d=>{const p=document.getElementById(d.dataset.seg);if(!p)return;
   const g=d.parentNode.closest&&d.parentNode.closest('g[data-in]');const gg=g&&g!==root?lt-tin(g):go;
   if(go<0||gg<0){d.style.opacity=0;return;}
   const L0=p.getTotalLength();const pos=((go*+d.dataset.sp)/L0+ +d.dataset.off)%1;const q=p.getPointAtLength(pos*L0);
   d.setAttribute('cx',q.x);d.setAttribute('cy',q.y);d.style.opacity=Math.min(1,go*2);});
 root.querySelectorAll('.cdrop').forEach(d=>{const g=d.closest('g[data-in]');const g0=(g?lt-tin(g):lt)-0.6;
   if(g0<0){d.style.opacity=0;return;}const f=(g0*0.9+ +d.dataset.off)%1;
   d.setAttribute('cx',d.dataset.x);d.setAttribute('cy',+d.dataset.y1+(+d.dataset.y2-+d.dataset.y1)*f);d.style.opacity=f<0.85?0.95:0;});
 root.querySelectorAll('.crotor').forEach(r=>{const a=go>0?go*240:0;r.setAttribute('transform',`rotate(${a%360} ${r.dataset.cx} ${r.dataset.cy})`);});};
})();
