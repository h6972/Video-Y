"""Giọng đọc VieNeu-TTS v3 Turbo (chạy CPU trên GitHub, miễn phí).
Cấu hình trong script.json: "tts": "vieneu", "vieneu": {"voice": "Adam", "tempo": 1.0}
tempo ≠ 1: tăng/giảm tốc giữ nguyên cao độ (ffmpeg atempo), ví dụ video ngắn {"voice": "Mỹ Duyên", "tempo": 1.15}."""
import os, sys, json, time, subprocess
import onnxruntime; print("onnxruntime", onnxruntime.__version__, flush=True)
from vieneu import Vieneu

D = os.path.abspath(sys.argv[1])
S = json.load(open(os.path.join(D, "script.json"), encoding="utf-8"))
cfg = {"voice": "Adam"}; cfg.update(S.get("vieneu", {}))
LEX = {"SARS-CoV-2": "sa sờ cô vi hai", "RSV": "a ét vi", "RT-PCR": "a tê pê xê a", "H3N2": "hát ba en hai"}
LEX.update(S.get("lexicon", {}))
def spoken(t):
    for k, v in LEX.items(): t = t.replace(k, v)
    return t

tts = Vieneu()
out = os.path.join(D, "audio"); os.makedirs(out, exist_ok=True)
jobs = [(sc["id"], i, ln) for sc in S["scenes"] for i, ln in enumerate(sc["lines"])]
t0 = time.time()
for k, (sid, i, ln) in enumerate(jobs, 1):
    p = os.path.join(out, f"{sid}_{i+1}.wav")
    if os.path.exists(p): continue
    tts.save(tts.infer(spoken(ln), voice=cfg["voice"]), p)
    tp = float(cfg.get("tempo", 1) or 1)
    if abs(tp - 1) > 1e-3:
        q = p[:-4] + "_t.wav"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", p, "-af", f"atempo={tp}", q], check=True)
        os.replace(q, p)
    print(f"[{k}/{len(jobs)}] {sid}_{i+1} ({round(time.time()-t0)} giây)", flush=True)
