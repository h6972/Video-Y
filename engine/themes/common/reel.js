/* REEL: cảnh trailer/video ngắn – ảnh tràn khung (Ken Burns), tiêu đề lớn xuất hiện theo nhịp, chip số liệu, hình vẽ, danh sách.
   Trường: bg, pos, kb (độ phóng cuối, mặc định 1.14), kicker, beats[{t,at,c,big}], chips[{v,l,c,at}], fig ('babylung'|'alveolus') + figs{…}, fig_at,
   rows[{n,t,at,c}], align ('end'|'center'|'start') */
(()=>{
L.reel=s=>{
 const card=s.bg&&s.card?`<div class="card rlcard" data-in="0" data-a="pop" style="height:${s.card_h||620}px"><img src="${s.bg}" data-kb="${s.kb||1.14}" style="object-position:${s.pos||'center'}"></div>`:'';
 const bg=s.bg&&!s.card?`<div class="rlbg" data-kb="${s.kb||1.14}"><img src="${s.bg}" style="object-position:${s.pos||'center'}"></div><div class="rlsh"></div>`
              :`<div class="rlbg rlgrad"><div class="rlorb ${C(s.c||'teal')}" data-kb="1.25"></div></div>`;
 const fig=s.fig&&L[s.fig]?`<div class="rlfig" data-in="${at(s.fig_at??0)}" data-a="pop">${L[s.fig]({...(s.figs||{}),h:s.fig_h||520})}</div>`:'';
 const beats=(s.beats||[]).map(b=>`<div class="rlb${b.big?' rlbig':''} ${b.c?'acc '+C(b.c):''}" data-in="${at(b.at)}" data-a="up">${esc(b.t)}</div>`).join('');
 const chips=(s.chips||[]).length?`<div class="rlchips">${s.chips.map(x=>`<div class="card rlchip ${C(x.c)}" data-in="${at(x.at)}" data-a="pop" data-hl="${at(x.at)}"><div class="rlcv acc">${esc(x.v)}</div><div class="rlcl">${esc(x.l||'')}</div></div>`).join('')}</div>`:'';
 const rows=(s.rows||[]).length?`<div class="rlrows">${s.rows.map(r=>`<div class="rlrow" data-in="${at(r.at)}" data-a="left"><span class="rln ${C(r.c||'teal')}">${esc(r.n)}</span><span class="rlrt">${esc(r.t)}</span></div>`).join('')}</div>`:'';
 return `${bg}<div class="rlwrap" style="justify-content:${s.align==='center'?'center':s.align==='start'?'flex-start':'flex-end'}">${card}${fig}
  ${s.kicker?`<div class="rlk" data-in="0">${esc(s.kicker)}</div>`:''}${beats}${chips}${rows}</div>`;};
const _tick=window.COMMON_TICK;
window.COMMON_TICK=(t,cur,S)=>{_tick&&_tick(t,cur,S);const sc=S[cur];if(!sc)return;const lt=t-sc.sc.start, p=Math.max(0,Math.min(1,lt/Math.max(1,sc.sc.dur)));
 sc.el.querySelectorAll('[data-kb]').forEach(e=>{const k=+e.dataset.kb;e.style.transform=`scale(${1+(k-1)*p})`;});};
})();
