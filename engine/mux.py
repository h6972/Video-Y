"""Ghép giọng đọc thật (audio/*.mp3) vào video theo timeline.json.
Quy trình khi có audio: python build.py -> python capture.py video -> python mux.py"""
import json, os, subprocess, sys
D = os.path.abspath(sys.argv[1])
S = json.load(open(os.path.join(D, "timeline.json"), encoding="utf-8"))
inputs, filters, labels = [], [], []
for sc in S["scenes"]:
    for ln in sc["L"]:
        p = os.path.join(D, "audio", ln["mp3"])
        if not os.path.exists(p):
            continue
        k = len(inputs) // 2
        inputs += ["-i", p]
        ms = int(round((sc["start"] + ln["t0"]) * 1000))
        filters.append(f"[{k+1}:a]adelay={ms}|{ms}[a{k}]")
        labels.append(f"[a{k}]")
assert labels, "Chưa có file audio nào trong audio/"
fc = ";".join(filters) + ";" + "".join(labels) + \
     f"amix=inputs={len(labels)}:normalize=0,apad,atrim=0:{S['total']}[aout]"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(D, "video-silent.mp4"), *inputs,
                "-filter_complex", fc, "-map", "0:v", "-map", "[aout]", "-c:v", "copy",
                "-c:a", "aac", "-b:a", "192k", "-shortest", os.path.join(D, "video-final.mp4")], check=True)
print("-> video-final.mp4")
