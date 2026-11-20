# -*- coding: utf-8 -*-
"""Chụp ảnh cuối mỗi cảnh (và giữa đếm ngược) rồi ghép contact sheet 2x2 để kiểm tra.
Dùng: python tools/shh/stills.py projects/<dự án> <thư mục ra>"""
import json, os, subprocess, sys, glob
from PIL import Image

proj, out = sys.argv[1], sys.argv[2]
t = json.load(open(os.path.join(proj, "timeline.json"), encoding="utf-8"))
sc = t["scenes"]
times = []
for s in sc:
    st, du = s.get("start", s.get("t0", 0)), s.get("dur", 0)
    if s.get("id") in ("intro", "outro"):
        continue
    times.append(round(st + du - 1.5, 2))
    cd = s.get("cd")
    if cd:
        times.append(round(st + cd.get("t0", 0) + 3, 2))
for f in glob.glob(os.path.join(proj, "still_*")):
    os.remove(f)
subprocess.run([sys.executable, "-X", "utf8", "engine/capture.py", proj, "stills"] + [str(x) for x in times], check=True)
fs = sorted(glob.glob(os.path.join(proj, "still_*.png")), key=lambda p: float(os.path.basename(p)[6:-4]))
os.makedirs(out, exist_ok=True)
for i in range(0, len(fs), 4):
    ims = [Image.open(f).convert("RGB") for f in fs[i:i + 4]]
    w, h = ims[0].size; w2, h2 = w // 2, h // 2
    sh = Image.new("RGB", (w2 * 2, h2 * 2), "white")
    for k, im in enumerate(ims):
        sh.paste(im.resize((w2, h2)), ((k % 2) * w2, (k // 2) * h2))
    sh.save(os.path.join(out, f"{os.path.basename(proj)}_{i // 4:02d}.jpg"), quality=70)
for f in fs:
    os.remove(f)
print(len(fs), "ảnh", (len(fs) + 3) // 4, "trang")
