"""Phụ đề .srt cho YouTube từ timeline.json (chạy build.py với audio thật trước).
Dùng: python tools/srt.py projects/<dự án> [out.srt]"""
import json, os, sys
D = sys.argv[1]
S = json.load(open(os.path.join(D, "timeline.json"), encoding="utf-8"))
f = lambda t: f"{int(t//3600):02d}:{int(t%3600//60):02d}:{int(t%60):02d},{int(round((t%1)*1000)) % 1000:03d}"
out, k = [], 0
for sc in S["scenes"]:
    for ln in sc["L"]:
        for s in ln["subs"]:
            k += 1; a = sc["start"] + s["t0"]; b = sc["start"] + s["t1"] + 0.15
            out.append(f"{k}\n{f(a)} --> {f(b)}\n{s['text']}\n")
p = sys.argv[2] if len(sys.argv) > 2 else os.path.join(D, "phu-de.srt")
open(p, "w", encoding="utf-8").write("\n".join(out)); print("->", p, k, "dòng")
