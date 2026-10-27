/* ARDS: alveolus (phế nang – mao mạch, tổn thương từng bước) · babylung (phổi em bé trên lát cắt ngang, VILI) · title art 'ards' */
(()=>{
const COL={teal:'#22d3ee',coral:'#f472b6',amber:'#fb923c',green:'#a3e635',blue:'#818cf8',violet:'#c084fc',red:'#f87171'};
const MK=`${['amber','green'].map(c=>`<marker id="ah-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--${c})"/></marker>`).join('')}`;
const cv=c=>`var(--${c||'teal'})`;
const num=(n,x,y,c,a)=>`<g data-in="${a}" data-a="pop" class="anum"><circle cx="${x}" cy="${y}" r="24" fill="#0b0a22" stroke="${cv(c)}" stroke-width="4"/><text x="${x}" y="${y+9}" text-anchor="middle" font-size="26" font-weight="800" fill="${cv(c)}">${n}</text></g>`;
const side=(s,list)=>list.length?`<div class="alvn" style="width:${s.notes_w||600}px">${list.map((x,i)=>`
  <div class="card alc ${C(x.c)}" data-in="${at(x.at)}" data-a="left" data-hl="${at(x.at)}${x.hl?','+x.hl:''}">
   <div class="alh">${x.n?`<span class="aln" style="border-color:${cv(x.c)};color:${cv(x.c)}">${x.n}</span>`:''}<span class="alt">${esc(x.t)}</span></div>
   ${x.d?`<div class="ald">${esc(x.d)}</div>`:''}</div>`).join('')}</div>`:'';

/* ---------- PHẾ NANG – MAO MẠCH ---------- */
const RBC=[130,250,370,490,610,730,850,970];
const ALV_NUM={endo:[300,470],epi:[640,395],edema:[200,330],neut:[455,575],cyto:[790,185],hyaline:[105,190],surf:[560,60],thromb:[985,640]};
L.alveolus=s=>{const st={};(s.base||[]).forEach(k=>{st[k]={k,at:0,n:null};});(s.steps||[]).forEach((x,i)=>{st[x.k]={...x,n:i+1};});
 const A=k=>st[k]?at(st[k].at):null;
 const lab=s.labels_at!=null?at(s.labels_at):null;
 let g=`<defs>${MK}<radialGradient id="alvair" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="rgba(34,211,238,.10)"/><stop offset="1" stop-color="rgba(34,211,238,.02)"/></radialGradient>
  <linearGradient id="edm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(129,140,248,.30)"/><stop offset="1" stop-color="rgba(129,140,248,.45)"/></linearGradient></defs>
  <rect x="60" y="40" width="980" height="390" rx="80" fill="url(#alvair)"/>
  <rect x="40" y="440" width="1020" height="50" rx="20" fill="rgba(251,146,60,.06)"/>
  <rect x="40" y="500" width="1020" height="150" rx="75" fill="rgba(244,114,182,.07)"/>
  ${RBC.map((x,i)=>`<ellipse cx="${x}" cy="${575+(i%2?14:-12)}" rx="36" ry="19" fill="rgba(248,113,113,.55)" stroke="#f87171" stroke-width="3"/>`).join('')}
  <rect x="40" y="500" width="1020" height="150" rx="75" fill="none" stroke="#f9a8d4" stroke-width="8" opacity=".85"/>
  <rect x="60" y="40" width="980" height="390" rx="80" fill="none" stroke="#67e8f9" stroke-width="9" opacity=".9"/>
  <g data-dim="${A('surf')??'9999'}"><rect x="76" y="56" width="948" height="358" rx="66" fill="none" stroke="#a3e635" stroke-width="3" stroke-dasharray="14 8" opacity=".9"/></g>
  <g><rect x="100" y="388" width="88" height="50" rx="18" fill="rgba(34,211,238,.18)" stroke="#67e8f9" stroke-width="4"/>
   ${[118,138,158,172].map((x,i)=>`<circle cx="${x}" cy="${410+(i%2?8:0)}" r="5" fill="#a3e635"/>`).join('')}
   <rect x="930" y="32" width="88" height="50" rx="18" fill="rgba(34,211,238,.18)" stroke="#67e8f9" stroke-width="4"/>
   ${[948,968,988,1002].map((x,i)=>`<circle cx="${x}" cy="${52+(i%2?8:0)}" r="5" fill="#a3e635"/>`).join('')}</g>
  <g><path d="M850 190 C840 150 880 125 915 140 C950 120 990 150 975 190 C990 225 950 250 915 238 C880 255 840 230 850 190 Z" fill="rgba(251,146,60,.18)" stroke="#fb923c" stroke-width="4"/><circle cx="912" cy="190" r="16" fill="rgba(251,146,60,.6)"/></g>`;
 if(lab) g+=`<g data-in="${lab}" class="albl">
   <text x="550" y="215" text-anchor="middle" font-size="34" fill="#67e8f9" font-weight="800">PHẾ NANG (KHÍ)</text>
   <text x="980" y="473" text-anchor="middle" font-size="22" fill="#fdba74">mô kẽ</text>
   <text x="550" y="630" text-anchor="middle" font-size="26" fill="#f9a8d4" font-weight="700">MAO MẠCH · hồng cầu</text>
   <text x="210" y="380" font-size="22" fill="#a5f3fc">TB type II (sản xuất surfactant)</text>
   <text x="560" y="408" font-size="22" fill="#a5f3fc" text-anchor="middle">TB type I (mỏng, trao đổi khí)</text>
   <text x="300" y="100" font-size="22" fill="#d9f99d">lớp surfactant</text>
   <text x="912" y="285" font-size="22" fill="#fdba74" text-anchor="middle">đại thực bào phế nang</text></g>`;
 if(st.endo) g+=`<g data-in="${A('endo')}">${[300,620,860].map(x=>`<rect x="${x-16}" y="494" width="32" height="14" fill="#0a0820"/>
   <path d="M${x} 505 V455" stroke="#fb923c" stroke-width="4" marker-end="url(#ah-amber)"/>`).join('')}
   ${[[285,470],[315,462],[630,468],[610,478],[870,466],[850,476]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#fb923c"/>`).join('')}</g>`;
 if(st.epi) g+=`<g data-in="${A('epi')}">${[330,640].map(x=>`<rect x="${x-26}" y="422" width="52" height="16" fill="#0a0820"/>
   <path d="M${x-40} 405 l18 -10 M${x+18} 398 l20 8" stroke="#67e8f9" stroke-width="7" stroke-linecap="round" opacity=".8"/>`).join('')}</g>`;
 if(st.edema) g+=`<g data-in="${A('edema')}"><path d="M70 262 Q180 248 290 262 T510 262 T730 262 T950 262 L1030 262 V350 Q1030 420 960 420 H140 Q70 420 70 350 Z" fill="url(#edm)" stroke="#818cf8" stroke-width="3"/>
   ${[[150,300],[240,350],[330,290],[420,385],[520,320],[600,365],[700,300],[790,380],[880,330],[980,370],[260,400],[760,320]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#fb923c" opacity=".9"/>`).join('')}</g>`;
 if(st.hyaline) g+=`<g data-in="${A('hyaline')}"><path d="M82 255 V140 Q82 62 160 62 H560" fill="none" stroke="#f472b6" stroke-width="16" stroke-linecap="round" opacity=".85"/>
   <path d="M1018 255 V150" fill="none" stroke="#f472b6" stroke-width="16" stroke-linecap="round" opacity=".85"/></g>`;
 if(st.neut){const N=(x,y)=>`<circle cx="${x}" cy="${y}" r="27" fill="rgba(192,132,252,.25)" stroke="#c084fc" stroke-width="4"/>
   <circle cx="${x-9}" cy="${y-6}" r="7" fill="#c084fc"/><circle cx="${x+8}" cy="${y-4}" r="7" fill="#c084fc"/><circle cx="${x}" cy="${y+9}" r="7" fill="#c084fc"/>`;
  g+=`<g data-in="${A('neut')}">${N(300,540)}${N(620,512)}${N(470,330)}${N(700,240)}
   ${[[470,330],[700,240]].map(([x,y])=>[[-46,-30],[46,-26],[-40,34],[44,30]].map(([dx,dy])=>`<path d="M${x+dx*0.7} ${y+dy*0.7} l${dx*0.45} ${dy*0.45}" stroke="#fb923c" stroke-width="4" stroke-linecap="round"/>`).join('')).join('')}
   <path d="M730 270 q20 25 0 50 t0 50 M750 250 q30 20 50 0 t50 0" fill="none" stroke="#e9d5ff" stroke-width="3" stroke-dasharray="4 5"/></g>`;}
 if(st.cyto) g+=`<g data-in="${A('cyto')}">${[[800,120],[1000,120],[790,250],[1010,255],[905,95]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#fbbf24"/>`).join('')}
   <text x="870" y="112" text-anchor="middle" font-size="22" fill="#fbbf24" font-weight="700">TNF-α · IL-1β · IL-6 · IL-8</text></g>`;
 if(st.surf) g+=`<g data-in="${A('surf')}"><path d="M560 56 H900 M1024 120 V230" stroke="#0a0820" stroke-width="6" stroke-dasharray="30 18"/>
   ${[[640,56],[780,56],[1024,170]].map(([x,y])=>`<path d="M${x-9} ${y-9} l18 18 M${x+9} ${y-9} l-18 18" stroke="#f87171" stroke-width="4"/>`).join('')}</g>`;
 if(st.thromb) g+=`<g data-in="${A('thromb')}"><path d="M940 545 C960 520 1010 525 1020 560 C1035 600 1000 630 965 620 C935 612 925 570 940 545 Z" fill="rgba(127,29,29,.85)" stroke="#f87171" stroke-width="3"/>
   <path d="M935 560 L1025 600 M950 620 L1010 530 M930 590 L1030 570" stroke="#fbbf24" stroke-width="2" opacity=".8"/></g>`;
 for(const k in st){const p=ALV_NUM[k]; if(p&&st[k].n) g+=num(st[k].n,p[0],p[1],st[k].c||'coral',A(k));}
 const notes=(s.steps||[]).map((x,i)=>({...x,n:i+1})).concat((s.notes||[]));
 return `<div class="alw"><div class="alfig" style="width:${notes.length?1776-(s.notes_w||600)-28:1776}px"><svg viewBox="0 0 1100 692" width="100%" height="${s.h||692}" class="alsvg">${g}</svg>
  ${s.cap?`<div class="alcap" data-in="${at(s.cap_at??0)}">${esc(s.cap)}</div>`:''}</div>${side(s,notes)}</div>`;};

/* ---------- PHỔI EM BÉ (lát cắt ngang, nằm ngửa) ---------- */
L.babylung=s=>{const Z=s.zones||{},a=k=>Z[k]!=null?at(Z[k]):null;
 const lung=(cx,flip)=>{const d=flip?-1:1;
   return `M${cx} 120 C${cx+d*190} 105 ${cx+d*270} 210 ${cx+d*265} 360 C${cx+d*262} 470 ${cx+d*200} 560 ${cx+d*60} 565 C${cx-d*20} 566 ${cx-d*30} 520 ${cx-d*35} 470 C${cx-d*40} 360 ${cx-d*45} 230 ${cx} 120 Z`;};
 const L1=lung(250,0),L2=lung(850,1);
 let g=`<defs>${MK}<clipPath id="blc"><path d="${L1}"/><path d="${L2}"/></clipPath>
  <linearGradient id="blg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="#1e293b"/></linearGradient></defs>
  <ellipse cx="550" cy="345" rx="520" ry="300" fill="rgba(148,163,184,.08)" stroke="rgba(148,163,184,.5)" stroke-width="5"/>
  <path d="${L1}" fill="url(#blg)" stroke="#94a3b8" stroke-width="4"/><path d="${L2}" fill="url(#blg)" stroke="#94a3b8" stroke-width="4"/>
  <ellipse cx="550" cy="300" rx="70" ry="85" fill="rgba(244,114,182,.15)" stroke="rgba(244,114,182,.5)" stroke-width="3"/>
  <ellipse cx="550" cy="600" rx="45" ry="35" fill="rgba(148,163,184,.25)" stroke="#94a3b8" stroke-width="3"/>
  <text x="550" y="40" text-anchor="middle" font-size="24" fill="#94a3b8" font-weight="700">TRƯỚC (không phụ thuộc)</text>
  <text x="550" y="680" text-anchor="middle" font-size="24" fill="#94a3b8" font-weight="700">LƯNG (phụ thuộc trọng lực) · nằm ngửa</text>`;
 const band=(y0,y1,fill,k,lb,col)=>a(k)?`<g data-in="${a(k)}"><rect x="0" y="${y0}" width="1100" height="${y1-y0}" fill="${fill}" clip-path="url(#blc)"/>
   <rect x="1100" y="${(y0+y1)/2-22}" width="16" height="44" rx="6" fill="${col}"/><text x="1128" y="${(y0+y1)/2+9}" font-size="25" font-weight="800" fill="${col}">${lb}</text></g>`:'';
 g+=band(110,300,'rgba(34,211,238,.28)','aer','Thông khí tốt','#22d3ee');
 g+=band(300,430,'rgba(251,146,60,.30)','poor','Kính mờ','#fb923c');
 g+=band(430,570,'rgba(241,245,249,.55)','cons','Đông đặc, xẹp','#f1f5f9');
 if(a('baby')) g+=`<g data-in="${a('baby')}"><path d="M95 300 H405 M695 300 H1005" stroke="#22d3ee" stroke-width="5" stroke-dasharray="12 8"/>
   <rect x="330" y="150" width="440" height="60" rx="30" fill="#0b0a22" stroke="#22d3ee" stroke-width="4"/>
   <text x="550" y="190" text-anchor="middle" font-size="30" font-weight="800" fill="#22d3ee">“PHỔI EM BÉ”</text></g>`;
 if(a('vt')) g+=`<g data-in="${a('vt')}"><path d="M550 70 V110 M550 110 C450 120 330 150 260 205 M550 110 C650 120 770 150 840 205" fill="none" stroke="#a3e635" stroke-width="7" marker-end="url(#ah-green)"/>
   <text x="575" y="95" font-size="26" font-weight="800" fill="#a3e635">Vt</text>
   <g data-breath="1">${[[230,190],[300,160],[820,165],[880,200],[180,250],[930,255]].map(([x,y])=>`<path d="M${x-12} ${y-12} l24 24 M${x+12} ${y-12} l-24 24" stroke="#f472b6" stroke-width="4"/>`).join('')}</g></g>`;
 if(a('atel')) g+=`<g data-in="${a('atel')}" data-flick="1">${[150,250,350,750,850,950].map(x=>`<circle cx="${x}" cy="432" r="12" fill="none" stroke="#fbbf24" stroke-width="4"/>`).join('')}</g>`;
 if(a('prone')) g+=`<g data-in="${a('prone')}"><rect x="360" y="235" width="380" height="56" rx="28" fill="#0b0a22" stroke="#a3e635" stroke-width="3"/><text x="550" y="272" text-anchor="middle" font-size="24" font-weight="700" fill="#a3e635">${esc(s.prone_t||'')}</text></g>`;
 const notes=s.notes||[];
 return `<div class="alw"><div class="alfig" style="width:${notes.length?1776-(s.notes_w||600)-28:1776}px"><svg viewBox="0 0 1300 692" width="100%" height="${s.h||692}" class="alsvg">${g}</svg>
  ${s.cap?`<div class="alcap" data-in="${at(s.cap_at??0)}">${esc(s.cap)}</div>`:''}</div>${side(s,notes)}</div>`;};

/* ---------- title art 'ards': phổi + phế nang ---------- */
const _t=L.title;
L.title=s=>{if(s.art!=='ards') return _t(s);
 return _t({...s,art:'none'}).replace(/<svg[\s\S]*?<\/svg>/,`<svg style="position:absolute;right:10px;top:120px" width="720" height="600" viewBox="0 0 720 600">
  <path d="M360 60 V230 M360 230 C330 250 300 262 280 282 M360 230 C390 250 420 262 440 282" fill="none" stroke="rgba(148,163,184,.7)" stroke-width="12" stroke-linecap="round" data-a="draw" data-in="0.3"/>
  <path d="M310 110 C230 100 150 190 135 300 C120 410 150 500 225 510 C295 520 330 460 334 380 C338 300 340 180 310 110 Z" fill="rgba(34,211,238,.08)" stroke="rgba(34,211,238,.8)" stroke-width="4" data-a="draw" data-in="0.5"/>
  <path d="M410 110 C490 100 570 190 585 300 C600 410 570 500 495 510 C425 520 390 460 386 380 C382 300 380 180 410 110 Z" fill="rgba(34,211,238,.08)" stroke="rgba(34,211,238,.8)" stroke-width="4" data-a="draw" data-in="0.7"/>
  <path d="M150 400 C200 380 280 390 334 400 L330 470 C300 515 230 525 190 505 C160 485 145 450 150 400 Z M570 400 C520 380 440 390 386 400 L390 470 C420 515 490 525 530 505 C560 485 575 450 570 400 Z" fill="rgba(244,114,182,.35)" data-in="1.1"/>
  ${[[200,250],[260,320],[230,180],[470,250],[520,320],[490,180]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="20" fill="none" stroke="rgba(163,230,53,.8)" stroke-width="4" data-a="draw" data-in="${1.3+i*0.1}"/>`).join('')}
  <path d="M0 560 H170 L195 530 L220 560 H500 L525 530 L550 560 H720" fill="none" stroke="rgba(192,132,252,.85)" stroke-width="5" stroke-linecap="round" data-a="draw" data-in="1.6"/></svg>`);};

const _tick=window.COMMON_TICK;
window.COMMON_TICK=(t,cur,S)=>{_tick&&_tick(t,cur,S);const sc=S[cur];if(!sc)return;const lt=t-sc.sc.start;
 sc.el.querySelectorAll('[data-breath]').forEach(e=>{const p=0.5-0.5*Math.cos(lt*2*Math.PI/4);e.style.opacity=0.25+0.75*p;});
 sc.el.querySelectorAll('[data-flick]').forEach(e=>{if(+getComputedStyle(e).opacity<0.05&&e.dataset.on!=='1')return;e.dataset.on='1';const p=0.5-0.5*Math.cos(lt*2*Math.PI/4);e.querySelectorAll('circle').forEach(c=>c.setAttribute('r',4+10*(1-p)));});};
})();
