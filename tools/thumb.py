"""Ảnh bìa YouTube 1280x720 theo mẫu kênh Thư Viện Y Khoa Online.
Dùng: python tools/thumb.py <spec.json>
spec: [{"out": "thumbs/x.png", "hook": "CƠN BÃO GIÁP", "line2": "Nhận diện &amp; chẩn đoán", "chips": ["..."],
        "badge": "PHẦN 1/2", "tag": "Đồng thuận ETA/BTA 2026", "img": "media/.../a.jpg" | null, "c": "coral"}]"""
import json, os, sys
from playwright.sync_api import sync_playwright
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = '''<svg viewBox="0 0 760 700" width="640" height="590"><path d="M380 60 V600" stroke="rgba(148,163,184,.35)" stroke-width="48" stroke-linecap="round"/>
<path d="M352 300 C330 210 300 150 255 150 C205 150 180 230 190 320 C200 410 240 470 290 470 C335 470 350 410 352 360 Z" fill="rgba(251,113,133,.22)" stroke="#fb7185" stroke-width="7"/>
<path d="M408 300 C430 210 460 150 505 150 C555 150 580 230 570 320 C560 410 520 470 470 470 C425 470 410 410 408 360 Z" fill="rgba(251,113,133,.22)" stroke="#fb7185" stroke-width="7"/>
<path d="M350 335 C365 352 395 352 410 335 L410 372 C395 388 365 388 350 372 Z" fill="rgba(251,113,133,.4)" stroke="#fb7185" stroke-width="5"/>
<path d="M110 260 C85 215 130 190 110 145 M650 260 C675 215 630 190 650 145 M80 420 C55 375 100 350 80 305 M680 420 C705 375 660 350 680 305" fill="none" stroke="#fbbf24" stroke-width="8" stroke-linecap="round"/>
<path d="M0 590 H120 L140 560 L160 590 H190 L205 610 L228 470 L250 680 L268 590 H300 L320 560 L340 590 H370 L385 610 L408 470 L430 680 L448 590 H480 L500 560 L520 590 H550 L565 610 L588 470 L610 680 L628 590 H760" fill="none" stroke="#60a5fa" stroke-width="7" stroke-linejoin="round"/></svg>'''
LOGO = '<svg width="44" height="44" viewBox="-1 -1 28 28"><rect x="1" y="1" width="24" height="24" rx="6" fill="none" stroke="#e6edf7" stroke-width="2"/><path d="M4 14h5l2-5 3 9 2-4h6" fill="none" stroke="#2dd4bf" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>'
def page(s):
    c = {"coral": "#fb7185", "amber": "#fbbf24", "teal": "#2dd4bf"}.get(s.get("c", "coral"), "#fb7185")
    img = f'<div class="ph" style="background-image:url(file://{os.path.join(R, s["img"])})"></div>' if s.get("img") else f'<div class="art">{ART}</div>'
    chips = "".join(f"<span>{x}</span>" for x in s.get("chips", []))
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Inter;src:url(file://{R}/fonts/Inter-ExtraBold.otf);font-weight:800}}
@font-face{{font-family:Inter;src:url(file://{R}/fonts/Inter-Bold.otf);font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1280px;height:720px;overflow:hidden;font-family:Inter;color:#fff;background:#07122a;position:relative}}
.bg{{position:absolute;inset:0;background:radial-gradient(700px 520px at 85% 30%,rgba(37,99,235,.45),transparent 65%),radial-gradient(600px 500px at 0% 100%,rgba(20,184,166,.28),transparent 60%)}}
.ph{{position:absolute;right:0;top:0;width:560px;height:720px;background-size:cover;background-position:center 30%;filter:grayscale(1) contrast(1.15) brightness(.95);
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 38%)}}
.ph::after{{content:"";position:absolute;inset:0}}
.tint{{position:absolute;right:0;top:0;width:560px;height:720px;background:linear-gradient(90deg,#07122a 0%,rgba(7,18,42,.2) 45%,rgba(20,184,166,.18));mix-blend-mode:normal}}
.art{{position:absolute;right:-20px;top:70px;filter:drop-shadow(0 0 40px rgba(251,113,133,.35))}}
.brand{{position:absolute;left:56px;top:44px;display:flex;align-items:center;gap:14px;font-size:24px;font-weight:800;letter-spacing:2.5px}}
.badge{{position:absolute;right:40px;top:36px;background:{c};color:#0b1020;font-weight:800;font-size:30px;padding:12px 22px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.4)}}
.txt{{position:absolute;left:56px;top:150px;width:780px}}
.tag{{display:inline-block;font-size:26px;font-weight:700;color:#2dd4bf;border:2.5px solid #2dd4bf;padding:6px 16px;border-radius:12px}}
.hook{{font-size:112px;font-weight:800;line-height:1.0;letter-spacing:-2px;margin-top:26px;color:{c};text-shadow:0 6px 30px rgba(0,0,0,.5)}}
.l2{{font-size:62px;font-weight:800;line-height:1.1;margin-top:18px;letter-spacing:-1px;text-shadow:0 4px 20px rgba(0,0,0,.6)}}
.chips{{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}}
.chips span{{font-size:27px;font-weight:700;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.25);padding:8px 16px;border-radius:12px}}
.bar{{position:absolute;left:0;bottom:0;height:12px;width:100%;background:linear-gradient(90deg,#2dd4bf,#60a5fa,{c})}}
</style></head><body><div class="bg"></div>{img}{'<div class="tint"></div>' if s.get("img") else ''}
<div class="brand">{LOGO}THƯ VIỆN Y KHOA ONLINE</div><div class="badge">{s.get("badge","")}</div>
<div class="txt"><div class="tag">{s.get("tag","")}</div><div class="hook">{s["hook"]}</div><div class="l2">{s.get("line2","")}</div><div class="chips">{chips}</div></div>
<div class="bar"></div></body></html>'''
if __name__ == "__main__":
    spec = json.load(open(sys.argv[1], encoding="utf-8"))
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1280, "height": 720})
        for s in spec:
            tmp = os.path.join(R, "_thumb.html"); open(tmp, "w", encoding="utf-8").write(page(s))
            pg.goto("file://" + tmp); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
            out = os.path.join(R, s["out"]); os.makedirs(os.path.dirname(out), exist_ok=True)
            pg.screenshot(path=out); print("->", s["out"])
        b.close(); os.remove(tmp)
