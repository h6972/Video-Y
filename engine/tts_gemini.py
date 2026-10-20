"""Giọng đọc Gemini TTS (chạy trên GitHub). Mỗi câu một lần gọi để khớp slide.
Cấu hình trong script.json: "tts": "gemini", "gemini": {"voice": "Algieba", "model": "...", "style": "..."}"""
import os, sys, json, base64, wave, time, urllib.request, urllib.error

D = os.path.abspath(sys.argv[1])
S = json.load(open(os.path.join(D, "script.json"), encoding="utf-8"))
KEY = os.environ["GEMINI_API_KEY"]
cfg = {"voice": "Algieba", "model": "gemini-3.8-flash-tts",
       "style": ("Hãy đọc câu sau bằng tiếng Việt với giọng nam trung niên miền Nam Việt Nam (giọng Sài Gòn), "
                 "như một giảng viên y khoa cao cấp đang giảng cho các bác sĩ: điềm đạm, ấm, truyền cảm, rõ ràng, "
                 "tốc độ vừa phải, ngắt nghỉ tự nhiên ở dấu phẩy, nhấn nhẹ vào các ý chính:")}
cfg.update(S.get("gemini", {}))
FALLBACK = [cfg["model"], "gemini-3.8-flash-lite-tts", "gemini-3.1-flash-tts-preview"]

LEX = {"SARS-CoV-2": "sa sờ cô vi hai", "RSV": "a ét vi", "RT-PCR": "a tê pê xê a", "H3N2": "hát ba en hai"}
LEX.update(S.get("lexicon", {}))
def spoken(t):
    for k, v in LEX.items(): t = t.replace(k, v)
    return t

def call(model, text):
    body = {"contents": [{"parts": [{"text": cfg["style"] + "\n\n" + text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": cfg["voice"]}}}}}
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": KEY})
    with urllib.request.urlopen(req, timeout=300) as r:
        p = json.load(r)["candidates"][0]["content"]["parts"][0]["inlineData"]
    return base64.b64decode(p["data"]), p.get("mimeType", "")

def save(path, data, mime):
    if data[:4] == b"RIFF":            # đã là WAV
        open(path, "wb").write(data); return
    rate = 24000
    if "rate=" in mime: rate = int(mime.split("rate=")[1].split(";")[0])
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(data)

out = os.path.join(D, "audio"); os.makedirs(out, exist_ok=True)
jobs = [(sc["id"], i, ln) for sc in S["scenes"] for i, ln in enumerate(sc["lines"])]
mi = 0
for k, (sid, i, ln) in enumerate(jobs, 1):
    p = os.path.join(out, f"{sid}_{i+1}.wav")
    if os.path.exists(p): continue
    for attempt in range(8):
        try:
            data, mime = call(FALLBACK[mi], spoken(ln)); save(p, data, mime); break
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            print(f"  {sid}_{i+1} lỗi HTTP {e.code} ({FALLBACK[mi]}): {msg}", flush=True)
            if e.code == 404 and mi < len(FALLBACK) - 1: mi += 1; continue
            time.sleep(min(120, 15 * (attempt + 1)))
        except Exception as e:
            print(f"  {sid}_{i+1} lỗi: {e!r}", flush=True); time.sleep(10)
    else:
        sys.exit(f"Không tạo được giọng cho {sid}_{i+1} (có thể hết hạn mức miễn phí trong ngày)")
    print(f"[{k}/{len(jobs)}] {sid}_{i+1} · {FALLBACK[mi]}", flush=True)
    time.sleep(4)
