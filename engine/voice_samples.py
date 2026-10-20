"""Thử giọng G-OmniVoice (voice design) ~1 phút: câu đầu tạo bằng mô tả,
các câu sau nhân bản từ câu đầu để giữ giọng đồng nhất (giống cách sản xuất thật)."""
import os, time, json, torch, numpy as np, soundfile as sf
from omnivoice import OmniVoice

OUT = os.path.abspath(os.environ.get("OUT", "samples"))
os.makedirs(OUT, exist_ok=True)
dev = "cuda:0" if torch.cuda.is_available() else "cpu"
t0 = time.time()
model = OmniVoice.from_pretrained("g-group-ai-lab/g-omnivoice", device_map=dev,
                                  dtype=torch.float16 if dev != "cpu" else torch.float32)
print("tải mô hình:", round(time.time() - t0), "giây, thiết bị", dev, flush=True)

LINES = [
    "Thưa quý đồng nghiệp, đây là thay đổi quan trọng nhất của định nghĩa lần thứ năm: phân loại bằng con số được thay thế hoàn toàn.",
    "Nhồi máu cơ tim nay được xếp vào một trong ba bối cảnh lâm sàng.",
    "Thứ nhất, nhồi máu cơ tim nguyên phát, xảy ra tự phát do một bệnh lý mạch vành cấp tính nguyên phát. Phần lớn là xơ vữa huyết khối, nhưng cũng bao gồm các bệnh lý mạch vành cấp khác.",
    "Thứ hai, nhồi máu cơ tim thứ phát, do mất cân bằng cung cầu oxy cơ tim, gây ra bởi một bệnh cấp tính khác.",
    "Thứ ba, nhồi máu cơ tim liên quan thủ thuật, là biến chứng của bất kỳ thủ thuật tim nào, qua da hay phẫu thuật, trong vòng ba mươi ngày.",
    "Xin quý vị lưu ý: không có một tiêu chuẩn đơn lẻ nào đủ để khẳng định nhồi máu cơ tim cấp.",
]
VOICES = {
    "nam": "male, middle-aged, low pitch",
    "nu":  "female, middle-aged, moderate pitch",
}
GAP = np.zeros(int(0.35 * 24000), dtype=np.float32)
info = {}
for name, ins in VOICES.items():
    t = time.time(); parts = []
    try:
        first = model.generate(text=LINES[0], instruct=ins)[0]
        ref = f"{OUT}/{name}-ref.wav"; sf.write(ref, first, 24000)
        parts += [np.asarray(first, dtype=np.float32), GAP]
        for ln in LINES[1:]:
            a = model.generate(text=ln, ref_audio=ref, ref_text=LINES[0])[0]
            parts += [np.asarray(a, dtype=np.float32), GAP]
            print(" ", name, "câu xong", round(time.time() - t), "s", flush=True)
        full = np.concatenate(parts)
        sf.write(f"{OUT}/{name}.wav", full, 24000)
        info[name] = {"instruct": ins, "audio_s": round(len(full) / 24000, 1), "gen_s": round(time.time() - t, 1)}
    except Exception as e:
        import traceback; traceback.print_exc()
        info[name] = {"instruct": ins, "error": repr(e)}
    print(name, info[name], flush=True)
json.dump({"lines": LINES, "voices": info}, open(f"{OUT}/info.json", "w"), ensure_ascii=False, indent=1)
