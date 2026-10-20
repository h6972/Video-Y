"""Tạo nhiều giọng ứng viên (voice design, mỗi giọng một hạt giống ngẫu nhiên) để chọn giọng chuẩn.
Dùng: python engine/tim_giong.py [số giọng nam] [số giọng nữ]   (mặc định 6 nam, 6 nữ)"""
import os, sys, time, torch, soundfile as sf
from omnivoice import OmniVoice

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "giong-ung-vien"); os.makedirs(OUT, exist_ok=True)
n_nam = int(sys.argv[1]) if len(sys.argv) > 1 else 6
n_nu = int(sys.argv[2]) if len(sys.argv) > 2 else 6
TEXT = "Thưa quý đồng nghiệp, hôm nay chúng ta sẽ cùng nhau phân tích những điểm mới quan trọng nhất của hướng dẫn này."
open(os.path.join(OUT, "loi-doc.txt"), "w", encoding="utf-8").write(TEXT)

dev = "cuda:0" if torch.cuda.is_available() else "cpu"
model = OmniVoice.from_pretrained("g-group-ai-lab/g-omnivoice", device_map=dev,
                                  dtype=torch.float16 if dev != "cpu" else torch.float32)
plan = [("nam", "male, middle-aged, low pitch", k) for k in range(1, n_nam + 1)] + \
       [("nu", "female, middle-aged, moderate pitch", k) for k in range(1, n_nu + 1)]
for g, ins, k in plan:
    name = f"{g}-{k:02d}"
    p = os.path.join(OUT, name + ".wav")
    if os.path.exists(p): continue
    seed = 1000 * (g == "nu") + k * 37
    torch.manual_seed(seed)
    if dev != "cpu": torch.cuda.manual_seed_all(seed)
    t = time.time()
    sf.write(p, model.generate(text=TEXT, instruct=ins)[0], 24000)
    print(f"{name} xong ({round(time.time()-t)} giây)", flush=True)
print("\nNghe các file trong thư mục:", OUT)
print("Chọn giọng ưng ý rồi chạy:  chon-giong.bat nam-03   (thay bằng tên file anh chọn)")
