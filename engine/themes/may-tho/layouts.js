/* THỞ MÁY: mô phỏng máy thở bằng phương trình chuyển động của hệ hô hấp
   Paw + Pmus = V/C + R·Flow + PEEP  → sóng áp lực, lưu lượng, thể tích "thật" về sinh lý.
   Layout: vent (màn hình sóng + bảng số + phổi), loops (vòng P-V, F-V).
   Auto-PEEP, bất đồng bộ (gắng sức không hiệu quả, double trigger, đói lưu lượng) tự xuất hiện từ mô phỏng. */
const VDEF={mode:'VC',vt:450,rr:16,ti:1.0,pause:0.3,flow:'square',peep:5,pi:15,ps:10,R:10,Rexp:null,C:50,
  effort:0,rrp:null,tin:0.9,trig:2,cyc:25,rise:0.1,fio2:null,phase:0.35};
const VSIM={};               // kết quả mô phỏng theo id cảnh
const VWARM=30, VDT=0.004, VSTORE=5;   // chạy trước 30 s, bước 4 ms, lưu 50 Hz

function ventTime(v,s){ if(v==null||v==='') return null; return parseT(at(v),s); }

function ventSim(s){
  const spec=s.vent||{}, dur=s.dur||30;
  const segs=[{t:-1e9,p:{...VDEF,...spec}}];
  (s.changes||[]).forEach(c=>segs.push({t:ventTime(c.at,s),set:c.set}));
  segs.sort((a,b)=>a.t-b.t);
  for(let i=1;i<segs.length;i++) segs[i].p={...segs[i-1].p,...segs[i].set};
  const P_at=t=>{let p=segs[0].p;for(const g of segs) if(g.t<=t) p=g.p;return p;};
  const out={t:[],P:[],F:[],V:[],Pm:[]}, br=[], eff=[];
  let V=0, ph='exp', bp=null, b=null, tau=0, lastStart=-1e9, expStart=-VWARM, fpk=0, k=0;
  let nextEff=null, effList=[];
  const pm=(t,p)=>{ // áp lực cơ hô hấp của bệnh nhân (dương = hít vào)
    if(!(p.effort>0)) return 0; let v=0;
    for(const e of effList){const x=t-e.t0; if(x>=0&&x<=e.tin) v+=e.a*0.5*(1-Math.cos(2*Math.PI*x/e.tin));}
    return v; };
  const startBreath=(t,trig)=>{
    if(b){b.tEnd=t; b.fEnd=out.F.length?out.F[out.F.length-1]:0; br.push(b);}
    bp=P_at(t); tau=0; fpk=0; ph='insp'; lastStart=t;
    b={t0:t,trig,mode:bp.mode,peep:bp.peep,v0:V,auto:Math.max(0,V*1000/bp.C),ppeak:-1e9,tpk:t,pplat:null,vt:0,tEi:null,tEp:null};
  };
  for(let t=-VWARM;t<=dur+0.6;t+=VDT,k++){
    const p=P_at(t);
    // lịch gắng sức của bệnh nhân
    if(p.effort>0){const per=60/(p.rrp||p.rr);
      if(nextEff==null) nextEff=t+per*p.phase;
      if(t>=nextEff){effList.push({t0:nextEff,tin:p.tin,a:p.effort});eff.push({t0:nextEff,trig:false,tin:p.tin});nextEff+=per;}
      effList=effList.filter(e=>t-e.t0<=e.tin+0.1);}
    const Pm=pm(t,p); const Rex=(bp?bp.Rexp:p.Rexp)||(bp?bp.R:p.R);
    let F, Paw;               // F: L/s, V: L, C: L/cmH2O
    if(ph==='insp'||ph==='pause'){
      const q=bp, Cl=q.C/1000;
      if(q.mode==='VC'){
        if(ph==='insp'){
          F=q.flow==='decel'? (q.vt/1000)/(0.625*q.ti)*(1-0.75*tau/q.ti) : (q.vt/1000)/q.ti;
          Paw=V/Cl+q.R*F+q.peep-Pm;
          if(tau>=q.ti){ph=q.pause>0?'pause':'exp';b.tEi=t;if(ph==='exp'){b.tEp=t;expStart=t;}tau=0;}
        } else {
          F=0; Paw=V/Cl+q.peep-Pm;
          if(tau>=q.pause-0.05&&b.pplat==null) b.pplat=Paw;
          if(tau>=q.pause){ph='exp';b.tEp=t;expStart=t;tau=0;}
        }
      } else { // PC hoặc PS: áp lực mục tiêu, lưu lượng giảm dần tự nhiên
        const lvl=q.mode==='PS'?q.ps:q.pi;
        Paw=q.peep+lvl*(1-Math.exp(-tau/Math.max(0.02,q.rise/3)));
        F=(Paw+Pm-q.peep-V/Cl)/q.R;
        fpk=Math.max(fpk,F);
        const endPC=q.mode==='PC'&&tau>=q.ti;
        const endPS=q.mode==='PS'&&tau>0.15&&F<fpk*q.cyc/100 || q.mode==='PS'&&tau>3;
        if(endPC||endPS){ if(Math.abs(F*60)<3) b.pplat=Paw; ph='exp';b.tEi=t;b.tEp=t;expStart=t;tau=0;}
      }
      if(ph!=='exp'||true){ if(Paw>b.ppeak){b.ppeak=Paw;b.tpk=t;} }
      if(F>0) b.vt+=F*VDT*1000;
    } else { // thở ra thụ động về PEEP
      const q=bp||p, Cl=q.C/1000;
      Paw=q.peep; F=(Pm-V/Cl)/Rex;
      const pp=P_at(t);
      const trigOK=t-expStart>0.2&&F*60>pp.trig&&pp.effort>0;
      const timeOK=pp.mode!=='PS'&&t-lastStart>=60/pp.rr;
      if(trigOK||timeOK){
        if(trigOK){const e=[...eff].reverse().find(e=>t>=e.t0&&t<=e.t0+e.tin);if(e)e.trig=true;}
        startBreath(t,trigOK?'bn':'may'); tau=-VDT;
        if(!trigOK) for(const e of eff) if(t>=e.t0&&t<=e.t0+e.tin*0.5) e.ovl=true;
      }
    }
    V+=F*VDT; tau+=VDT;
    if(k%VSTORE===0){out.t.push(t);out.P.push(Paw);out.F.push(F*60);out.V.push((V-(b?b.v0:0))*1000);out.Pm.push(Pm);}
  }
  const S={...out,br,eff:eff.filter(e=>!e.trig&&!e.ovl),allEff:eff,P_at,segs,dur};
  // thang đo tự động
  const sl=a=>a.slice(Math.floor(VWARM*50*0.5));
  const mx=a=>Math.max(...sl(a)), mn=a=>Math.min(...sl(a));
  const r5=x=>Math.ceil(x/5)*5;
  S.sc={p:[Math.min(spec.effort>0?-5:0,Math.floor(mn(out.P)/5)*5),Math.max(20,r5(mx(out.P)*1.15))],
        f:(()=>{const m=r5(Math.max(Math.abs(mx(out.F)),Math.abs(mn(out.F)))*1.15);return [-m,m];})(),
        v:[Math.min(0,Math.floor(mn(out.V)/100)*100),Math.max(200,Math.ceil(mx(out.V)*1.2/100)*100)]};
  if(s.scale) Object.assign(S.sc,s.scale);
  return S;
}
const vIdx=(S,t)=>Math.max(0,Math.min(S.t.length-1,Math.round((t+VWARM)*50)));
const vLast=(S,t)=>{let x=null;for(const b of S.br) if(b.tEnd<=t) x=b;return x;};

/* ---------- màn hình sóng ---------- */
const VMW=1150, VMH=618, VPAD=58, VWT=[0.4,0.31,0.29];
const vWin=(s,S)=>s.win||Math.max(8,Math.round(2.6*60/S.P_at(0).rr));
const vGeo=i=>{const H=VMH-20;let y0=10;for(let j=0;j<i;j++) y0+=H*VWT[j];return [y0,H*VWT[i]];};
const STR=[{k:'P',n:'Paw',u:'cmH₂O',c:'amber'},{k:'F',n:'Lưu lượng',u:'L/phút',c:'teal'},{k:'V',n:'Thể tích',u:'mL',c:'violet'}];
const NUMS={ppeak:['P đỉnh','cmH₂O'],pplat:['P bình nguyên','cmH₂O'],dp:['Áp lực đẩy ΔP','cmH₂O'],peep:['PEEP cài','cmH₂O'],
  peeptot:['PEEP tổng','cmH₂O'],autopeep:['Auto-PEEP','cmH₂O'],vt:['Vt','mL'],rr:['Tần số','l/ph'],mv:['V phút','L/ph'],crs:['Crs','mL/cmH₂O']};

function vStripY(S,k,i){const [y0,h]=vGeo(i), [a,b]=S.sc[k.toLowerCase()];
  return v=>y0+8+(h-26)*(1-(v-a)/(b-a));}
function ventMonitor(s,S,id){
  const W=VMW-VPAD-10;
  const strips=STR.map((st,i)=>{const Y=vStripY(S,st.k,i), [a,b]=S.sc[st.k.toLowerCase()], y0=vGeo(i)[0];
    const step=st.k==='P'?(b-a>50?20:10):st.k==='F'?(b>100?50:20):(b>800?400:200);
    let g='';for(let v=Math.ceil(a/step)*step;v<=b;v+=step) g+=`<line class="vg${v===0?' z':''}" x1="${VPAD}" x2="${VPAD+W}" y1="${Y(v)}" y2="${Y(v)}"/><text class="vtk" x="${VPAD-10}" y="${Y(v)+7}" text-anchor="end">${v}</text>`;
    return `<g>${g}<text class="vnm acc ${C(st.c)}" x="${VPAD+8}" y="${y0+26}">${st.n} <tspan class="vu">${st.u}</tspan></text>
      <path id="${id}-${st.k}" class="vtr" stroke="var(--${st.c})"/>${st.k==='P'?`<path id="${id}-Pm" class="vpm"/>`:''}</g>`;}).join('');
  return `<svg class="vmon" width="${VMW}" height="${VMH}" style="position:absolute;left:0;top:0">${strips}<g id="${id}-mk">${ventMarks(s,S)}</g></svg>`;
}
function vX(s,S,t,tD){const W=VMW-VPAD-10, win=vWin(s,S); return VPAD+W*(1-(tD-t)/win);}
function ventMarks(s,S){
  const tf=ventTime(s.freeze,s); if(tf==null||!(s.marks||[]).length) return '';
  const tD=tf, X=t=>vX(s,S,t,tD);
  const win=vWin(s,S), all=S.br.filter(b=>b.tEnd<=tD-0.5&&b.t0>=tD-win);
  const pick=n=>all[Math.max(0,all.length+(n??-1))]||all[all.length-1];
  const YP=vStripY(S,'P',0), YF=vStripY(S,'F',1), YV=vStripY(S,'V',2);
  const lab=(x,y,t,c,anc='start')=>`<text class="vml" x="${x}" y="${y}" fill="var(--${c})" text-anchor="${anc}" paint-order="stroke">${t}</text>`;
  const r1=x=>Math.round(x*10)/10, r0=x=>Math.round(x);
  return (s.marks||[]).map(m=>{const b=pick(m.breath), c=m.c||'coral', A=`data-in="${at(m.at)}"`, t=m.t;
    if(!b) return '';
    switch(m.k){
      case 'ppeak': return `<g ${A} data-a="pop"><circle cx="${X(b.tpk)}" cy="${YP(b.ppeak)}" r="11" class="vmc" stroke="var(--${c})"/>${lab(X(b.tpk)+18,YP(b.ppeak)-10,t??`P đỉnh ${r0(b.ppeak)}`,c)}</g>`;
      case 'pplat': if(b.pplat==null) return ''; return `<g ${A} data-a="pop"><line class="vmline" x1="${X(b.tEi)}" x2="${X(b.tEp)}" y1="${YP(b.pplat)}" y2="${YP(b.pplat)}" stroke="var(--${c})"/>${lab(X(b.tEp)+16,YP(b.pplat)+8,t??`P bình nguyên ${r0(b.pplat)}`,c)}</g>`;
      case 'peep': return `<g ${A} data-a="fade"><line class="vmdash" x1="${VPAD}" x2="${VMW-10}" y1="${YP(b.peep)}" y2="${YP(b.peep)}" stroke="var(--${c})"/>${lab(VMW-16,YP(b.peep)-10,t??`PEEP ${b.peep}`,c,'end')}</g>`;
      case 'dp': {if(b.pplat==null) return ''; const x=X(b.t0)-28; return `<g ${A} data-a="pop"><path class="vmline" d="M${x-60} ${YP(b.pplat)} H${X(b.tEi)}" stroke="var(--${c})" stroke-dasharray="4 8" style="stroke-width:2.5"/><path class="vmbr" d="M${x+10} ${YP(b.pplat)} H${x} V${YP(b.peep)} H${x+10}" stroke="var(--${c})"/>${lab(x-12,(YP(b.pplat)+YP(b.peep))/2+8,t??`ΔP = ${r0(b.pplat-b.peep)}`,c,'end')}</g>`;}
      case 'res': {if(b.pplat==null) return ''; const x=X(b.tpk)-22; return `<g ${A} data-a="pop"><path class="vmbr" d="M${x+10} ${YP(b.ppeak)} H${x} V${YP(b.pplat)} H${x+10}" stroke="var(--${c})"/>${lab(x-8,YP(b.ppeak)-30,t??`R × Flow = ${r0(b.ppeak-b.pplat)}`,c,'end')}</g>`;}
      case 'ti': return `<g ${A} data-a="pop"><path class="vmbr" d="M${X(b.t0)} ${YF(0)+30} V${YF(0)+40} H${X(b.tEp)} V${YF(0)+30}" stroke="var(--${c})"/>${lab((X(b.t0)+X(b.tEp))/2,YF(0)+68,t??`Ti ${r1(b.tEp-b.t0)} s`,c,'middle')}</g>`;
      case 'te': return `<g ${A} data-a="pop"><path class="vmbr" d="M${X(b.tEp)} ${YF(0)-30} V${YF(0)-40} H${X(b.tEnd)} V${YF(0)-30}" stroke="var(--${c})"/>${lab((X(b.tEp)+X(b.tEnd))/2,YF(0)-52,t??`Te ${r1(b.tEnd-b.tEp)} s`,c,'middle')}</g>`;
      case 'autopeep': return `<g ${A} data-a="pop"><circle cx="${X(b.tEnd)}" cy="${YF(b.fEnd)}" r="15" class="vmc" stroke="var(--${c})"/>${lab(X(b.tEnd)-22,YF(b.fEnd)+48,t??'Lưu lượng thở ra chưa về 0',c,'end')}</g>`;
      case 'vt': {const x=X(b.tEp)+12; return `<g ${A} data-a="pop"><path class="vmbr" d="M${x-10} ${YV(b.vt)} H${x} V${YV(0)} H${x-10}" stroke="var(--${c})"/>${lab(x+12,(YV(b.vt)+YV(0))/2+8,t??`Vt ${r0(b.vt)} mL`,c)}</g>`;}
      case 'ineff': return S.eff.filter(e=>e.t0>tD-win+0.3&&e.t0+0.4<tD).map((e,i)=>{const x=X(e.t0+e.tin*0.5),y=YF(S.F[vIdx(S,e.t0+e.tin*0.5)]);
          return `<g ${A} data-a="pop"><circle cx="${x}" cy="${y}" r="17" class="vmc" stroke="var(--${c})"/>${i===0?lab(x,y-30,t??'Gắng sức không trigger',c,'middle'):''}</g>`;}).join('');
      case 'pt': {const tt=b.t0+(m.dt||0), st=m.strip||'P', Y=st==='P'?YP:st==='F'?YF:YV, arr=S[st], y=m.y!=null?Y(m.y):Y(arr[vIdx(S,tt)]);
        return `<g ${A} data-a="pop"><circle cx="${X(tt)}" cy="${y}" r="13" class="vmc" stroke="var(--${c})"/>${lab(X(tt)+(m.dx??20),y+(m.dy??-18),t||'',c,m.anc||'start')}</g>`;}
    } return '';}).join('');
}
function ventNums(s,id){const ks=s.nums||['ppeak','pplat','dp','peep','vt','rr'];
  return `<div class="vnums">${ks.map(k=>`<div class="vnum" id="${id}-n-${k}"><div class="vnk">${NUMS[k][0]}</div><div class="vnv">–</div><div class="vnu">${NUMS[k][1]}</div></div>`).join('')}</div>`;}
const LUNG=`<svg class="vlung" viewBox="0 0 300 220" width="300" height="220"><path d="M150 18 V96 M150 96 Q128 108 112 122 M150 96 Q172 108 188 122" fill="none" stroke="rgba(203,213,225,.55)" stroke-width="7" stroke-linecap="round"/>
  <g class="lg"><path d="M128 52 C82 46 44 98 36 150 C30 194 50 214 86 212 C118 210 134 186 136 150 C138 112 142 72 128 52Z"/><path d="M172 52 C218 46 256 98 264 150 C270 194 250 214 214 212 C182 210 166 186 164 150 C162 112 158 72 172 52Z"/></g></svg>`;
function ventSide(s,id){
  return `<div class="vside">${s.lung===false?'':`<div class="card vlungc" id="${id}-lung">${LUNG}<div class="vlt" id="${id}-lt"></div></div>`}${ventNums(s,id)}
   ${(s.notes||[]).map(x=>`<div class="card ${C(x.c)} vnote" data-in="${at(x.at)}" data-a="left" data-hl="${at(x.at)}"><div class="tagc ${C(x.c)}">${esc(x.tag||'')}</div><div class="vnt">${esc(x.t)}</div></div>`).join('')}</div>`;
}
function ventHead(s,id){
  return `<div class="vhead"><span class="vmode" id="${id}-mode"></span><span class="vset" id="${id}-set"></span><span class="vfrz" id="${id}-frz">❚❚ ĐÓNG BĂNG</span></div>
   ${(s.changes||[]).filter(c=>c.label).map(c=>`<div class="vtoast ${C(c.c||'amber')}" data-in="${at(c.at)}" data-a="pop" data-out="${at(c.at)}+${c.hold??4}">⚙ ${esc(c.label)}</div>`).join('')}`;
}
L.vent=s=>{const id='v'+s.id; const S=ventSim(s); VSIM[s.id]={S,s,id,kind:'vent',tf:ventTime(s.freeze,s),tu:ventTime(s.unfreeze,s)};
  return `<div class="card vbox">${ventHead(s,id)}<div style="position:absolute;left:14px;top:62px">${ventMonitor(s,S,id)}</div></div>${ventSide(s,id)}`;};

/* ---------- vòng P-V và F-V ---------- */
const LPW=560, LPH=560;
L.loops=s=>{const id='v'+s.id; const S=ventSim(s); VSIM[s.id]={S,s,id,kind:'loops',tf:ventTime(s.freeze,s),tu:ventTime(s.unfreeze,s)};
  const ax=(k,x0,lab,ux,uy)=>`<g transform="translate(${x0},0)"><rect class="lpbg" x="0" y="0" width="${LPW}" height="${LPH}" rx="18"/>
     <text class="vnm" x="22" y="40">${lab}</text><text class="vtk" x="${LPW-16}" y="${LPH-16}" text-anchor="end">${ux}</text><text class="vtk" x="22" y="74">${uy}</text>
     <g id="${id}-${k}g"></g><path id="${id}-${k}2" class="lpo"/><path id="${id}-${k}1" class="lpo"/><path id="${id}-${k}0" class="lpc"/><circle id="${id}-${k}d" r="9" class="lpd"/>
     <g>${(s.points||[]).filter(p=>(p.plot||'pv')===k).map(p=>`<g data-in="${at(p.at)}" data-a="pop" class="lpp" data-x="${p.x}" data-y="${p.y}" data-k="${k}"><circle r="13" class="vmc" stroke="var(--${p.c||'coral'})"/><text class="vml" fill="var(--${p.c||'coral'})" x="${p.dx??18}" y="${p.dy??-16}" text-anchor="${p.anc||'start'}" paint-order="stroke">${esc(p.t||'')}</text></g>`).join('')}</g></g>`;
  return `<div class="card vbox lbox">${ventHead(s,id)}<svg width="${2*LPW+30}" height="${LPH}" style="position:absolute;left:18px;top:68px">${ax('pv',0,'Vòng áp lực – thể tích','Paw (cmH₂O)','V (mL)')}${ax('fv',LPW+30,'Vòng lưu lượng – thể tích','V (mL)','Lưu lượng (L/ph)')}</svg></div>${ventSide({...s,lung:false},id)}`;};

/* ---------- tiêu đề ---------- */
const _vtitle=L.title; L.title=s=>_vtitle({...s,art:'none'}).replace(/<svg[\s\S]*?<\/svg>/,`<svg style="position:absolute;right:0;top:110px" width="760" height="560" viewBox="0 0 760 560">
  <rect x="20" y="20" width="720" height="500" rx="30" fill="rgba(1,6,12,.85)" stroke="rgba(56,189,248,.4)" stroke-width="3" data-a="pop" data-in="0.3"/>
  <text x="56" y="74" font-family="Inter" font-size="24" font-weight="800" fill="#38bdf8" data-in="0.5">VC · Vt 450 · PEEP 5</text>
  ${[0,1,2].map(i=>`<line x1="56" x2="704" y1="${190+i*140}" y2="${190+i*140}" stroke="rgba(148,163,184,.25)" stroke-width="2"/>`).join('')}
  <path d="M56 190 H120 L132 150 L232 118 L238 140 H262 L268 190 H380 L392 150 L492 118 L498 140 H522 L528 190 H704" fill="none" stroke="#fbbf24" stroke-width="6" stroke-linejoin="round" data-a="draw" data-in="0.6"/>
  <path d="M56 330 H120 V290 H232 V330 H262 V385 Q300 340 380 330 V290 H492 V330 H522 V385 Q560 340 704 330" fill="none" stroke="#2dd4bf" stroke-width="6" stroke-linejoin="round" data-a="draw" data-in="0.9"/>
  <path d="M56 470 H120 L232 400 H262 Q300 465 380 470 L492 400 H522 Q560 465 704 470" fill="none" stroke="#a78bfa" stroke-width="6" stroke-linejoin="round" data-a="draw" data-in="1.2"/></svg>`);

/* ---------- cập nhật từng khung ---------- */
function vPath(S,a,from,to,X,Y,step=1){let i=vIdx(S,from),j=vIdx(S,to),d='';for(;i<=j;i+=step) d+=(d?'L':'M')+X(S.t[i]).toFixed(1)+' '+Y(a[i]).toFixed(1);return d;}
function ventTick(rec,lt){
  const {S,s,id}=rec, el=document.getElementById(id+'-mode'); if(!el) return;
  let tD=lt; const fr=rec.tf!=null&&lt>=rec.tf&&(rec.tu==null||lt<rec.tu);
  if(fr) tD=rec.tf; else if(rec.tu!=null&&lt>=rec.tu) tD=lt-(rec.tu-rec.tf);
  document.getElementById(id+'-frz').style.opacity=fr?1:0;
  const p=S.P_at(tD), b=vLast(S,tD);
  el.textContent=({VC:'VC – Thể tích',PC:'PC – Áp lực',PS:'PS – Hỗ trợ áp lực'})[p.mode]||p.mode;
  document.getElementById(id+'-set').innerHTML=(p.mode==='VC'?[`Vt <b>${p.vt}</b>`,`f <b>${p.rr}</b>`,`Ti <b>${p.ti}</b> s`,`PEEP <b>${p.peep}</b>`]:
    p.mode==='PC'?[`P ins <b>${p.pi}</b>`,`f <b>${p.rr}</b>`,`Ti <b>${p.ti}</b> s`,`PEEP <b>${p.peep}</b>`]:[`PS <b>${p.ps}</b>`,`PEEP <b>${p.peep}</b>`,`Trigger <b>${p.trig}</b> L/ph`]).concat(p.fio2?[`FiO₂ <b>${p.fio2}</b>%`]:[]).join('<i>·</i>');
  // số liệu
  if(b){const r0=x=>x==null?'–':Math.round(x), last=S.br.filter(x=>x.tEnd<=tD).slice(-4);
    const rr=last.length>1?60*(last.length-1)/(last[last.length-1].t0-last[0].t0):p.rr;
    const V={ppeak:r0(b.ppeak),pplat:r0(b.pplat),dp:b.pplat==null?'–':r0(b.pplat-b.peep),peep:b.peep,peeptot:r0(b.peep+b.auto),autopeep:r0(b.auto),
      vt:r0(b.vt),rr:r0(rr),mv:(b.vt*rr/1000).toFixed(1).replace('.',','),crs:b.pplat==null?'–':r0(b.vt/Math.max(1,b.pplat-b.peep-b.auto))};
    const al=s.alarm||{};
    for(const k in V){const n=document.getElementById(`${id}-n-${k}`); if(!n) continue; n.querySelector('.vnv').textContent=V[k];
      n.classList.toggle('al',al[k]!=null&&typeof V[k]==='number'&&V[k]>al[k]);}
    const lt2=document.getElementById(id+'-lt'); if(lt2){const hi=b.pplat!=null&&b.pplat>(al.pplat??30);
      lt2.textContent=hi?'Nguy cơ căng phế nang quá mức':b.auto>2?'Ứ khí – bẫy khí cuối thì thở ra':'';
      document.getElementById(id+'-lung').classList.toggle('hot',hi||b.auto>2);}}
  const lg=document.querySelector(`#${id}-lung .lg`); if(lg){const v=S.V[vIdx(S,tD)], mx=S.sc.v[1]/1.2;
    lg.setAttribute('transform',`translate(150 130) scale(${0.86+0.2*Math.max(0,Math.min(1.2,v/mx))}) translate(-150 -130)`);}
  if(rec.kind==='vent'){const win=vWin(s,S), X=t=>vX(s,S,t,tD);
    STR.forEach((st,i)=>{const Y=vStripY(S,st.k,i); document.getElementById(`${id}-${st.k}`).setAttribute('d',vPath(S,S[st.k],tD-win,tD,X,Y));});
    const pmE=document.getElementById(id+'-Pm'); if(pmE){if(s.showPmus){const Y=vStripY(S,'P',0);pmE.setAttribute('d',vPath(S,S.Pm.map(x=>-x),tD-win,tD,X,Y,2));}else pmE.setAttribute('d','');}
  } else {
    const [pa,pb]=S.sc.p,[va,vb]=S.sc.v,[fa,fb]=S.sc.f, m=56;
    const PX=v=>m+(LPW-2*m)*(v-pa)/(pb-pa), VY=v=>LPH-m-(LPH-2*m-40)*(v-va)/(vb-va);
    const VX=v=>m+(LPW-2*m)*(v-va)/(vb-va), FY=v=>m+40+(LPH-2*m-40)*(1-(v-fa)/(fb-fa));
    if(!rec.grid){rec.grid=1;
      document.getElementById(id+'-pvg').innerHTML=`<line class="vg z" x1="${PX(0)}" x2="${PX(0)}" y1="${m+30}" y2="${LPH-m}"/><line class="vg z" x1="${m}" x2="${LPW-m}" y1="${VY(0)}" y2="${VY(0)}"/>`;
      document.getElementById(id+'-fvg').innerHTML=`<line class="vg z" x1="${m}" x2="${LPW-m}" y1="${FY(0)}" y2="${FY(0)}"/><line class="vg z" x1="${VX(0)}" x2="${VX(0)}" y1="${m+30}" y2="${LPH-m}"/>`;
      document.querySelectorAll(`#${s.id} .lpp`).forEach(g=>{const x=+g.dataset.x,y=+g.dataset.y;g.setAttribute('transform',g.dataset.k==='pv'?`translate(${PX(x)},${VY(y)})`:`translate(${VX(x)},${FY(y)})`);});}
    const done=S.br.filter(x=>x.t0<=tD), cur=done[done.length-1]; if(!cur) return;
    const seg=(b2,end,f)=>{let i=vIdx(S,b2.t0),j=vIdx(S,end),d='';for(;i<=j;i++) d+=(d?'L':'M')+f(i);return d;};
    const pv=i=>PX(S.P[i]).toFixed(1)+' '+VY(S.V[i]).toFixed(1), fv=i=>VX(S.V[i]).toFixed(1)+' '+FY(S.F[i]).toFixed(1);
    [0,1,2].forEach(n=>{const bb=done[done.length-1-n]; const end=n===0?tD:(bb&&bb.tEnd);
      document.getElementById(`${id}-pv${n}`).setAttribute('d',bb?seg(bb,end,pv):'');document.getElementById(`${id}-fv${n}`).setAttribute('d',bb?seg(bb,end,fv):'');});
    const i=vIdx(S,tD); const dp=document.getElementById(id+'-pvd'), df=document.getElementById(id+'-fvd');
    dp.setAttribute('cx',PX(S.P[i]));dp.setAttribute('cy',VY(S.V[i]));df.setAttribute('cx',VX(S.V[i]));df.setAttribute('cy',FY(S.F[i]));
  }
}
const _prevTick=window.THEME_TICK;
window.THEME_TICK=(t,cur,SC)=>{ if(_prevTick) _prevTick(t,cur,SC);
  for(const k of [cur-1,cur,cur+1]){const sc=SC[k]; if(!sc) continue; const rec=VSIM[sc.sc.id]; if(!rec) continue;
    const lt=t-sc.sc.start; if(lt<-0.01||lt>=sc.sc.dur) continue; ventTick(rec,lt);
    sc.el.querySelectorAll('[data-out]').forEach(e=>{const to=parseT(e.dataset.out.replace(/\+([\d.]+)$/,''),sc.sc)+parseFloat((e.dataset.out.match(/\+([\d.]+)$/)||[0,0])[1]);
      if(lt>to) e.style.opacity=Math.max(0,1-(lt-to)/0.5);});}
};
