"""Thử giọng Gemini TTS (~1 phút) với lời chỉ đạo giọng miền Nam, phong cách giảng viên."""
import os, json, base64, wave, urllib.request, urllib.error, time

KEY = os.environ["GEMINI_API_KEY"]
OUT = os.path.abspath(os.environ.get("OUT", "samples")); os.makedirs(OUT, exist_ok=True)
MODELS = ["gemini-3.8-flash-tts", "gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"]
TEXT = (
    "Thưa quý đồng nghiệp, đây là thay đổi quan trọng nhất của định nghĩa lần thứ năm: phân loại bằng con số được thay thế hoàn toàn. "
    "Nhồi máu cơ tim nay được xếp vào một trong ba bối cảnh lâm sàng. "
    "Thứ nhất, nhồi máu cơ tim nguyên phát, xảy ra tự phát do một bệnh lý mạch vành cấp tính nguyên phát. Phần lớn là xơ vữa huyết khối, nhưng cũng bao gồm các bệnh lý mạch vành cấp khác. "
    "Thứ hai, nhồi máu cơ tim thứ phát, do mất cân bằng cung cầu oxy cơ tim, gây ra bởi một bệnh cấp tính khác. "
    "Thứ ba, nhồi máu cơ tim liên quan thủ thuật, là biến chứng của bất kỳ thủ thuật tim nào, qua da hay phẫu thuật, trong vòng ba mươi ngày. "
    "Xin quý vị lưu ý: không có một tiêu chuẩn đơn lẻ nào đủ để khẳng định nhồi máu cơ tim cấp.")
STYLE_NAM = ("Hãy đọc đoạn sau bằng tiếng Việt với giọng {who} miền Nam Việt Nam (giọng Sài Gòn), "
             "như một giảng viên y khoa cao cấp đang giảng cho các bác sĩ: điềm đạm, ấm, truyền cảm, rõ ràng, "
             "tốc độ vừa phải, ngắt nghỉ tự nhiên ở dấu phẩy, nhấn nhẹ vào các ý chính:\n\n")
VOICES = [("charon-nam", "Charon", "nam trung niên"), ("orus-nam", "Orus", "nam trung niên"),
          ("algieba-nam", "Algieba", "nam trung niên"), ("kore-nu", "Kore", "nữ trung niên")]

def call(model, voice, prompt):
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": KEY})
    with urllib.request.urlopen(req, timeout=300) as r:
        d = json.load(r)
    part = d["candidates"][0]["content"]["parts"][0]["inlineData"]
    return base64.b64decode(part["data"]), part.get("mimeType", "")

info = {}
model_ok = None
for name, voice, who in VOICES:
    prompt = STYLE_NAM.format(who=who) + TEXT
    for model in ([model_ok] if model_ok else MODELS):
        t = time.time()
        try:
            pcm, mime = call(model, voice, prompt)
            with wave.open(f"{OUT}/{name}.wav", "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
            model_ok = model
            info[name] = {"model": model, "voice": voice, "mime": mime, "audio_s": round(len(pcm) / 48000, 1), "gen_s": round(time.time() - t, 1)}
            break
        except urllib.error.HTTPError as e:
            info[name] = {"model": model, "error": f"HTTP {e.code}: {e.read().decode()[:600]}"}
        except Exception as e:
            info[name] = {"model": model, "error": repr(e)[:600]}
    print(name, info[name], flush=True)
    time.sleep(8)
json.dump(info, open(f"{OUT}/info.json", "w"), ensure_ascii=False, indent=1)
