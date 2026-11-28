# -*- coding: utf-8 -*-
"""Sinh kịch bản loạt video "Sốc tắc nghẽn" (4 phần).
Nội dung lấy từ chuyên đề đã kiểm liều và trích dẫn: YKhoa-Workspace/08_ChuyenDe/soc-tac-nghen-2026 (ban-goc.md, chuyen-de/md/).
Chạy: python tools/gen-soc-tac-nghen.py [p1 p2 ...] → projects/soc-tac-nghen-phan-N/script.json
Nội dung từng phần ở tools/stn/pN.py.
"""
import importlib.util, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, "tools", "stn")
TEN = "Sốc tắc nghẽn"
PHAN = ["Sinh lý bệnh và nhận diện tại giường", "Thuyên tắc phổi nguy cơ cao: phân tầng và hồi sức thất phải",
        "Thuyên tắc phổi: tái tưới máu và hỗ trợ cơ học", "Chèn ép tim, tràn khí màng phổi áp lực và lưu đồ tại giường"]
THEME = {1: "sinh-ly", 2: "", 3: "", 4: ""}
SRC = "Nguồn: AHA/ACC 2026 · ESC/ERS 2019 · ESC 2025 · HFA/ESC 2016 · ERC 2021 · BTS 2023 · WSACS 2013 · PEITHO, HI-PEITHO, STORM-PE, PEERLESS · tổng quan Spodick, Zotzmann, Leigh-Smith, Roberts"

LEX = {
    "HI-PEITHO": "hai pây thô", "PEITHO-3": "pây thô ba", "PEITHO": "pây thô", "STORM-PE": "xtom pê e", "PEERLESS": "pia lét",
    "MOPETT": "mô pét", "ULTIMA": "un ti ma", "SEATTLE II": "xi a tồ hai", "FLARE": "phle", "FLASH": "phlát",
    "AHA/ACC": "a hát a, a xê xê", "VA-ECMO": "ếch mô tĩnh mạch động mạch", "ECMO": "ếch mô", "sPESI": "ét pê si", "PESI": "pê si",
    "ESC/ERS": "e ét xê", "ESICM": "e ét i xê em", "ESC": "e ét xê", "ERC": "e rờ xê", "BTS": "bê tê ét", "WSACS": "hội hội chứng khoang bụng thế giới",
    "RUSH": "rớt", "PERT": "pớt", "TAPSE": "táp xi", "VTI": "vê tê i", "GUSTO": "gút tô", "ISTH": "i ét tê hát", "SCAI": "ét cai",
    "SpO₂": "SpO hai", "CO₂": "CO hai", "µg/kg/phút": "mi crô gam mỗi ký mỗi phút", "IU/kg": "đơn vị mỗi ký", "mL/kg": "mi li lít mỗi ký",
    "mmHg": "mi li mét thuỷ ngân", "mmol/L": "mi li mol mỗi lít", "cmH₂O": "xăng ti mét nước", "mg/kg": "mi li gam mỗi ký",
    "Spodick": "xpô đích", "Zotzmann": "dốt man", "Leigh-Smith": "li xmít", "Harjola": "hác giô la", "Ristić": "ri xtích",
    "Tsang": "xang", "Laan": "lan", "Chatterjee": "chát tơ ri", "Marti": "mác ti", "Kmiec": "cờ miếc", "Hestia": "hét ti a", "Bova": "bô va",
    "Mayo Clinic": "mây ô cờ li ních", "PEEP": "píp", "aPTT": "a pê tê tê", "Impella RP": "im pe la rờ pê", "14 G": "mười bốn gờ", "ICU": "hồi sức", "type A": "típ A", "SaO₂": "SaO hai", "McConnell": "mắc cô nồ", "NEWS2": "niu hai", "RIETE": "ri ê tê",
}


def head(n):
    title = f"{TEN} – Phần {n}: {PHAN[n - 1]}"
    part = f"{TEN} · Phần {n}/4"
    nxt = f"Phần {n + 1}: {PHAN[n]}" if n < 4 else "Trọn bộ chuyên đề: thuvienykhoa.online"
    h = {"title": title}
    if THEME[n]:
        h["theme"] = THEME[n]
    h.update({"tts": "vieneu", "vieneu": {"voice": "Adam"}, "voice": "vi-VN-NamMinhNeural", "rate": "-8%",
              "series": "THƯ VIỆN Y KHOA ONLINE", "subtitle": "Sốc tắc nghẽn · seri Sốc (5)", "part": part, "source_short": SRC,
              "sign": "Thư Viện Y Khoa Online", "lexicon": dict(sorted(LEX.items(), key=lambda kv: -len(kv[0]))),
              "brand": {"next": nxt}})
    return h


PAUSE = "Quý vị có thể tạm dừng video để suy nghĩ."


def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + ".py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


def write(d, slug):
    for i, s in enumerate(d["scenes"], 1):
        s.setdefault("id", f"s{i:02d}")
    out = os.path.join(ROOT, "projects", slug)
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "script.json"), "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    words = sum(len(l.split()) for s in d["scenes"] for l in s["lines"])
    print(slug, len(d["scenes"]), "cảnh", words, "từ, ~", round(words / 140, 1), "phút")


def main(only=None):
    for n in range(1, 5):
        if (not only or f"p{n}" in only) and os.path.exists(os.path.join(HERE, f"p{n}.py")):
            d = head(n); d["scenes"] = load(f"p{n}").scenes(PAUSE); write(d, f"soc-tac-nghen-phan-{n}")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
