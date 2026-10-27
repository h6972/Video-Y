/* BRAND: đoạn mở logo (layout brand) + màn hình kết YouTube (layout endscreen). Bật bằng "brand": {...} trong script.json */
(()=>{
const LIMG='../../assets/brand/logo.png', WEB='thuvienykhoa.online';
const BADGE=(sz,d0)=>`<img src="${LIMG}" class="blimg" style="width:${sz}px;height:${sz}px" data-in="${d0}" data-a="pop">`;
const LOGO=(sz,d0)=>`<svg width="${sz}" height="${sz}" viewBox="-1 -1 28 28" class="blogo">
  <rect x="1" y="1" width="24" height="24" rx="6" fill="none" stroke="#e6edf7" stroke-width="1.6" data-a="draw" data-in="${d0}"/>
  <path d="M4 14h5l2-5 3 9 2-4h6" fill="none" stroke="var(--teal)" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round" data-a="draw" data-in="${(+d0+0.55).toFixed(2)}"/></svg>`;
L.brand=s=>{const v=document.body.dataset.format==='vertical';
 return `<div class="bwrap${v?' bv':''}">
  <div class="bglow" data-in="0.1"></div>
  <div class="blwrap" data-in="0.15" data-a="pop" style="width:${v?520:500}px;height:${v?520:500}px"><div class="bring"></div><img src="${LIMG}" class="blimg" style="width:100%;height:100%"></div>
  <div class="bweb" data-in="1.5">${WEB}</div>
  <div class="bser" data-in="2.0">${esc(TL.part||'')}</div></div>`;};
L.endscreen=s=>{const v=document.body.dataset.format==='vertical';
 if(v) return `<div class="bwrap bv"><div class="bglow" data-in="0"></div>
  ${BADGE(420,'0.1')}
  <div class="ecta" data-in="1.0" data-a="pop">Xem trọn bài giảng trên kênh</div>
  <div class="btag" data-in="1.4">${esc(s.next||'Link ở bio · bình luận ghim')}</div><div class="bweb" data-in="1.7">${WEB}</div></div>`;
 return `<div class="eswrap">
  <div class="eshd" data-in="0.2"><div class="kick">${esc(TL.part||'')}</div><div class="esttl">Cảm ơn quý đồng nghiệp đã theo dõi</div></div>
  <div class="esbox esv1" data-in="0.7" data-a="pop"><div class="esin"><span class="tagc c-teal">XEM TIẾP</span><div class="esnx">${esc(s.next||'Video tiếp theo')}</div></div></div>
  <div class="esbox esv2" data-in="1.0" data-a="pop"><div class="esin"><span class="tagc c-blue">TRỌN BỘ</span><div class="esnx">Danh sách phát của loạt bài</div></div></div>
  <div class="essub" data-in="1.4" data-a="pop"><img src="${LIMG}" style="width:184px;height:184px"></div>
  <div class="essubt" data-in="1.8"><b>Đăng ký kênh</b><span>Thư Viện Y Khoa Online · guideline mới, giảng bằng tiếng Việt</span><span class="esweb">${WEB} · tải bản dịch, tóm tắt, trọn bộ video</span></div>
  <div class="esfoot" data-in="2.2">Video phục vụ mục đích giáo dục cho nhân viên y tế, không thay thế hướng dẫn chính thức và đánh giá lâm sàng.</div></div>`;};
const _tick=window.COMMON_TICK;
window.COMMON_TICK=(t,cur,S)=>{_tick&&_tick(t,cur,S);const sc=S[cur];if(!sc||!sc.sc._brand)return;const lt=t-sc.sc.start;
 const g=sc.el.querySelector('.bglow'), rg=sc.el.querySelector('.bring'); if(rg) rg.style.transform=`translate(-50%,-50%) rotate(${lt*40}deg)`; if(g) g.style.transform=`translate(-50%,-50%) scale(${1+0.06*Math.sin(lt*2.2)})`;
 sc.el.querySelectorAll('.esbox').forEach((b,i)=>b.style.boxShadow=`0 0 ${30+14*Math.sin(lt*1.6+i)}px -6px var(--teal)`);};
})();

/* logo nhỏ ở chân trang mọi cảnh */
(()=>{const sg=document.getElementById('sign'); if(sg){sg.innerHTML=`<img src="../../assets/brand/logo.png" style="width:30px;height:30px;vertical-align:middle;margin-right:10px;border-radius:50%">Thư Viện Y Khoa Online · thuvienykhoa.online`;}})();
