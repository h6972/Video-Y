"""Ghép giọng đọc thật (audio/*) vào video theo timeline.json; thêm nhạc nền/hiệu ứng nếu script có "brand"/"music".
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
        k = len(labels)
        inputs += ["-i", p]
        ms = int(round((sc["start"] + ln["t0"]) * 1000))
        filters.append(f"[{k+1}:a]adelay={ms}|{ms}[a{k}]")
        labels.append(f"[a{k}]")
assert labels, "Chưa có file audio nào trong audio/"
voice = ";".join(filters) + ";" + "".join(labels) + \
     f"amix=inputs={len(labels)}:normalize=0,apad,atrim=0:{S['total']},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000"
use_music = S.get("music") or (S.get("brand") and S["brand"].get("music", True))
if use_music:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import music
    inputs += ["-i", music.make(D)]
    m = len(labels) + 1
    fc = voice + f"[v];[{m}:a]aresample=48000,aformat=channel_layouts=stereo[m];[v]aformat=channel_layouts=stereo[vs];" \
                 f"[vs][m]amix=inputs=2:normalize=0,alimiter=limit=0.95[aout]"
else:
    fc = voice + "[aout]"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(D, "video-silent.mp4"), *inputs,
                "-filter_complex", fc, "-map", "0:v", "-map", "[aout]", "-c:v", "copy",
                "-c:a", "aac", "-b:a", "192k", "-shortest", os.path.join(D, "video-final.mp4")], check=True)
print("-> video-final.mp4", "(có nhạc nền)" if use_music else "")
