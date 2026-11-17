/* LỌC MÁU LIÊN TỤC: màn hình máy CRRT mô phỏng.
   Layout crrt: mạch ngoài cơ thể động (bơm máu quay, hạt máu chạy theo Qb), các dòng dịch theo phương thức,
   bảng số (Qb, Qef, liều, FF, hệ số pha loãng, UFnet) và 6 áp lực; đồ thị xu hướng áp lực theo giờ (tua nhanh).
   Số liệu dòng dịch tính đúng công thức (Teixeira, AJKD Core Curriculum 2025, Bảng 5):
     Qp = Qb·60·(1−Hct); UF toàn phần = Qr trước + Qr sau + UFnet; FF = UF toàn phần /(Qp + Qr trước);
     Qef = Qd + Qr trước + Qr sau + UFnet; hệ số pha loãng = Qp/(Qp + Qr trước); liều = Qef/cân nặng.
   Áp lực: MÔ HÌNH THUỶ LỰC MINH HOẠ (không phải số liệu bệnh nhân):
     P truy cập = −(8 + Qb·Ra); P trả về = 8 + Qb·Rr; ΔP = Qb·0,25/(1−0,8·kĐông)²; P trước màng = P trả về + ΔP;
     TMP = (30 + UF toàn phần/40)/(1 − 0,85·kĐông − 0,6·kProtein); P dịch thải = (P trước + P trả về)/2 − TMP.
     kĐông(h) = 1 − exp(−h/τ), τ = τ0·exp(−8·(FF−0,20))·hệ số chống đông (không: 0,5; heparin: 1; citrate: 1,8).
   Trường: crrt{mode, qb, hct, qd, qrpre, qrpost, uf, wt, ac:'none'|'heparin'|'citrate', Ra, Rr, tau0, prot, h0},
     changes[{at,set,label,c,hold}], trend{at, speed (giờ/giây), hmax, keys[]}, nums[], press[], alarm{}, notes[] */
const CDEF={mode:'CVVHDF',qb:150,hct:30,qd:0,qrpre:0,qrpost:0,uf:0,wt:70,ac:'heparin',Ra:0.45,Rr:0.4,tau0:30,prot:0,h0:0,kink:0};
const CSIM={};
function crrtCalc(p,h){
  p={...CDEF,...p};
  const qd=p.mode==='CVVH'||p.mode==='SCUF'?0:p.qd, qrpre=p.mode==='CVVHD'||p.mode==='SCUF'?0:p.qrpre, qrpost=p.mode==='CVVHD'||p.mode==='SCUF'?0:p.qrpost;
  const Qp=p.qb*60*(1-p.hct/100), uft=qrpre+qrpost+p.uf, ff=uft/(Qp+qrpre), qef=qd+qrpre+qrpost+p.uf, dil=Qp/(Qp+qrpre);
  const acf={none:0.5,heparin:1,citrate:1.8}[p.ac]||1, tau=p.tau0*Math.min(2.5,Math.exp(-8*(ff-0.20)))*acf;
  const hh=Math.max(0,(h??0)+p.h0), k=1-Math.exp(-hh/tau);
  const Ra=p.Ra*(1+p.kink), pacc=-(8+p.qb*Ra), pret=8+p.qb*p.Rr, dp=p.qb*0.25/Math.pow(1-0.8*k,2), ppre=pret+dp;
  const tmp=(30+uft/40)/Math.max(0.05,1-0.85*k-0.6*p.prot), peff=(ppre+pret)/2-tmp;
  // tuổi thọ màng mô hình: giờ đến khi TMP > 250
  const life=(()=>{const T0=30+uft/40;const kk=(1-0.6*p.prot-T0/250)/0.85;return kk<=0?0:-tau*Math.log(1-Math.min(0.999,kk));})();
  return {...p,qd,qrpre,qrpost,Qp,uft,ff,qef,dil,dose:qef/p.wt,doseC:qef*dil/p.wt,tau,k,h:hh,pacc,pret,dp,ppre,tmp,peff,life};
}
function crrtSegs(s){const segs=[{t:-1e9,p:{...CDEF,...(s.crrt||{})}}];
  (s.changes||[]).forEach(c=>segs.push({t:parseT(at(c.at),s),set:c.set}));segs.sort((a,b)=>a.t-b.t);
  for(let i=1;i<segs.length;i++) segs[i].p={...segs[i-1].p,...segs[i].set};return segs;}
const cP=(segs,t)=>{let p=segs[0].p;for(const g of segs) if(g.t<=t) p=g.p;return p;};

const CNUM={qb:['Qb','mL/ph'],qef:['Dịch thải Qef','mL/h'],dose:['Liều kê','mL/kg/h'],doseC:['Liều sau pha loãng','mL/kg/h'],ff:['Phân suất lọc FF','%'],
  dil:['Hệ số pha loãng','',],uf:['UFnet','mL/h'],uft:['UF toàn phần','mL/h'],life:['Tuổi thọ màng (mô hình)','giờ'],h:['Thời gian chạy','giờ']};
const CPRS={pacc:['Truy cập','mmHg'],ppre:['Trước màng','mmHg'],pret:['Trả về','mmHg'],peff:['Dịch thải','mmHg'],tmp:['TMP','mmHg'],dp:['ΔP màng','mmHg']};
const CAL={pacc:-150,ppre:250,pret:150,tmp:250,dp:150,ff:25};
const fmtN=(k,v)=>k==='ff'?(v*100).toFixed(1).replace('.',','):k==='dil'?v.toFixed(2).replace('.',','):k==='dose'||k==='doseC'?v.toFixed(1).replace('.',','):k==='life'?(v>72?'>72':Math.round(v)):Math.round(v);

/* ---------- hình mạch ---------- */
const CPATH={
 acc:'M150 280 L330 280 L560 280 L760 280 L760 300',
 ret:'M760 540 L760 600 L620 600 L470 600 L330 600 L200 600 L200 380 L150 380',
 dia:'M1040 560 L880 560 L880 520 L800 520',
 eff:'M800 300 L880 300 L880 210 L1040 210',
 pre:'M600 132 L600 272', post:'M600 562 L600 592', cit:'M440 132 L440 272', ca:'M330 562 L330 592'};
function crrtSvg(s,id){
 const lab=(x,y,t,c,anc='middle',sz=22,w=800)=>`<text x="${x}" y="${y}" text-anchor="${anc}" font-size="${sz}" font-weight="${w}" fill="${c}" font-family="Inter">${t}</text>`;
 const bag=(x,y,c,t,key)=>`<g id="${id}-${key}"><rect x="${x-34}" y="${y}" width="68" height="92" rx="14" fill="color-mix(in srgb,${c} 16%,transparent)" stroke="${c}" stroke-width="4"/><rect x="${x-26}" y="${y+34}" width="52" height="50" rx="8" fill="${c}" opacity=".5"/>${lab(x,y-12,t,c,'middle',21)}</g>`;
 const sensor=(x,y,k,dx=0,dy=-30)=>`<g id="${id}-s-${k}"><circle cx="${x}" cy="${y}" r="12" fill="#030a12" stroke="var(--blue)" stroke-width="4"/><text id="${id}-sv-${k}" x="${x+dx}" y="${y+dy}" text-anchor="middle" font-size="20" font-weight="800" font-family="Inter" fill="var(--blue)" paint-order="stroke" stroke="#030a12" stroke-width="6"></text></g>`;
 const fib=[728,742,756,770,784,798].map(x=>`<line x1="${x-4}" y1="318" x2="${x-4}" y2="522" stroke="var(--rose)" stroke-width="5" opacity=".55"/>`).join('');
 return `<svg viewBox="0 0 1150 640" width="1150" height="640" style="overflow:visible">
  ${Object.entries(CPATH).map(([k,d])=>`<path id="${id}-p-${k}" d="${d}" fill="none" stroke="none"/>`).join('')}
  <g><rect x="18" y="230" width="132" height="200" rx="26" fill="rgba(255,255,255,.04)" stroke="var(--violet)" stroke-width="4"/>
   <circle cx="84" cy="285" r="26" fill="none" stroke="var(--violet)" stroke-width="4"/><path d="M44 368 Q84 320 124 368" fill="none" stroke="var(--violet)" stroke-width="4"/>${lab(84,412,'NGƯỜI BỆNH','var(--violet)','middle',18)}</g>
  <path d="${CPATH.acc}" stroke="var(--coral)" stroke-width="12" fill="none" stroke-linejoin="round"/>
  <path d="${CPATH.ret}" stroke="var(--blue)" stroke-width="12" fill="none" stroke-linejoin="round"/>
  ${lab(210,318,'Đường ra','var(--coral)','middle',19,700)}${lab(330,632,'Đường về (nòng xanh)','var(--blue)','middle',19,700)}
  <g><circle cx="330" cy="280" r="50" fill="rgba(0,0,0,.35)" stroke="var(--teal)" stroke-width="6"/>
   <g id="${id}-rotor"><line x1="294" y1="280" x2="366" y2="280" stroke="var(--teal)" stroke-width="8" stroke-linecap="round"/><circle cx="294" cy="280" r="9" fill="var(--teal)"/><circle cx="366" cy="280" r="9" fill="var(--teal)"/></g>
   ${lab(330,358,'Bơm máu','var(--teal)','middle',21)}</g>
  <g id="${id}-g-cit">${bag(440,40,'var(--amber)','Citrate','bc')}<path d="${CPATH.cit}" stroke="var(--amber)" stroke-width="4" stroke-dasharray="8 8" fill="none"/></g>
  <g id="${id}-g-pre">${bag(600,40,'var(--green)','Thay thế trước màng','bp')}<path d="${CPATH.pre}" stroke="var(--green)" stroke-width="5" fill="none"/></g>
  <g><rect x="712" y="300" width="96" height="240" rx="34" fill="rgba(255,255,255,.04)" stroke="var(--green)" stroke-width="5"/>${fib}
   <rect id="${id}-clot" x="716" y="304" width="88" height="0" rx="30" fill="#3b0d14" opacity=".85"/>
   ${lab(828,430,'Quả lọc','var(--green)','start',23)}</g>
  <g id="${id}-g-dia">${bag(1080,470,'var(--teal)','Dịch thẩm tách','bd')}<path d="${CPATH.dia}" stroke="var(--teal)" stroke-width="6" fill="none" stroke-linejoin="round"/></g>
  <g>${bag(1080,120,'#eab308','Dịch thải','be')}<path d="${CPATH.eff}" stroke="#eab308" stroke-width="7" fill="none" stroke-linejoin="round"/>
   <circle cx="960" cy="210" r="24" fill="rgba(0,0,0,.35)" stroke="#eab308" stroke-width="4"/>${lab(960,176,'Bơm dịch thải','#eab308','middle',17,700)}</g>
  <g id="${id}-g-post">${bag(600,470,'var(--lime)','Thay thế sau màng','bq')}<path d="${CPATH.post}" stroke="var(--lime)" stroke-width="5" fill="none"/></g>
  <g id="${id}-g-ca">${bag(330,470,'var(--teal)','Canxi','bk')}<path d="${CPATH.ca}" stroke="var(--teal)" stroke-width="4" stroke-dasharray="8 8" fill="none"/></g>
  <g><rect x="452" y="566" width="36" height="66" rx="12" fill="rgba(56,189,248,.12)" stroke="var(--blue)" stroke-width="4"/>${lab(470,552,'Bẫy khí','var(--blue)','middle',17,700)}</g>
  ${sensor(230,280,'pacc')}${sensor(690,280,'ppre',-6,-30)}${sensor(540,600,'pret',0,-28)}${sensor(880,255,'peff',46,6)}
  <g id="${id}-dots"></g>
  <text id="${id}-modelbl" x="1140" y="636" text-anchor="end" font-size="15" font-weight="700" fill="var(--dim)" font-family="Inter">Áp lực: mô hình minh hoạ</text>
 </svg>`;}
function crrtTrend(s,id){if(!s.trend) return '';return `<div class="ctrend" data-in="${at(s.trend.at)}" data-a="up"><svg id="${id}-tr" width="1130" height="150"></svg></div>`;}
L.crrt=s=>{const id='c'+s.id;const segs=crrtSegs(s);CSIM[s.id]={s,id,segs};
 const ks=s.nums||['qb','qef','dose','ff','dil','uf'], ps=s.press||['pacc','ppre','pret','peff','tmp','dp'];
 const box=(k,D,cls)=>`<div class="vnum ${cls}" id="${id}-n-${k}"><div class="vnk">${D[k][0]}</div><div class="vnv">–</div><div class="vnu">${D[k][1]}</div></div>`;
 return `<div class="card vbox cbox"><div class="vhead"><span class="vmode" id="${id}-mode"></span><span class="vset" id="${id}-set"></span><span class="vfrz" id="${id}-alm">⚠ BÁO ĐỘNG</span></div>
  ${(s.changes||[]).filter(c=>c.label).map(c=>`<div class="vtoast ${C(c.c||'amber')}" data-in="${at(c.at)}" data-a="pop" data-out="${at(c.at)}+${c.hold??4}">⚙ ${esc(c.label)}</div>`).join('')}
  <div style="position:absolute;left:14px;top:${s.trend?50:58}px;transform:scale(${s.trend?0.72:1});transform-origin:0 0">${crrtSvg(s,id)}</div>${crrtTrend(s,id)}</div>
  <div class="vside"><div class="clab2">Dòng dịch</div><div class="vnums">${ks.map(k=>box(k,CNUM,'')).join('')}</div>
   <div class="clab2">Áp lực</div><div class="vnums">${ps.map(k=>box(k,CPRS,'cpr')).join('')}</div>
   ${(s.notes||[]).map(x=>`<div class="card ${C(x.c)} vnote" data-in="${at(x.at)}" data-a="left" data-hl="${at(x.at)}"><div class="tagc ${C(x.c)}">${esc(x.tag||'')}</div><div class="vnt">${esc(x.t)}</div></div>`).join('')}</div>`;};

/* ---------- cập nhật từng khung ---------- */
function crrtTick(rec,lt){const {s,id,segs}=rec;const el=document.getElementById(id+'-mode');if(!el) return;
 const p=cP(segs,lt);const tr=s.trend;const t0=tr?parseT(at(tr.at),s):0;const h=tr?Math.max(0,Math.min(tr.hmax??72,(lt-t0)*(tr.speed||1))):0;
 const r=crrtCalc(p,h);
 const MODE={SCUF:'SCUF',CVVH:'CVVH',CVVHD:'CVVHD',CVVHDF:'CVVHDF'};
 el.textContent=MODE[r.mode]||r.mode;
 const AC={none:'Không chống đông',heparin:'Heparin',citrate:'Citrate vùng'};
 document.getElementById(id+'-set').innerHTML=[`Qb <b>${r.qb}</b>`,r.qd?`Qd <b>${r.qd}</b>`:'',r.qrpre?`Qr trước <b>${r.qrpre}</b>`:'',r.qrpost?`Qr sau <b>${r.qrpost}</b>`:'',`UFnet <b>${r.uf}</b>`,`${r.wt} kg`,AC[r.ac]].filter(Boolean).join('<i>·</i>');
 const show=(g,on)=>{const e=document.getElementById(`${id}-g-${g}`);if(e) e.style.opacity=on?1:0.12;};
 show('cit',r.ac==='citrate');show('ca',r.ac==='citrate');show('pre',r.qrpre>0);show('post',r.qrpost>0);show('dia',r.qd>0);
 const al=s.alarm||CAL;let anyAl=false;
 for(const k in {...CNUM,...CPRS}){const n=document.getElementById(`${id}-n-${k}`);if(!n) continue;const v=r[k];n.querySelector('.vnv').textContent=fmtN(k,v);
   const bad=al[k]!=null&&(k==='pacc'?v<al[k]:k==='ff'?v*100>al[k]:v>al[k]);n.classList.toggle('al',bad);if(bad&&k!=='ff') anyAl=true;}
 for(const k of ['pacc','ppre','pret','peff']){const t=document.getElementById(`${id}-sv-${k}`);if(t) t.textContent=Math.round(r[k]);
   const c=document.getElementById(`${id}-s-${k}`);if(c){const bad=al[k]!=null&&(k==='pacc'?r[k]<al[k]:r[k]>al[k]);c.querySelector('circle').setAttribute('stroke',bad?'var(--coral)':'var(--blue)');t.setAttribute('fill',bad?'var(--coral)':'var(--blue)');}}
 document.getElementById(id+'-alm').style.opacity=anyAl?1:0;
 const clot=document.getElementById(id+'-clot');if(clot){const hh=232*Math.min(1,r.k*1.15);clot.setAttribute('height',hh);clot.setAttribute('y',304+232-hh);}
 const rot=document.getElementById(id+'-rotor');if(rot) rot.setAttribute('transform',`rotate(${(lt*r.qb*1.6)%360} 330 280)`);
 // hạt chạy: tốc độ theo dòng
 const dots=document.getElementById(id+'-dots');if(dots){let html='';
  const put=(k,n,sp,c,rad)=>{const P=document.getElementById(`${id}-p-${k}`);if(!P||sp<=0) return;const L0=P.getTotalLength();
    for(let i=0;i<n;i++){const f=((lt*sp)/L0+i/n)%1;const q=P.getPointAtLength(f*L0);html+=`<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${rad}" fill="${c}"/>`;}};
  const vb=r.qb*1.1;put('acc',9,vb,r.ac==='citrate'?'#fdba74':'#fb7185',8);put('ret',10,vb,'#7dd3fc',8);
  if(r.qd>0) put('dia',4,r.qd/18,'#5eead4',6); put('eff',5,Math.max(30,r.qef/18),'#facc15',6);
  if(r.qrpre>0) put('pre',3,r.qrpre/14,'#86efac',6); if(r.qrpost>0) put('post',3,r.qrpost/14,'#bef264',6);
  if(r.ac==='citrate'){put('cit',2,60,'#fbbf24',6);put('ca',2,60,'#22d3ee',6);}
  dots.innerHTML=html;}
 if(tr){const sv=document.getElementById(id+'-tr');if(sv&&lt>=t0-0.01){const W=1130,H=150,x0=70,pw=W-x0-20,hm=tr.hmax??72,ks=tr.keys||['tmp','dp'];
   const X=v=>x0+pw*v/hm,Y=v=>H-26-(H-40)*Math.min(1,Math.max(0,v/300));const cols={tmp:'var(--amber)',dp:'var(--coral)',pacc:'var(--blue)',ppre:'var(--green)'};
   let g=`<line x1="${x0}" x2="${x0+pw}" y1="${Y(0)}" y2="${Y(0)}" stroke="rgba(148,163,184,.4)" stroke-width="2"/><line x1="${x0}" x2="${x0+pw}" y1="${Y(250)}" y2="${Y(250)}" stroke="var(--coral)" stroke-width="2" stroke-dasharray="8 8" opacity=".7"/>
     <text x="${x0-10}" y="${Y(250)+6}" text-anchor="end" font-size="16" fill="var(--coral)" font-family="Inter" font-weight="700">250</text>
     <text x="${x0-10}" y="${Y(0)+6}" text-anchor="end" font-size="16" fill="var(--dim)" font-family="Inter">0</text>`;
   for(let hh=0;hh<=hm;hh+=hm>48?12:hm>12?6:2) g+=`<text x="${X(hh)}" y="${H-4}" text-anchor="middle" font-size="15" fill="var(--dim)" font-family="Inter">${hh} giờ</text>`;
   ks.forEach(k=>{let d='';for(let hh=0;hh<=h+1e-6;hh+=hm/240){const v=crrtCalc(p,hh)[k];d+=(d?'L':'M')+X(hh).toFixed(1)+' '+Y(Math.abs(v)).toFixed(1);}
     g+=`<path d="${d}" fill="none" stroke="${cols[k]}" stroke-width="4"/><circle cx="${X(Math.min(h,hm))}" cy="${Y(Math.abs(r[k]))}" r="6" fill="${cols[k]}"/>`;});
   g+=ks.map((k,i)=>`<text x="${x0+14+i*230}" y="20" font-size="18" font-weight="800" fill="${cols[k]}" font-family="Inter">● ${CPRS[k][0]} ${Math.round(r[k])} mmHg</text>`).join('');
   sv.innerHTML=g;}}
}
/* tiêu đề: hình mạch thu nhỏ */
const _ctitle=L.title; L.title=s=>_ctitle({...s,art:'none'}).replace(/<svg[\s\S]*?<\/svg>/,`<svg style="position:absolute;right:0;top:120px" width="760" height="540" viewBox="0 0 760 540">
  <rect x="20" y="20" width="720" height="480" rx="30" fill="rgba(1,6,12,.85)" stroke="rgba(56,189,248,.4)" stroke-width="3" data-a="pop" data-in="0.3"/>
  <path d="M80 200 H380 V250" stroke="#fb7185" stroke-width="12" fill="none" data-a="draw" data-in="0.6"/>
  <rect x="340" y="250" width="80" height="170" rx="28" fill="none" stroke="#4ade80" stroke-width="6" data-a="pop" data-in="0.9"/>
  <path d="M380 420 V460 H80 V300" stroke="#38bdf8" stroke-width="12" fill="none" data-a="draw" data-in="1.1"/>
  <circle cx="200" cy="200" r="40" fill="none" stroke="#2dd4bf" stroke-width="6" data-a="pop" data-in="0.8"/>
  <path d="M420 270 H560 V160 H660" stroke="#facc15" stroke-width="7" fill="none" data-a="draw" data-in="1.3"/>
  <text x="56" y="80" font-family="Inter" font-size="26" font-weight="800" fill="#38bdf8" data-in="0.5">CVVHDF · Qb 150 · Qef 1750</text></svg>`);
const _prevC=window.THEME_TICK;
window.THEME_TICK=(t,cur,SC)=>{if(_prevC) _prevC(t,cur,SC);
 for(const k of [cur-1,cur,cur+1]){const sc=SC[k];if(!sc) continue;const rec=CSIM[sc.sc.id];if(!rec) continue;
  const lt=t-sc.sc.start;if(lt<-0.01||lt>=sc.sc.dur) continue;(rec.tick||crrtTick)(rec,lt);
  sc.el.querySelectorAll('[data-out]').forEach(e=>{const to=parseT(e.dataset.out.replace(/\+([\d.]+)$/,''),sc.sc)+parseFloat((e.dataset.out.match(/\+([\d.]+)$/)||[0,0])[1]);
   if(lt>to) e.style.opacity=Math.max(0,1-(lt-to)/0.5);});}};

/* ======================================================================
   CÁC MÔ PHỎNG BỔ SUNG (minh hoạ định tính hoặc mô hình đơn giản – lời giảng phải nói rõ)
   ====================================================================== */
const hsh=(i,k)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x);};
const segAt=(s,key)=>{const segs=[{t:-1e9,p:{...(s[key]||{})}}];(s.changes||[]).forEach(c=>segs.push({t:parseT(at(c.at),s),set:c.set}));
  segs.sort((a,b)=>a.t-b.t);for(let i=1;i<segs.length;i++) segs[i].p={...segs[i-1].p,...segs[i].set};return segs;};
const toasts=s=>(s.changes||[]).filter(c=>c.label).map(c=>`<div class="vtoast ${C(c.c||'amber')}" data-in="${at(c.at)}" data-a="pop" data-out="${at(c.at)}+${c.hold??4}">⚙ ${esc(c.label)}</div>`).join('');
const sideNotes=s=>(s.notes||[]).map(x=>`<div class="card ${C(x.c)} vnote" data-in="${at(x.at)}" data-a="left" data-hl="${at(x.at)}"><div class="tagc ${C(x.c)}">${esc(x.tag||'')}</div><div class="vnt">${esc(x.t)}</div></div>`).join('');
const numBox=(id,k,lab,u)=>`<div class="vnum" id="${id}-n-${k}"><div class="vnk">${lab}</div><div class="vnv">–</div><div class="vnu">${u}</div></div>`;
const setN=(id,k,v,bad)=>{const n=document.getElementById(`${id}-n-${k}`);if(!n) return;n.querySelector('.vnv').textContent=v;n.classList.toggle('al',!!bad);};
const vn=(x,d=1)=>Number(x).toFixed(d).replace('.',',');
const trH=(s,lt,def)=>{const tr=s.trend||def;const t0=parseT(at(tr.at),s);return {t0,h:Math.max(0,(lt-t0)*(tr.speed||1)),hm:tr.hmax};};

/* ---------- MANG: vi thể một sợi lọc ----------
   mang{mode:'none'|'diff'|'conv'|'both'|'ads', protein:0|1}. SC minh hoạ: nhỏ 1; trung bình 0,6 (0,3 khi màng thứ cấp); albumin, hồng cầu 0. */
const MK=[{k:'s',n:'Phân tử nhỏ (urê, K⁺)',r:6,c:'#2dd4bf',N:26},{k:'m',n:'Phân tử trung bình (β2-microglobulin)',r:10,c:'#a78bfa',N:12},
          {k:'a',n:'Albumin',r:15,c:'#fbbf24',N:6},{k:'r',n:'Hồng cầu',r:22,c:'#fb7185',N:5}];
const passP=(k,p)=>{const D={s:1,m:0.25,a:0,r:0},V={s:1,m:p.protein?0.3:0.6,a:0,r:0};
  return p.mode==='diff'?D[k]:p.mode==='conv'?V[k]:p.mode==='both'?Math.min(1,D[k]+V[k]):0;};
L.mang=s=>{const id='m'+s.id;CSIM[s.id]={s,id,segs:segAt(s,'mang'),tick:mangTick};
 return `<div class="card vbox cbox"><div class="vhead"><span class="vmode" id="${id}-mode"></span><span class="vset" id="${id}-set"></span></div>${toasts(s)}
  <svg width="1150" height="600" style="position:absolute;left:14px;top:72px">
   <defs><marker id="${id}-mar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#38bdf8"/></marker></defs>
   <rect x="20" y="20" width="1110" height="250" rx="22" fill="rgba(244,63,94,.07)" stroke="rgba(244,63,94,.35)" stroke-width="2"/>
   <text x="40" y="54" font-size="22" font-weight="800" fill="#fb7185" font-family="Inter">KHOANG MÁU → (trong sợi rỗng)</text>
   <rect x="20" y="330" width="1110" height="250" rx="22" fill="rgba(234,179,8,.07)" stroke="rgba(234,179,8,.35)" stroke-width="2"/>
   <text x="40" y="566" font-size="22" font-weight="800" fill="#eab308" font-family="Inter" id="${id}-low">KHOANG DỊCH</text>
   <rect x="20" y="276" width="1110" height="48" fill="rgba(74,222,128,.10)"/>
   ${Array.from({length:46},(_,i)=>`<rect x="${34+i*24}" y="282" width="12" height="36" rx="4" fill="#4ade80" opacity=".75"/>`).join('')}
   <rect id="${id}-prot" x="20" y="258" width="1110" height="20" rx="6" fill="#fbbf24" opacity="0"/>
   <text x="1120" y="306" text-anchor="end" font-size="19" font-weight="800" fill="#4ade80" font-family="Inter">MÀNG (lỗ màng)</text>
   <g id="${id}-arrow"></g><g id="${id}-pt"></g>
  </svg></div>
  <div class="vside"><div class="clab2">Hạt trên hình</div>${MK.map(m=>`<div class="mleg"><svg width="40" height="40"><circle cx="20" cy="20" r="${Math.min(16,m.r)}" fill="${m.c}"/></svg>${esc(m.n)}</div>`).join('')}
   <div class="clab2">Đi qua màng (minh hoạ)</div><div id="${id}-bars"></div>${sideNotes(s)}</div>`;};
function mangTick(rec,lt){const {id,segs}=rec;const p={mode:'none',protein:0,...cP(segs,lt)};
 const NM={none:'Chưa có lực đẩy',diff:'KHUẾCH TÁN',conv:'ĐỐI LƯU',both:'KHUẾCH TÁN + ĐỐI LƯU',ads:'HẤP PHỤ'};
 document.getElementById(id+'-mode').textContent=NM[p.mode];
 document.getElementById(id+'-set').innerHTML=p.mode==='diff'?'Chênh nồng độ – dịch thẩm tách chảy <b>ngược chiều</b>':p.mode==='conv'?'Chênh áp qua màng kéo <b>nước</b>, chất tan đi theo':p.mode==='both'?'Cả hai cơ chế (CVVHDF)':p.mode==='ads'?'Chất tan <b>bám</b> lên màng, bão hoà dần':'';
 document.getElementById(id+'-low').textContent=p.mode==='diff'||p.mode==='both'?'DỊCH THẨM TÁCH ← (ngược chiều)':'DỊCH SIÊU LỌC';
 document.getElementById(id+'-prot').setAttribute('opacity',p.protein?0.75:0);
 let h='';const W=1100;
 MK.forEach((m,mi)=>{for(let i=0;i<m.N;i++){const sp=40+hsh(i,mi)*30;let x=((hsh(i,mi+7)*W+lt*sp)%W);let y=70+hsh(i,mi+3)*170;
   if(p.mode==='ads'&&m.k==='m'&&i<Math.min(m.N,Math.floor(lt*0.6))){x=20+((i*97)%1060);y=262;}
   else{const pr=passP(m.k,p);const cyc=(lt*0.18+hsh(i,mi+11))%1;if(hsh(i,mi+5)<pr){const f=Math.min(1,cyc*2.2);y=y+f*(400-y+hsh(i,mi+9)*120);}}
   h+=m.k==='r'?`<ellipse cx="${(x+30).toFixed(1)}" cy="${y.toFixed(1)}" rx="${m.r}" ry="${m.r*0.55}" fill="${m.c}" opacity=".85"/>`:`<circle cx="${(x+30).toFixed(1)}" cy="${y.toFixed(1)}" r="${m.r}" fill="${m.c}" opacity=".95"/>`;}});
 document.getElementById(id+'-pt').innerHTML=h;
 document.getElementById(id+'-arrow').innerHTML=p.mode==='conv'||p.mode==='both'?[200,500,800].map(x=>`<path d="M${x} 200 V390" stroke="#38bdf8" stroke-width="6" marker-end="url(#${id}-mar)" opacity=".55"/>`).join(''):'';
 document.getElementById(id+'-bars').innerHTML=MK.slice(0,3).map(m=>{const v=p.mode==='ads'?(m.k==='m'?Math.max(0,0.7-lt*0.02):0):passP(m.k,p);
   return `<div class="mbar"><span>${esc(m.n.split(' (')[0])}</span><div class="mtr"><div style="width:${(v*100).toFixed(0)}%;background:${m.c}"></div></div></div>`;}).join('');}

/* ---------- CITRATE: canxi dọc mạch và toàn thân (mô hình 1 khoang) ----------
   citrate{cit (mmol/L máu), qb, qef (mL/h), met (1 bình thường; 0,25 suy giảm), ica0}. trend{at,speed,hmax}.
   Ca²⁺ sau màng = Ca²⁺ toàn thân/(1+0,944·cit); tải citrate về = cit·Qb·0,06·0,5; dC/dt=(tải − met·45·C)/15;
   Ca²⁺ toàn thân = ica0 − 0,25·max(0,C−0,4); Ca toàn phần = 1,95·Ca²⁺ + 0,8·C; bù Ca cần = Qef·1,8/1000 + 1,5·max(0,C−0,4). */
function citSim(p,hmax){const out=[];let C=0;const dt=0.02;
 for(let h=0;h<=hmax+1e-9;h+=dt){C+=dt*(p.cit*p.qb*0.06*0.5-p.met*45*C)/15;
  const ica=p.ica0-0.25*Math.max(0,C-0.4),tca=1.95*ica+0.8*C;
  out.push({h,C,ica,tca,ratio:tca/ica,post:ica/(1+0.944*p.cit),need:p.qef*1.8/1000+1.5*Math.max(0,C-0.4)});}return out;}
L.citrate=s=>{const id='k'+s.id;CSIM[s.id]={s,id,segs:segAt(s,'citrate'),tick:citTick};
 const st=(x,t,c,k)=>`<g><circle cx="${x}" cy="150" r="58" fill="#030a12" stroke="${c}" stroke-width="5"/><text x="${x}" y="150" text-anchor="middle" font-size="32" font-weight="800" fill="${c}" font-family="Inter" id="${id}-st-${k}">–</text><text x="${x}" y="176" text-anchor="middle" font-size="15" fill="var(--mut)" font-family="Inter">mmol/L</text><text x="${x}" y="240" text-anchor="middle" font-size="20" font-weight="800" fill="${c}" font-family="Inter">${t}</text></g>`;
 return `<div class="card vbox cbox"><div class="vhead"><span class="vmode">CITRATE VÙNG</span><span class="vset" id="${id}-set"></span><span class="vfrz" id="${id}-alm">⚠ TÍCH TỤ</span></div>${toasts(s)}
  <svg width="1150" height="300" style="position:absolute;left:14px;top:60px">
   <path d="M90 150 H560" stroke="#fb7185" stroke-width="10"/><path d="M560 150 H1060" stroke="#fdba74" stroke-width="10"/>
   <path d="M330 40 V140" stroke="#fbbf24" stroke-width="5" stroke-dasharray="8 8"/><text x="330" y="30" text-anchor="middle" font-size="20" font-weight="800" fill="#fbbf24" font-family="Inter">+ Citrate trước màng</text>
   <path d="M820 40 V140" stroke="#22d3ee" stroke-width="5" stroke-dasharray="8 8"/><text x="820" y="30" text-anchor="middle" font-size="20" font-weight="800" fill="#22d3ee" font-family="Inter">+ Canxi sau màng</text>
   ${st(90,'Ca²⁺ toàn thân','#38bdf8','sys')}${st(560,'Ca²⁺ sau màng','#fbbf24','post')}${st(1060,'Ca²⁺ máu về','#22d3ee','ret')}
  </svg>
  <div class="ctrend" style="height:300px;bottom:14px"><svg id="${id}-tr" width="1130" height="300"></svg></div></div>
  <div class="vside"><div class="clab2">Theo dõi (mô hình)</div><div class="vnums">${numBox(id,'cit','Liều citrate','mmol/L máu')}${numBox(id,'post','Ca²⁺ sau màng','mmol/L')}${numBox(id,'ica','Ca²⁺ toàn thân','mmol/L')}
   ${numBox(id,'tca','Ca toàn phần','mmol/L')}${numBox(id,'ratio','tCa / iCa','')}${numBox(id,'need','Bù canxi cần','mmol/h')}</div>${sideNotes(s)}</div>`;};
function citTick(rec,lt){const {s,id,segs}=rec;const p={cit:3,qb:130,qef:1750,met:1,ica0:1.15,...cP(segs,lt)};
 const {t0,h:hr,hm:hm0}=trH(s,lt,{at:0,speed:1,hmax:24});const hm=hm0??24,h=Math.min(hm,hr);
 const sim=citSim(p,hm);const r=sim[Math.min(sim.length-1,Math.round(h/0.02))];
 document.getElementById(id+'-set').innerHTML=[`Citrate <b>${vn(p.cit)}</b> mmol/L máu`,`Qb <b>${p.qb}</b>`,`Qef <b>${p.qef}</b>`,p.met<1?'<b style="color:var(--coral)">Chuyển hoá citrate giảm</b>':'Chuyển hoá bình thường',`<b>${vn(h,0)}</b> giờ`].join('<i>·</i>');
 const sd=(k,v)=>{const e=document.getElementById(`${id}-st-${k}`);if(e) e.textContent=vn(v,2);};sd('sys',r.ica);sd('post',r.post);sd('ret',r.ica);
 setN(id,'cit',vn(p.cit));setN(id,'post',vn(r.post,2),r.post>0.4||r.post<0.25);setN(id,'ica',vn(r.ica,2),r.ica<1.0);setN(id,'tca',vn(r.tca,2));setN(id,'ratio',vn(r.ratio,2),r.ratio>=2.5);setN(id,'need',vn(r.need));
 document.getElementById(id+'-alm').style.opacity=r.ratio>=2.5?1:0;
 const sv=document.getElementById(id+'-tr');if(!sv) return;if(lt<t0){sv.innerHTML='';return;}
 const x0=70,pw=1040,X=v=>x0+pw*v/hm,Y=v=>270-230*(v-1.5)/2;
 let g=`<line x1="${x0}" x2="${x0+pw}" y1="270" y2="270" stroke="rgba(148,163,184,.4)" stroke-width="2"/>`;
 for(let hh=0;hh<=hm;hh+=hm>24?12:6) g+=`<text x="${X(hh)}" y="292" text-anchor="middle" font-size="15" fill="var(--dim)" font-family="Inter">${hh} giờ</text>`;
 g+=`<line x1="${x0}" x2="${x0+pw}" y1="${Y(2.5)}" y2="${Y(2.5)}" stroke="var(--coral)" stroke-dasharray="8 8" stroke-width="2"/><text x="${x0-8}" y="${Y(2.5)+6}" text-anchor="end" font-size="16" fill="var(--coral)" font-family="Inter" font-weight="700">2,5</text>`;
 const pth=(f,c)=>{let d='';sim.forEach((o,i)=>{if(o.h>h+1e-6||i%3) return;d+=(d?'L':'M')+X(o.h).toFixed(1)+' '+Y(f(o)).toFixed(1);});return `<path d="${d}" fill="none" stroke="${c}" stroke-width="4"/>`;};
 g+=pth(o=>o.ratio,'#fb7185');
 g+=`<text x="${x0+10}" y="22" font-size="18" font-weight="800" fill="#fb7185" font-family="Inter">● tỷ số tCa/iCa theo giờ: ${vn(r.ratio,2)}</text>`;
 sv.innerHTML=g;}

/* ---------- CANBANG: cân bằng dịch theo giờ ----------
   canbang{wt, ins:[{t,v,c}] (mL/h), urine, ufm (máy rút, mL/h), down:[[giờ đầu, giờ cuối]], hours}; trend{at,speed}. */
L.canbang=s=>{const id='b'+s.id;CSIM[s.id]={s,id,segs:segAt(s,'canbang'),tick:cbTick};
 return `<div class="card vbox cbox"><div class="vhead"><span class="vmode">CÂN BẰNG DỊCH</span><span class="vset" id="${id}-set"></span></div>${toasts(s)}
  <svg id="${id}-sv" width="1150" height="610" style="position:absolute;left:14px;top:66px"></svg></div>
  <div class="vside"><div class="clab2">Cộng dồn</div><div class="vnums">${numBox(id,'in','Tổng vào','mL')}${numBox(id,'out','Tổng ra','mL')}${numBox(id,'bal','Cân bằng','mL')}
   ${numBox(id,'ufn','Rút ròng sau trừ dịch vào','mL/kg/h')}${numBox(id,'run','Máy chạy','giờ')}${numBox(id,'hr','Giờ thứ','')}</div>${sideNotes(s)}</div>`;};
function cbTick(rec,lt){const {s,id,segs}=rec;const p={wt:70,ins:[],urine:0,ufm:0,down:[],hours:24,...cP(segs,lt)};
 const {h:hr}=trH(s,lt,{at:0,speed:1});const H=p.hours,h=Math.min(H,hr);
 const inH=p.ins.reduce((a,b)=>a+b.v,0),run=x=>!p.down.some(d=>x>=d[0]&&x<d[1]);
 let cum=0,tin=0,tout=0,nrun=0,ufsum=0;const pts=[];
 for(let k=0;k<H;k++){const f=Math.max(0,Math.min(1,h-k));if(f<=0) break;const ufm=run(k+0.5)?p.ufm:0;if(ufm) nrun+=f;
  tin+=inH*f;tout+=(ufm+p.urine)*f;ufsum+=(ufm-inH)*f;cum+=(inH-ufm-p.urine)*f;pts.push({k,cum,ufm,f});}
 document.getElementById(id+'-set').innerHTML=[`Dịch vào <b>${inH}</b> mL/h`,`Máy rút <b>${p.ufm}</b> mL/h`,`Nước tiểu <b>${p.urine}</b> mL/h`,`${p.wt} kg`].join('<i>·</i>');
 setN(id,'in',Math.round(tin));setN(id,'out',Math.round(tout));setN(id,'bal',(cum>0?'+':'')+Math.round(cum),cum>0);
 setN(id,'ufn',h>0?vn(ufsum/(p.wt*h),2):'–');setN(id,'run',vn(nrun,1));setN(id,'hr',vn(h,0));
 const x0=80,pw=1040,bw=pw/H,ym=330,sc=0.42;
 let g=`<line x1="${x0}" x2="${x0+pw}" y1="${ym}" y2="${ym}" stroke="rgba(148,163,184,.5)" stroke-width="2"/>`;
 g+=`<text x="${x0}" y="24" font-size="18" font-weight="800" fill="#4ade80" font-family="Inter">▲ VÀO: ${p.ins.map(x=>esc(x.t)).join(' · ')}</text><text x="${x0}" y="606" font-size="18" font-weight="800" fill="#fb7185" font-family="Inter">▼ RA: máy rút (đỏ) · nước tiểu (tím)</text>`;
 p.down.forEach(d=>{g+=`<rect x="${x0+d[0]*bw}" y="40" width="${(d[1]-d[0])*bw}" height="520" fill="rgba(251,113,133,.08)"/><text x="${x0+(d[0]+d[1])/2*bw}" y="62" text-anchor="middle" font-size="16" fill="var(--coral)" font-family="Inter" font-weight="700">máy dừng</text>`;});
 pts.forEach(o=>{let y=ym;p.ins.forEach(x=>{const hh=x.v*sc*o.f;g+=`<rect x="${x0+o.k*bw+3}" y="${y-hh}" width="${bw-6}" height="${hh}" fill="${x.c||'#4ade80'}" opacity=".8"/>`;y-=hh;});
   let y2=ym;[[o.ufm,'#fb7185'],[p.urine,'#e879f9']].forEach(([v,c])=>{const hh=v*sc*o.f;g+=`<rect x="${x0+o.k*bw+3}" y="${y2}" width="${bw-6}" height="${hh}" fill="${c}" opacity=".8"/>`;y2+=hh;});});
 let d='';pts.forEach(o=>{d+=`L${(x0+(o.k+o.f)*bw).toFixed(1)} ${(ym-o.cum*0.06).toFixed(1)}`;});
 g+=`<path d="M${x0} ${ym}${d}" fill="none" stroke="#38bdf8" stroke-width="5"/><text x="${x0+pw}" y="24" text-anchor="end" font-size="19" font-weight="800" fill="#38bdf8" font-family="Inter">Cân bằng cộng dồn ${(cum>0?'+':'')+Math.round(cum)} mL</text>`;
 for(let k=0;k<=H;k+=6) g+=`<text x="${x0+k*bw}" y="584" text-anchor="middle" font-size="15" fill="var(--dim)" font-family="Inter">${k} giờ</text>`;
 document.getElementById(id+'-sv').innerHTML=g;}

/* ---------- LIEU: liều kê → trừ thời gian ngừng → nhân hệ số pha loãng ----------
   lieu{wt, qef (mL/h), dil, down:[[giờ đầu, giờ cuối, nhãn]]} */
L.lieu=s=>{const id='d'+s.id;CSIM[s.id]={s,id,segs:segAt(s,'lieu'),tick:lieuTick};
 return `<div class="card vbox cbox"><div class="vhead"><span class="vmode">LIỀU KÊ → LIỀU THỰC</span><span class="vset" id="${id}-set"></span></div>${toasts(s)}
  <svg id="${id}-sv" width="1150" height="610" style="position:absolute;left:14px;top:66px"></svg></div>
  <div class="vside"><div class="clab2">Trong 24 giờ</div><div class="vnums">${numBox(id,'pr','Liều kê','mL/kg/h')}${numBox(id,'run','Máy chạy','giờ')}${numBox(id,'avg','Trung bình 24 giờ','mL/kg/h')}
   ${numBox(id,'dil','Hệ số pha loãng','')}${numBox(id,'eff','Liều thực (ước tính)','mL/kg/h')}${numBox(id,'pct','Thực / kê','%')}</div>${sideNotes(s)}</div>`;};
function lieuTick(rec,lt){const {id,segs}=rec;const p={wt:70,qef:1750,dil:1,down:[],...cP(segs,lt)};
 const dn=p.down.reduce((a,d)=>a+(d[1]-d[0]),0),run=24-dn,pr=p.qef/p.wt,avg=pr*run/24,eff=avg*p.dil;
 document.getElementById(id+'-set').innerHTML=[`Qef <b>${p.qef}</b> mL/h`,`${p.wt} kg`,`Ngừng máy <b>${vn(dn,1)}</b> giờ`].join('<i>·</i>');
 setN(id,'pr',vn(pr));setN(id,'run',vn(run,1));setN(id,'avg',vn(avg));setN(id,'dil',vn(p.dil,2));setN(id,'eff',vn(eff),eff<20);setN(id,'pct',vn(100*eff/pr,0));
 const x0=60,pw=1060,bw=pw/24;let g=`<text x="${x0}" y="40" font-size="22" font-weight="800" fill="var(--tx)" font-family="Inter">Một ngày lọc máu (xanh: máy chạy · đỏ: máy dừng)</text>`;
 g+=`<rect x="${x0}" y="60" width="${pw}" height="70" rx="12" fill="rgba(74,222,128,.35)"/>`;
 p.down.forEach(d=>{g+=`<rect x="${x0+d[0]*bw}" y="60" width="${(d[1]-d[0])*bw}" height="70" fill="#fb7185"/><text x="${x0+(d[0]+d[1])/2*bw}" y="160" text-anchor="middle" font-size="16" fill="var(--coral)" font-family="Inter" font-weight="700">${esc(d[2]||'dừng')}</text>`;});
 for(let k=0;k<=24;k+=6) g+=`<text x="${x0+k*bw}" y="195" text-anchor="middle" font-size="15" fill="var(--dim)" font-family="Inter">${k} giờ</text>`;
 const bar=(y,lab,v,c)=>`<text x="${x0}" y="${y-12}" font-size="20" font-weight="800" fill="${c}" font-family="Inter">${lab}: ${vn(v)} mL/kg/h</text><rect x="${x0}" y="${y}" width="${pw*v/40}" height="44" rx="10" fill="${c}"/>`;
 g+=`<rect x="${x0+pw*20/40}" y="240" width="${pw*5/40}" height="300" fill="rgba(74,222,128,.10)" stroke="#4ade80" stroke-dasharray="6 6"/><text x="${x0+pw*22.5/40}" y="572" text-anchor="middle" font-size="17" fill="#4ade80" font-weight="800" font-family="Inter">Đích thực nhận 20–25</text>`;
 g+=bar(280,'Liều kê',pr,'#38bdf8')+bar(380,'Trừ thời gian ngừng máy',avg,'#a78bfa')+bar(480,'Nhân hệ số pha loãng',eff,eff<20?'#fb7185':'#4ade80');
 document.getElementById(id+'-sv').innerHTML=g;}

/* ---------- THUOC: nồng độ một kháng sinh GIẢ ĐỊNH (mô hình 1 khoang) ----------
   thuoc{dose (mg), tau (giờ), vd (L), cln (L/h), sc, qef (mL/h), off:[[đầu,cuối]], stop (giờ), target (mg/L), hours}; trend{at,speed}. */
L.thuoc=s=>{const id='t'+s.id;CSIM[s.id]={s,id,segs:segAt(s,'thuoc'),tick:thuocTick};
 return `<div class="card vbox cbox"><div class="vhead"><span class="vmode">NỒNG ĐỘ THUỐC (MÔ HÌNH)</span><span class="vset" id="${id}-set"></span></div>${toasts(s)}
  <svg id="${id}-sv" width="1150" height="610" style="position:absolute;left:14px;top:66px"></svg></div>
  <div class="vside"><div class="clab2">Thanh thải</div><div class="vnums">${numBox(id,'clc','Thanh thải CRRT','L/h')}${numBox(id,'cln','Thanh thải khác','L/h')}${numBox(id,'half','Bán huỷ','giờ')}
   ${numBox(id,'c','Nồng độ','mg/L')}${numBox(id,'ft','Thời gian trên ngưỡng','%')}${numBox(id,'hr','Giờ thứ','')}</div>${sideNotes(s)}</div>`;};
function thuocSim(p){const cl=hh=>p.cln+((p.stop!=null&&hh>=p.stop)||p.off.some(d=>hh>=d[0]&&hh<d[1])?0:p.sc*p.qef/1000);
 const dt=0.05,arr=[];let c=0,nd=0;for(let i=0;i*dt<=p.hours+1e-9;i++){const hh=i*dt;if(hh>=nd*p.tau-1e-9){c+=p.dose/p.vd;nd++;}arr.push({hh,c,cl:cl(hh)});c*=Math.exp(-cl(hh)/p.vd*dt);}return arr;}
function thuocTick(rec,lt){const {s,id,segs}=rec;const p={dose:1000,tau:8,vd:21,cln:1,sc:0.9,qef:1850,off:[],stop:null,target:8,hours:48,...cP(segs,lt)};
 const {h:hr}=trH(s,lt,{at:0,speed:2});const H=p.hours,h=Math.min(H,hr);const arr=thuocSim(p);const cur=arr[Math.min(arr.length-1,Math.round(h/0.05))];
 let n=0,above=0;arr.forEach(o=>{if(o.hh<=h&&o.hh>=p.tau){n++;if(o.c>=p.target) above++;}});
 document.getElementById(id+'-set').innerHTML=[`${p.dose} mg mỗi ${p.tau} giờ`,`Vd <b>${p.vd}</b> L`,`SC <b>${vn(p.sc,1)}</b>`,`Qef <b>${p.qef}</b>`].join('<i>·</i>');
 setN(id,'clc',vn(cur.cl-p.cln,2));setN(id,'cln',vn(p.cln,1));setN(id,'half',vn(0.693*p.vd/cur.cl,1));setN(id,'c',vn(cur.c,1),cur.c<p.target);setN(id,'ft',n?vn(100*above/n,0):'–',n&&above/n<0.6);setN(id,'hr',vn(h,0));
 const x0=80,pw=1040,X=v=>x0+pw*v/H,mx=Math.max(...arr.map(o=>o.c))*1.1,Y=v=>540-490*v/mx;
 let g=`<line x1="${x0}" x2="${x0+pw}" y1="540" y2="540" stroke="rgba(148,163,184,.4)" stroke-width="2"/>`;
 p.off.forEach(d=>{g+=`<rect x="${X(d[0])}" y="30" width="${X(d[1])-X(d[0])}" height="510" fill="rgba(251,113,133,.08)"/><text x="${(X(d[0])+X(d[1]))/2}" y="52" text-anchor="middle" font-size="16" fill="var(--coral)" font-weight="700" font-family="Inter">máy dừng</text>`;});
 if(p.stop!=null) g+=`<line x1="${X(p.stop)}" x2="${X(p.stop)}" y1="30" y2="540" stroke="var(--amber)" stroke-width="3" stroke-dasharray="8 8"/><text x="${X(p.stop)+8}" y="52" font-size="16" fill="var(--amber)" font-weight="800" font-family="Inter">ngừng CRRT</text>`;
 g+=`<line x1="${x0}" x2="${x0+pw}" y1="${Y(p.target)}" y2="${Y(p.target)}" stroke="#4ade80" stroke-width="2" stroke-dasharray="10 8"/><text x="${x0+8}" y="${Y(p.target)-8}" text-anchor="start" font-size="17" fill="#4ade80" font-weight="800" font-family="Inter">ngưỡng mục tiêu (giả định)</text>`;
 let d='';arr.forEach((o,i)=>{if(o.hh>h||i%2) return;d+=(d?'L':'M')+X(o.hh).toFixed(1)+' '+Y(o.c).toFixed(1);});g+=`<path d="${d}" fill="none" stroke="#a78bfa" stroke-width="5"/>`;
 for(let k=0;k<=H;k+=H>24?12:6) g+=`<text x="${X(k)}" y="566" text-anchor="middle" font-size="15" fill="var(--dim)" font-family="Inter">${k} giờ</text>`;
 document.getElementById(id+'-sv').innerHTML=g;}
