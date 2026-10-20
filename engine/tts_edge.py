"""Giọng đọc Microsoft qua edge-tts (miễn phí, không cần key).
Đọc timeline.json của dự án, tạo audio/<cảnh>_<câu>.mp3 cho từng câu."""
import asyncio, json, os, sys
import edge_tts

D = os.path.abspath(sys.argv[1])
S = json.load(open(os.path.join(D, "timeline.json"), encoding="utf-8"))
OUT = os.path.join(D, "audio")
os.makedirs(OUT, exist_ok=True)

# cách đọc thuật ngữ (thêm vào script.json -> "lexicon" để mở rộng)
LEX = {"SARS-CoV-2": "sa sờ cô vi hai", "RSV": "a ét vi", "RT-PCR": "a tê pê xê a",
       "H3N2": "hát ba en hai"}
LEX.update(S.get("lexicon", {}))

def spoken(text):
    for k, v in LEX.items():
        text = text.replace(k, v)
    return text

async def one(text, path, voice, rate, tries=7):
    for i in range(tries):
        r = rate if i < 4 else "+0%"          # lần sau cùng bỏ tham số tốc độ
        try:
            await edge_tts.Communicate(spoken(text), voice, rate=r).save(path)
            if os.path.getsize(path) > 1000:
                return
        except Exception as e:
            print("  thử lại:", os.path.basename(path), type(e).__name__, e, flush=True)
        await asyncio.sleep(min(90, 5 * 2 ** i))
    sys.exit(f"Không tạo được giọng cho {os.path.basename(path)}")

async def main():
    print('edge-tts', getattr(edge_tts, '__version__', '?'), flush=True)
    voice, rate = S["voice"], S.get("rate", "+0%")
    for sc in S["scenes"]:
        for ln in sc["L"]:
            p = os.path.join(OUT, ln["mp3"])
            if os.path.exists(p):
                continue
            await one(ln["say"], p, voice, rate)
            print("xong:", ln["mp3"])

asyncio.run(main())
