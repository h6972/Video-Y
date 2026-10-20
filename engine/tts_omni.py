"""Tạo giọng đọc bằng G-OmniVoice trên MÁY CÓ GPU (chạy tại máy anh Hướng).
Dùng:  python engine/tts_omni.py projects/<dự án>          (tạo toàn bộ)
       python engine/tts_omni.py projects/<dự án> --test   (chỉ 3 câu đầu để nghe thử)
Giọng chuẩn của kênh lưu ở voices/<tên>.wav + .txt — tạo 1 lần, các video sau dùng lại."""
import os, sys, json, time
import torch, soundfile as sf
from omnivoice import OmniVoice

D = os.path.abspath(sys.argv[1]); TEST = "--test" in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(os.path.join(D, "script.json"), encoding="utf-8"))
cfg = {"voice": "nam", "instruct": "male, middle-aged, low pitch"}; cfg.update(S.get("omni", {}))

LEX = {"SARS-CoV-2": "sa sờ cô vi hai", "RSV": "a ét vi", "RT-PCR": "a tê pê xê a", "H3N2": "hát ba en hai"}
LEX.update(S.get("lexicon", {}))
def spoken(t):
    for k, v in LEX.items(): t = t.replace(k, v)
    return t

dev = "cuda:0" if torch.cuda.is_available() else "cpu"
print("Thiết bị:", torch.cuda.get_device_name(0) if dev != "cpu" else "CPU (sẽ rất chậm!)", flush=True)
model = OmniVoice.from_pretrained("g-group-ai-lab/g-omnivoice", device_map=dev,
                                  dtype=torch.float16 if dev != "cpu" else torch.float32)
STEPS = int(cfg.get("num_step", 16))   # 32 = chất lượng tối đa, 16 = nhanh gấp đôi
try:                                    # tăng tốc nếu máy có FlashInfer (thường chỉ trên Linux)
    from omnivoice import apply_flashinfer; apply_flashinfer(model); print("Đã bật FlashInfer")
except Exception:
    pass
print("Số bước khuếch tán:", STEPS, flush=True)

# ---- giọng chuẩn của kênh ----
vdir = os.path.join(ROOT, "voices"); os.makedirs(vdir, exist_ok=True)
ref_wav = os.path.join(vdir, cfg["voice"] + ".wav"); ref_txt = os.path.join(vdir, cfg["voice"] + ".txt")
if not os.path.exists(ref_wav):
    REF = "Thưa quý đồng nghiệp, hôm nay chúng ta sẽ cùng nhau phân tích những điểm mới quan trọng nhất của hướng dẫn này."
    print("Chưa có giọng chuẩn → tạo mới từ mô tả:", cfg["instruct"], flush=True)
    sf.write(ref_wav, model.generate(text=REF, instruct=cfg["instruct"])[0], 24000)
    open(ref_txt, "w", encoding="utf-8").write(REF)
ref_text = open(ref_txt, encoding="utf-8").read().strip()

out = os.path.join(D, "audio"); os.makedirs(out, exist_ok=True)
jobs = [(sc["id"], i, ln) for sc in S["scenes"] for i, ln in enumerate(sc["lines"])]
if TEST: jobs = jobs[:3]
t0 = time.time()
for k, (sid, i, ln) in enumerate(jobs, 1):
    p = os.path.join(out, f"{sid}_{i+1}.flac")
    if os.path.exists(p): continue
    a = model.generate(text=spoken(ln), ref_audio=ref_wav, ref_text=ref_text, num_step=STEPS)[0]
    sf.write(p, a, 24000)
    print(f"[{k}/{len(jobs)}] {sid}_{i+1}  ({round(time.time()-t0)} giây)", flush=True)
print("Hoàn tất:", out)
