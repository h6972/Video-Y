/* EXTRA: stats (ô số liệu đếm tăng dần) · gauge (thang điểm cộng dồn có vùng ngưỡng) */
(()=>{
L.stats=s=>{const T=s.tiles||[],cols=s.cols||T.length;
 return `<div class="stg" style="grid-template-columns:repeat(${cols},1fr);height:${s.h||(s.note?520:692)}px">${T.map(x=>`
  <div class="card stt ${C(x.c)}" data-in="${at(x.at)}" data-a="up" data-hl="${at(x.at)}${x.hl?','+x.hl:''}">
   ${x.tag?`<div><span class="tagc ${C(x.c)}">${esc(x.tag)}</span></div>`:''}
   <div class="stv acc"><span>${esc(x.pre||'')}</span><span data-count="${x.v}" data-dec="${x.dec||0}" data-in="${at(x.at)}+0.2">0</span><span class="sts">${esc(x.suf||'')}</span></div>
   <div class="stl">${esc(x.l||'')}</div>${x.d?`<div class="std">${esc(x.d)}</div>`:''}</div>`).join('')}</div>
  ${s.note?`<div class="card ${C(s.note.c||'amber')}" style="margin-top:22px;padding:20px 30px" data-in="${at(s.note.at)}" data-hl="${at(s.note.at)}"><div style="font-size:28px;font-weight:600;line-height:1.4">${esc(s.note.t)}</div></div>`:''}`;};

L.gauge=s=>{const mx=s.max||100,Z=s.zones||[],P=s.parts||[];let cum=0,prev=0;
 const zones=Z.map(z=>{const a=prev;prev=Math.min(z.to,mx);return `<div class="gz ${C(z.c)}" style="left:${100*a/mx}%;width:${100*(prev-a)/mx}%"></div>`;}).join('');
 prev=0; const zl=Z.map((z,i)=>{const a=prev;prev=Math.min(z.to,mx);return `<div class="gzl ${C(z.c)}" style="left:${100*a/mx}%" data-in="${at(s.zones_at??0)}+${0.2+i*0.25}">${esc(z.t)}</div>`;}).join('');
 const ticks=[0,...Z.map(z=>z.to).filter(v=>v<mx)].map(v=>`<div class="gtk" style="left:${100*v/mx}%">${v}</div>`).join('');
 const segs=P.map((p,i)=>{const l=100*cum/mx,w=100*p.v/mx;cum+=p.v;return `<div class="gsg" style="left:${l}%;width:${w}%"><div class="gfl ${C(p.c||'teal')}" data-v="${p.v}" data-a="growx" data-in="${at(p.at)}" data-to="${at(p.at)}+0.2" style="width:0"></div></div>`;}).join('');
 const chips=P.map(p=>`<div class="card gch ${C(p.c||'teal')}" data-in="${at(p.at)}" data-a="pop" data-hl="${at(p.at)}"><div class="gct">${esc(p.t)}</div><div class="gcv acc">+${p.v}</div></div>`).join('');
 const vz=Z.find(z=>cum<z.to)||Z[Z.length-1]||{};
 return `<div class="gwrap">
  <div class="gtr"><div class="gzs">${zones}</div>${zl}${segs}<div class="gmk" data-max="${mx}"><div class="gmn">0</div></div></div>
  <div class="gtks">${ticks}</div>
  <div class="gchs" style="grid-template-columns:repeat(${s.chip_cols||4},1fr)">${chips}</div>
  ${s.verdict?`<div class="card gvd ${C(vz.c||'coral')}" data-in="${at(s.verdict_at)}" data-a="pop" data-hl="${at(s.verdict_at)}+"><span class="tagc ${C(vz.c||'coral')}">TỔNG ${cum} ĐIỂM</span><span class="gvt">${esc(s.verdict)}</span></div>`:''}</div>`;};

const _tick=window.COMMON_TICK;
window.COMMON_TICK=(t,cur,S)=>{_tick&&_tick(t,cur,S);const sc=S[cur];if(!sc)return;const lt=t-sc.sc.start;
 for(const it of sc.items){const e=it.e;
   if(e.dataset.count!=null){const p=clamp((lt-it.tin)/1.4),v=+e.dataset.count*ease(p),d=+e.dataset.dec;e.textContent=v.toFixed(d).replace('.',',');}}
 const mk=sc.el.querySelector('.gmk'); if(mk){let tot=0;
   for(const it of sc.items) if(it.e.classList.contains('gfl')) tot+=+it.e.dataset.v*ease(clamp((lt-it.tin)/0.8));
   const mx=+mk.dataset.max; mk.style.left=(100*Math.min(tot,mx)/mx)+'%'; mk.querySelector('.gmn').textContent=Math.round(tot);
   mk.style.opacity=lt>0.4?1:0;}};
})();
