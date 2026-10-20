"""Tính thời lượng từng câu/cảnh từ kịch bản (hoặc từ file MP3 thật nếu có) và
ghép vào template HTML -> video.html. Xuất thêm SSML cho Microsoft TTS."""
import json, re, os, sys, subprocess
from xml.sax.saxutils import escape

D = os.path.abspath(sys.argv[1])  # thư mục dự án video
S = json.load(open(os.path.join(D, "script.json"), encoding="utf-8"))

SYL_PER_SEC = S.get("syl_per_sec", 4.0)      # tốc độ đọc ước tính khi chưa có audio thật
LINE_GAP = 0.35
HEAD, TAIL = 0.7, 0.9

SUB = [
    ("từ hai trăm chín mươi nghìn đến sáu trăm năm mươi nghìn", "290.000–650.000"),
    ("ba đến năm triệu", "3–5 triệu"), ("một tỷ", "1 tỷ"),
    ("mười đến mười lăm phần trăm", "10–15%"), ("mười đến mười lăm phút", "10–15 phút"),
    ("H A", "HA"), ("N A", "NA"), ("bốn mươi tám giờ", "48 giờ"),
    ("ngày hai mươi tám", "ngày 28"), ("hai phẩy mười bảy phần trăm", "2,17%"),
    ("mười một phẩy bảy mươi sáu phần trăm", "11,76%"),
    ("ba mươi đến tám mươi ba phần trăm", "30–83%"),
]

SUB += [tuple(x) for x in S.get("display", [])]

def subtitle(text):
    for a, b in SUB:
        text = text.replace(a, b)
    return text

def chunks(text, maxc=88):
    """Chia câu dài thành các mảnh phụ đề, ưu tiên cắt ở dấu phẩy/hai chấm."""
    if len(text) <= maxc:
        return [text]
    parts = re.split(r"(?<=[,:;])\s+", text)
    out, cur = [], ""
    for p in parts:
        if cur and len(cur) + 1 + len(p) > maxc:
            out.append(cur); cur = p
        else:
            cur = (cur + " " + p).strip()
    if cur: out.append(cur)
    final = []
    for c in out:   # mảnh vẫn quá dài -> cắt theo từ
        while len(c) > maxc + 20:
            cut = c.rfind(" ", 0, maxc)
            final.append(c[:cut]); c = c[cut + 1:]
        final.append(c)
    return final

def audio_len(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True, text=True)
    return float(r.stdout.strip())

t = 0.0
for sc in S["scenes"]:
    sc["start"] = round(t, 3)
    local = HEAD
    audio_dir = os.path.join(D, "audio")
    sc_lines = []
    for i, line in enumerate(sc["lines"]):
        mp3 = os.path.join(audio_dir, f"{sc['id']}_{i+1}.mp3")
        dur = audio_len(mp3) if os.path.exists(mp3) else len(line.split()) / SYL_PER_SEC
        sub = subtitle(line)
        pieces = chunks(sub)
        total = sum(len(p) for p in pieces)
        pt = local
        subs = []
        for p in pieces:
            pd = dur * len(p) / total
            subs.append({"t0": round(pt, 3), "t1": round(pt + pd, 3), "text": p})
            pt += pd
        sc_lines.append({"t0": round(local, 3), "t1": round(local + dur, 3), "subs": subs,
                         "say": line, "mp3": f"{sc['id']}_{i+1}.mp3"})
        local += dur + LINE_GAP
    sc["L"] = sc_lines
    sc["dur"] = round(local - LINE_GAP + TAIL, 3)
    t += sc["dur"]
S["total"] = round(t, 3)

json.dump(S, open(os.path.join(D, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
tp = os.path.join(D, "template.html")
if not os.path.exists(tp):  # bài giảng dạng slide dùng khung chung
    tp = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lecture.html")
tpl = open(tp, encoding="utf-8").read()
open(os.path.join(D, "video.html"), "w", encoding="utf-8").write(
    tpl.replace("/*__TIMELINE__*/null", json.dumps(S, ensure_ascii=False)))

# ---- SSML cho Microsoft TTS: 1 file / cảnh, mỗi câu là 1 khối riêng ----
os.makedirs(os.path.join(D, "ssml"), exist_ok=True)
LEX = {  # cách đọc thuật ngữ
    "SARS-CoV-2": "sa sờ cô vi hai", "RSV": "a ét vi", "RT-PCR": "a tê pê xê a",
    "H3N2": "hát ba en hai",
}
def to_ssml(line):
    x = escape(line)
    for k, v in LEX.items():
        x = x.replace(escape(k), f'<sub alias="{v}">{escape(k)}</sub>')
    return x

full = []
for sc in S["scenes"]:
    for i, ln in enumerate(sc["L"]):
        body = (f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="vi-VN">'
                f'<voice name="{S["voice"]}"><prosody rate="{S["rate"]}">{to_ssml(ln["say"])}</prosody></voice></speak>')
        open(os.path.join(D, "ssml", f"{sc['id']}_{i+1}.ssml"), "w", encoding="utf-8").write(body)
    full.append(f'<!-- {sc["id"]} · {sc["chapter"]} -->\n' + "\n".join(
        f'<p>{to_ssml(l["say"])}</p><break time="350ms"/>' for l in sc["L"]))
open(os.path.join(D, "kich-ban-full.ssml"), "w", encoding="utf-8").write(
    f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="vi-VN">\n'
    f'<voice name="{S["voice"]}"><prosody rate="{S["rate"]}">\n' + "\n<break time=\"800ms\"/>\n".join(full) +
    "\n</prosody></voice></speak>\n")
print("total", S["total"], [(s["id"], s["dur"]) for s in S["scenes"]])
