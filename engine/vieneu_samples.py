"""Thử các giọng miền Nam của VieNeu-TTS v3 Turbo (~1 phút mỗi giọng), chạy CPU."""
import os, time, json
import onnxruntime; print("onnxruntime", onnxruntime.__version__, flush=True)
from vieneu import Vieneu
OUT = os.path.abspath(os.environ.get("OUT", "samples")); os.makedirs(OUT, exist_ok=True)
t0 = time.time(); tts = Vieneu(); print("tải mô hình:", round(time.time() - t0), "giây", flush=True)
try: print("giọng có sẵn:", tts.list_preset_voices(), flush=True)
except Exception as e: print("list voices lỗi", e)
LINES = [
    "Thưa quý đồng nghiệp, đây là thay đổi quan trọng nhất của định nghĩa lần thứ năm: phân loại bằng con số được thay thế hoàn toàn.",
    "Nhồi máu cơ tim nay được xếp vào một trong ba bối cảnh lâm sàng.",
    "Thứ nhất, nhồi máu cơ tim nguyên phát, xảy ra tự phát do một bệnh lý mạch vành cấp tính nguyên phát. Phần lớn là xơ vữa huyết khối, nhưng cũng bao gồm các bệnh lý mạch vành cấp khác.",
    "Thứ hai, nhồi máu cơ tim thứ phát, do mất cân bằng cung cầu oxy cơ tim, gây ra bởi một bệnh cấp tính khác.",
    "Thứ ba, nhồi máu cơ tim liên quan thủ thuật, là biến chứng của bất kỳ thủ thuật tim nào, qua da hay phẫu thuật, trong vòng ba mươi ngày.",
    "Xin quý vị lưu ý: không có một tiêu chuẩn đơn lẻ nào đủ để khẳng định nhồi máu cơ tim cấp.",
]
VOICES = ["Adam", "Thái Sơn", "Minh Triết", "Đức Trí", "Thục Đoan", "Mỹ Duyên", "Kim Thanh", "Thùy Dung"]
import numpy as np, soundfile as sf
info = {}
for v in VOICES:
    t = time.time(); parts = []
    try:
        for ln in LINES:
            a = tts.infer(ln, voice=v)
            p = f"{OUT}/_tmp.wav"; tts.save(a, p)
            x, sr = sf.read(p, dtype="float32"); parts += [x, np.zeros(int(0.35 * sr), dtype="float32")]
        full = np.concatenate(parts); name = v.replace(" ", "-")
        sf.write(f"{OUT}/{name}.wav", full, sr)
        info[v] = {"audio_s": round(len(full) / sr, 1), "gen_s": round(time.time() - t, 1), "sr": sr}
    except Exception as e:
        import traceback; traceback.print_exc(); info[v] = {"error": repr(e)[:400]}
    print(v, info[v], flush=True)
if os.path.exists(f"{OUT}/_tmp.wav"): os.remove(f"{OUT}/_tmp.wav")
json.dump(info, open(f"{OUT}/info.json", "w"), ensure_ascii=False, indent=1)
