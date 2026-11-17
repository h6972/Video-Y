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
   for(let hh=0;hh<=hm;hh+=hm>48?12:6) g+=`<text x="${X(hh)}" y="${H-4}" text-anchor="middle" font-size="15" fill="var(--dim)" font-family="Inter">${hh} giờ</text>`;
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
  const lt=t-sc.sc.start;if(lt<-0.01||lt>=sc.sc.dur) continue;crrtTick(rec,lt);
  sc.el.querySelectorAll('[data-out]').forEach(e=>{const to=parseT(e.dataset.out.replace(/\+([\d.]+)$/,''),sc.sc)+parseFloat((e.dataset.out.match(/\+([\d.]+)$/)||[0,0])[1]);
   if(lt>to) e.style.opacity=Math.max(0,1-(lt-to)/0.5);});}};
