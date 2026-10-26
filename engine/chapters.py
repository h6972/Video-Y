"""In mốc thời gian chương (dùng cho mô tả Facebook/YouTube) từ timeline.json đã có giọng thật.
Dùng: python engine/chapters.py projects/<dự án>   (chạy build.py với audio thật trước)"""
import json, sys, os
S = json.load(open(os.path.join(sys.argv[1], "timeline.json"), encoding="utf-8"))
seen = set()
first = True
for s in S["scenes"]:
    if s.get("_brand"): continue
    t = 0 if first else int(s["start"]); first = False; title = (s.get("title") or s.get("chapter") or "").replace("<br>", " ")
    if s.get("layout") == "title": title = "Mở đầu"
    if title in seen: continue
    seen.add(title); print(f"{t//60:02d}:{t%60:02d} {title}")
