/* COMMON: layout dùng chung mọi giao diện (flow, cycle, curve, bars) */
(()=>{
const BW=1776,BH=692, col=c=>`var(--${c||'teal'})`;
const clipPt=(ax,ay,bx,by,hw,hh)=>{const dx=bx-ax,dy=by-ay;const s=Math.min(hw/Math.abs(dx||1e-6),hh/Math.abs(dy||1e-6));return [ax+dx*Math.min(s,1),ay+dy*Math.min(s,1)];};
let EID=0;
const edgeSvg=(e,A,B,bend)=>{const hwA=(A.w||300)/2+10,hhA=(A.h||120)/2+10,hwB=(B.w||300)/2+16,hhB=(B.h||120)/2+16;
 const [x1,y1]=clipPt(A.x,A.y,B.x,B.y,hwA,hhA),[x2,y2]=clipPt(B.x,B.y,A.x,A.y,hwB,hhB);
 const mx=(x1+x2)/2-(y2-y1)*(bend||0),my=(y1+y2)/2+(x2-x1)*(bend||0);const id='e'+(EID++);
 return `<path id="${id}" class="edge" d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" stroke="${col(e.c)}" marker-end="url(#ah-${e.c||'teal'})" data-a="draw" data-in="${at(e.at)}"/>
  ${e.label?`<text class="elab" x="${mx}" y="${my-12}" text-anchor="middle" data-in="${at(e.at)}+0.6">${esc(e.label)}</text>`:''}
  <circle class="ptc" r="8" fill="${col(e.c)}" style="color:${col(e.c)};opacity:0" data-path="${id}" data-t0="${at(e.at)}"/>`;};
const defs=()=>`<defs>${['teal','coral','amber','green','blue','violet'].map(c=>`<marker id="ah-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--${c})"/></marker>`).join('')}</defs>`;
const nodeDiv=n=>`<div class="card nd ${C(n.c)}" style="left:${n.x-(n.w||300)/2}px;top:${n.y-(n.h||120)/2}px;width:${n.w||300}px;height:${n.h||120}px" data-in="${at(n.at)}" data-a="pop" data-hl="${at(n.at)}${n.hl?','+n.hl:''}">
  <div class="nt">${esc(n.t)}</div>${n.d?`<div class="ndd">${esc(n.d)}</div>`:''}</div>`;
L.flow=s=>{const N={};s.nodes.forEach(n=>N[n.id]=n);
 return `<svg width="${BW}" height="${BH}" style="position:absolute;left:0;top:0;overflow:visible">${defs()}${s.edges.map(e=>edgeSvg(e,N[e.a],N[e.b],e.bend)).join('')}</svg>${s.nodes.map(nodeDiv).join('')}
 ${s.note?`<div class="card ${C(s.note.c||'amber')}" style="position:absolute;left:${s.note.x??0}px;top:${s.note.y??BH-90}px;width:${s.note.w??BW}px;padding:16px 24px" data-in="${at(s.note.at)}" data-a="up"><div style="font-size:26px;font-weight:600;line-height:1.4">${esc(s.note.t)}</div></div>`:''}`;};
L.cycle=s=>{const n=s.nodes.length,cx=s.cx??560,cy=s.cy??340,R=s.r??260;
 const P=s.nodes.map((nd,i)=>({...nd,x:cx+R*Math.sin(2*Math.PI*i/n),y:cy-R*Math.cos(2*Math.PI*i/n),w:nd.w||280,h:nd.h||110}));
 const E=P.map((p,i)=>({a:i,b:(i+1)%n,c:p.ec||p.c,at:P[(i+1)%n].at,label:p.el}));
 return `<svg width="${BW}" height="${BH}" style="position:absolute;left:0;top:0;overflow:visible">${defs()}${E.map(e=>edgeSvg(e,P[e.a],P[e.b],-0.18)).join('')}</svg>
 ${P.map(nodeDiv).join('')}<div class="ctr" style="left:${cx}px;top:${cy}px;width:300px" data-in="${at(s.center_at??0)}"><div style="font-size:34px;font-weight:800" class="acc ${C(s.center_c||'violet')}">${esc(s.center||'')}</div></div>
 ${(s.side||[]).length?`<div style="position:absolute;left:${cx+R+230}px;right:0;top:20px;display:flex;flex-direction:column;gap:18px">${s.side.map(x=>`<div class="card ${C(x.c)}" style="padding:18px 24px" data-in="${at(x.at)}" data-a="left" data-hl="${at(x.at)}"><div class="tagc ${C(x.c)}">${esc(x.tag||'')}</div><div style="font-size:27px;font-weight:600;margin-top:10px;line-height:1.4">${esc(x.t)}</div></div>`).join('')}</div>`:''}`;};
L.curve=s=>{const W=s.w??1000,H=BH-20,x0=110,y0=H-70,pw=W-x0-30,ph=y0-30;
 const X=v=>x0+pw*v/100,Y=v=>y0-ph*v/100;
 const path=pts=>{let d=`M${X(pts[0][0])} ${Y(pts[0][1])}`;for(let i=1;i<pts.length;i++){const p0=pts[Math.max(i-2,0)],p1=pts[i-1],p2=pts[i],p3=pts[Math.min(i+1,pts.length-1)];
   const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];d+=` C${X(c1[0])} ${Y(c1[1])} ${X(c2[0])} ${Y(c2[1])} ${X(p2[0])} ${Y(p2[1])}`;}return d;};
 return `<svg class="chart" width="${W}" height="${H}" style="position:absolute;left:0;top:0;overflow:visible">${defs()}
  <line class="ax" x1="${x0}" y1="${y0}" x2="${x0+pw+10}" y2="${y0}" marker-end="url(#ah-blue)"/><line class="ax" x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0-ph-10}" marker-end="url(#ah-blue)"/>
  <text class="axl" x="${x0+pw}" y="${y0+50}" text-anchor="end">${esc(s.xl||'')}</text><text class="axl" x="${x0-20}" y="${y0-ph-24}" text-anchor="start">${esc(s.yl||'')}</text>
  ${s.curves.map(c=>`<path class="crv" d="${path(c.pts)}" stroke="${col(c.c)}" ${c.dash?'stroke-dasharray="14 12"':''} data-a="draw" data-in="${at(c.at)}"/>
   <text class="clab" x="${X(c.pts[c.pts.length-1][0])}" y="${Y(c.pts[c.pts.length-1][1])-16}" text-anchor="end" fill="${col(c.c)}" data-in="${at(c.at)}+1">${esc(c.label||'')}</text>`).join('')}
  ${(s.points||[]).map(p=>`<g data-in="${at(p.at)}" data-a="pop"><circle cx="${X(p.x)}" cy="${Y(p.y)}" r="13" fill="var(--bg)" stroke="${col(p.c)}" stroke-width="6"/><text class="clab" x="${X(p.x)+(p.dx??18)}" y="${Y(p.y)+(p.dy??-18)}" fill="${col(p.c)}">${esc(p.t||'')}</text></g>`).join('')}
  ${(s.arrows||[]).map(a=>`<path class="edge" d="M${X(a.from[0])} ${Y(a.from[1])} L${X(a.to[0])} ${Y(a.to[1])}" stroke="${col(a.c)}" stroke-dasharray="4 10" marker-end="url(#ah-${a.c||'amber'})" data-a="draw" data-in="${at(a.at)}"/>`).join('')}</svg>
  <div style="position:absolute;left:${W+40}px;right:0;top:0;display:flex;flex-direction:column;gap:18px">${(s.notes||[]).map(x=>`<div class="card ${C(x.c)}" style="padding:18px 24px" data-in="${at(x.at)}" data-a="left" data-hl="${at(x.at)}"><div class="tagc ${C(x.c)}">${esc(x.tag||'')}</div><div style="font-size:27px;font-weight:600;margin-top:10px;line-height:1.4">${esc(x.t)}</div></div>`).join('')}</div>`;};

/* bars: biểu đồ cột ngang so sánh số liệu thử nghiệm */
L.bars=s=>{const N=s.notes||[],nw=N.length?(s.notes_w||480):0,G=s.groups||[],gap=16;
 const mx=s.max||Math.max(...G.flatMap(g=>g.bars.map(b=>b.v)))*1.08;
 const rows=G.map(g=>`<div class="card bgp ${C(g.c||'blue')}" style="flex:1;padding:14px 24px;display:flex;flex-direction:column;justify-content:center" data-in="${at(g.at)}" data-a="up" data-hl="${at(g.at)}${g.hl?','+g.hl:''}">
   <div class="bgt">${esc(g.t)}${g.d?`<span class="mut"> · ${esc(g.d)}</span>`:''}</div>
   ${g.bars.map((b,i)=>`<div class="brw"><div class="bk">${esc(b.k)}</div><div class="btr"><div class="bln" style="width:${100*b.v/mx}%"><div class="bfl" style="background:var(--${b.c||(i?'mutbar':'coral')})" data-a="growx" data-in="${at(g.at)}+${0.3+i*0.35}" data-to="${at(g.at)}+${1.2+i*0.35}"></div></div>
     <div class="bv" style="left:calc(${100*b.v/mx}% + 12px)" data-in="${at(g.at)}+${1.3+i*0.35}">${esc(b.lab??String(b.v))}</div></div></div>`).join('')}
   ${g.note?`<div class="bnt" data-in="${at(g.note_at??g.at)}+1.6">${esc(g.note)}</div>`:''}</div>`).join('');
 const nt=nw?`<div style="width:${nw}px;display:flex;flex-direction:column;gap:14px">${N.map(n=>`<div class="card ${C(n.c)}" style="flex:1;padding:16px 22px;display:flex;flex-direction:column;justify-content:center" data-in="${at(n.at)}" data-a="left" data-hl="${at(n.at)}">${n.tag?`<div><span class="tagc ${C(n.c)}">${esc(n.tag)}</span></div>`:''}<div style="font-size:26px;font-weight:700;margin-top:6px;line-height:1.28">${esc(n.t)}</div>${n.d?`<div class="mut" style="font-size:21px;margin-top:5px;line-height:1.35">${esc(n.d)}</div>`:''}</div>`).join('')}</div>`:'';
 return `<div style="display:flex;gap:22px;height:${s.h||692}px"><div style="flex:1;display:flex;flex-direction:column;gap:${gap}px">${rows}</div>${nt}</div>`;};

})();
window.COMMON_TICK=(t,cur,S)=>{const sc=S[cur];if(!sc)return;const lt=t-sc.sc.start;
 sc.el.querySelectorAll('circle[data-path]').forEach(c=>{const p=document.getElementById(c.dataset.path);if(!p)return;
  const it=sc.items.find(o=>o.e===p);const t0=it?it.tin+1.6:0;if(lt<t0){c.style.opacity=0;return;}
  const L=p.getTotalLength(),f=((lt-t0)*0.45)%1;const q=p.getPointAtLength(L*f);c.setAttribute('cx',q.x);c.setAttribute('cy',q.y);c.style.opacity=Math.sin(Math.PI*f)*0.95;});};
