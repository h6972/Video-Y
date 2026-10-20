"""Tạo giọng mẫu bằng G-OmniVoice (voice design) để chọn giọng chuẩn cho kênh."""
import os, time, json, torch, soundfile as sf
from omnivoice import OmniVoice

OUT = os.path.abspath(os.environ.get("OUT", "samples"))
os.makedirs(OUT, exist_ok=True)
dev = "cuda:0" if torch.cuda.is_available() else "cpu"
t0 = time.time()
model = OmniVoice.from_pretrained("g-group-ai-lab/g-omnivoice", device_map=dev,
                                  dtype=torch.float16 if dev != "cpu" else torch.float32)
print("tải mô hình:", round(time.time() - t0), "giây, thiết bị", dev, flush=True)

TEXT = ("Thưa quý đồng nghiệp, đây là thay đổi quan trọng nhất của định nghĩa lần thứ năm: "
        "phân loại bằng con số được thay thế hoàn toàn. Nhồi máu cơ tim nay được xếp vào một trong ba bối cảnh lâm sàng.")
VOICES = {
    "nam-bac":  "male, middle-aged, low pitch, northern Vietnamese accent",
    "nam-nam":  "male, middle-aged, low pitch, southern Vietnamese accent",
    "nu-bac":   "female, middle-aged, medium pitch, northern Vietnamese accent",
    "nu-nam":   "female, middle-aged, medium pitch, southern Vietnamese accent",
}
info = {}
for name, ins in VOICES.items():
    t = time.time()
    try:
        audio = model.generate(text=TEXT, instruct=ins)
        sf.write(f"{OUT}/{name}.wav", audio[0], 24000)
        dur = len(audio[0]) / 24000
        info[name] = {"instruct": ins, "audio_s": round(dur, 1), "gen_s": round(time.time() - t, 1)}
    except Exception as e:
        info[name] = {"instruct": ins, "error": repr(e)}
    print(name, info[name], flush=True)
json.dump({"text": TEXT, "voices": info}, open(f"{OUT}/info.json", "w"), ensure_ascii=False, indent=1)
