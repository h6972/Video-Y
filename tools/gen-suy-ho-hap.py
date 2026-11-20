# -*- coding: utf-8 -*-
"""Sinh kịch bản loạt video "Suy hô hấp cấp: oxy, HFNC và thông khí không xâm nhập" (6 phần + 3 ca).
Nội dung lấy từ chuyên đề đã kiểm trích dẫn: YKhoa-Workspace/08_ChuyenDe/suy-ho-hap-cap-2026 (ban-goc.md, chuyen-de/md/).
Chạy: python tools/gen-suy-ho-hap.py  → projects/suy-ho-hap-cap-phan-N/script.json, projects/suy-ho-hap-cap-ca-K/script.json
Phần nội dung từng video nằm ở tools/shh/pN.py, caK.py.
"""
import importlib.util, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, "tools", "shh")
TEN = "Suy hô hấp cấp"
PHAN = ["Sinh lý bệnh: vì sao người bệnh thiếu oxy", "Đánh giá và dự báo thất bại", "Oxy là thuốc: đích SpO₂ và dụng cụ",
        "Oxy dòng cao qua cannula mũi", "CPAP, thông khí không xâm nhập và helmet", "Chọn hỗ trợ theo bệnh cảnh và thời điểm đặt nội khí quản"]
THEME = {1: "sinh-ly", 2: "sinh-ly", 3: "", 4: "", 5: "may-tho", 6: ""}

LEX = {
    "PaO₂/FiO₂": "PaO hai trên FiO hai", "SpO₂/FiO₂": "SpO hai trên FiO hai", "P(A–a)O₂": "chênh áp oxy phế nang động mạch",
    "PaO₂": "PaO hai", "PaCO₂": "PaCO hai", "PvCO₂": "PvCO hai", "SpO₂": "SpO hai", "SaO₂": "SaO hai", "FiO₂": "FiO hai",
    "PETCO₂": "PetCO hai", "CO₂": "CO hai", "cmH₂O": "xăng ti mét nước", "mmHg": "mi li mét thuỷ ngân", "kPa": "ki lô pát xcan",
    "L/phút": "lít mỗi phút", "mL/kg": "mi li lít mỗi ký", "mL/giây": "mi li lít mỗi giây", "g/dL": "gam mỗi đề xi lít",
    "HFNC": "oxy dòng cao qua cannula mũi", "NIV": "thông khí không xâm nhập", "CPAP": "xi páp", "IPAP": "i páp", "EPAP": "e páp",
    "PEEP": "píp", "PEEPi": "píp nội sinh", "ROX": "rốc", "HACOR": "ha co", "P-SILI": "pê si li", "ΔPes": "đen ta pê ét",
    "Vte": "thể tích khí lưu thông thở ra", "COPD": "bệnh phổi tắc nghẽn mạn tính", "ARDS": "a rờ đê ét", "NKQ": "nội khí quản",
    "BTS/ICS": "bê tê ét, i xê ét", "ERS/ATS": "e rờ ét, a tê ét", "BTS": "bê tê ét", "ERS": "e rờ ét", "ATS": "a tê ét",
    "SRLF": "ét rờ e lờ ép", "TSANZ": "tê san", "ACP": "a xê pê", "BMJ": "bê em di", "GRADE": "grết",
    "FLORALI-2": "phlo ra li hai", "FLORALI": "phlo ra li", "RENOVATE": "ri nô vết", "HENIVOT": "he ni vốt", "HELMET-COVID": "hen mét cô vít",
    "RECOVERY-RS": "ri ca vơ ri a rờ ét", "HiFlo-COVID": "hai phlô cô vít", "HIGH-WEAN": "hai uyn", "HIGH": "hai", "BiPOP": "bai póp",
    "NIVAS": "ni vát", "PREOXI": "pri ốc xi", "3CPO": "ba xê pê ô", "HF-AECOPD": "hát ép a e cốp", "LUNG SAFE": "lâng sếp",
    "ICU-ROX": "i xi u rốc", "UK-ROX": "u ca rốc", "HOT-ICU": "hót i xi u", "LOCO2": "lô cô hai", "PILOT": "pai lốt", "DETO2X": "đê tốc",
    "COVID-19": "cô vít mười chín", "Venturi": "ven tu ri", "Möller": "mơ lơ", "Mauri": "mau ri", "Carteaux": "các tô",
    "Tonelli": "tô ne li", "Confalonieri": "côn pha lô ni ê ri", "Brochard": "brô sa", "Hernández": "éc nan đét", "Esteban": "ét tê ban",
    "Lemiale": "lơ mi an", "Hilbert": "hin be", "Sjoding": "sô đinh", "Haldane": "hôn đên", "Kacmarek": "các ma rếch",
    "V/Q": "thông khí trên tưới máu", "S/F": "S trên F", "P/F": "P trên F", "DO₂": "đê O hai", "CaO₂": "xê a O hai",
}


def head(n, kind="phan", ten_ca=""):
    if kind == "phan":
        title = f"{TEN} – Phần {n}: {PHAN[n - 1]}"
        part = f"{TEN} · Phần {n}/6"
        nxt = f"Phần {n + 1}: {PHAN[n]}" if n < 6 else "Ca lâm sàng 1: viêm phổi và oxy dòng cao"
        theme = THEME[n]
        sub = "Suy hô hấp cấp · oxy, HFNC, NIV"
    else:
        title = f"{TEN} – Ca lâm sàng {n}: {ten_ca}"
        part = f"{TEN} · Ca {n}/3"
        nxt = {1: "Ca lâm sàng 2: đợt cấp COPD và NIV", 2: "Ca lâm sàng 3: sau rút ống nguy cơ cao", 3: "Trọn bộ chuyên đề: thuvienykhoa.online"}[n]
        theme = "case"
        sub = "Ca lâm sàng Hồi sức · suy hô hấp cấp"
    h = {"title": title}
    if theme:
        h["theme"] = theme
    h.update({
        "tts": "vieneu", "vieneu": {"voice": "Adam"}, "voice": "vi-VN-NamMinhNeural", "rate": "-8%",
        "series": "THƯ VIỆN Y KHOA ONLINE", "subtitle": sub, "part": part,
        "source_short": "Nguồn: ATS 2026 · ERS 2022 · ERS/ATS 2017 · BTS/ICS 2016 · BTS 2017 · SRLF-SFMU 2024 · thử nghiệm gốc · Oh's, Hall, Marino, Murray & Nadel",
        "sign": "Thư Viện Y Khoa Online",
        "lexicon": dict(sorted(LEX.items(), key=lambda kv: -len(kv[0]))),
        "brand": {"next": nxt},
    })
    return h


PAUSE = "Quý vị có thể tạm dừng video để suy nghĩ."


def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + ".py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


def main(only=None):
    jobs = [("phan", n) for n in range(1, 7)] + [("ca", k) for k in range(1, 4)]
    for kind, n in jobs:
        mod = f"p{n}" if kind == "phan" else f"ca{n}"
        if only and mod not in only:
            continue
        if not os.path.exists(os.path.join(HERE, mod + ".py")):
            continue
        m = load(mod)
        d = head(n, kind, getattr(m, "TEN_CA", ""))
        d["scenes"] = m.scenes(PAUSE)
        for i, s in enumerate(d["scenes"], 1):
            s.setdefault("id", f"s{i:02d}")
        out = os.path.join(ROOT, "projects", f"suy-ho-hap-cap-{'phan' if kind == 'phan' else 'ca'}-{n}")
        os.makedirs(out, exist_ok=True)
        with open(os.path.join(out, "script.json"), "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False, indent=1)
        words = sum(len(l.split()) for s in d["scenes"] for l in s["lines"])
        print(out, len(d["scenes"]), "cảnh", words, "từ, ~", round(words / 140, 1), "phút")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
