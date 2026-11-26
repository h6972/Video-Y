# -*- coding: utf-8 -*-
"""Sinh kịch bản loạt video "Tiếp cận sốc" (6 phần + 2 ca + video ngắn).
Nội dung lấy từ chuyên đề đã kiểm liều và trích dẫn: YKhoa-Workspace/08_ChuyenDe/tiep-can-soc-2026 (ban-goc.md, chuyen-de/md/).
Chạy: python tools/gen-tiep-can-soc.py [p1 ca1 n3 ...] → projects/tiep-can-soc-{phan,ca,ngan}-N/script.json
Nội dung từng video ở tools/tcs/pN.py, caK.py, ngan.py (video ngắn dọc).
"""
import importlib.util, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, "tools", "tcs")
TEN = "Tiếp cận sốc"
PHAN = ["Sốc là gì: định nghĩa mới và sinh lý tuần hoàn", "Nhận diện sốc và xếp thể sốc tại giường",
        "Theo dõi huyết động và đáp ứng dịch", "Dịch và mục tiêu huyết áp",
        "Thuốc vận mạch và tăng co bóp", "Sốc kháng trị và thuốc cứu vãn"]
THEME = {1: "sinh-ly", 2: "", 3: "", 4: "", 5: "", 6: ""}
CA = {1: "sốc chưa rõ thể", 2: "sốc nhiễm khuẩn kháng trị"}
SRC = "Nguồn: ESICM 2025 · ESICM dịch 2024–2025 · SCCM/ESICM 2026 · SSC 2026 · SCAI 2026 · thử nghiệm gốc · Oh's, Textbook of Critical Care, Guyton"

LEX = {
    "ANDROMEDA-SHOCK-2": "an đờ rô mê đa sốc hai", "ANDROMEDA-SHOCK": "an đờ rô mê đa sốc", "SEPSIS-ACT": "sép xít ắc",
    "SEPSISPAM": "sép xít pam", "LeoPARDS": "lê ô pát", "SOAP II": "xốp hai", "ProCESS": "prô xét", "ProMISe": "prô mít",
    "ATHOS-3": "a thốt ba", "VASSPR": "vát pờ", "VASST": "vát", "VANISH": "va nít", "CENSER": "xen xơ", "CATS": "cát ét",
    "ARISE": "a rai", "S(c)vO₂": "ét xê vê ô hai", "Pv-aCO₂": "chênh áp CO hai tĩnh mạch động mạch", "ScvO₂": "ét xê vê ô hai",
    "SvO₂": "ét vê ô hai", "PaO₂/FiO₂": "PaO hai trên FiO hai", "µg/kg/phút": "mi crô gam mỗi ký mỗi phút",
    "ng/kg/phút": "na nô gam mỗi ký mỗi phút", "mg/kg/giờ": "mi li gam mỗi ký mỗi giờ", "mL/kg/giờ": "mi li lít mỗi ký mỗi giờ",
    "mL/giờ": "mi li lít mỗi giờ", "U/phút": "đơn vị mỗi phút", "mmol/L": "mi li mol mỗi lít", "mL/kg": "mi li lít mỗi ký",
    "mmHg": "mi li mét thuỷ ngân", "mEq/L": "mi li đương lượng mỗi lít", "ESICM": "e ét i xê em", "SCCM": "ét xê xê em",
    "SCAI": "ét cai", "RUSH": "rớt", "GRADE": "grết", "ARDS": "a rờ đê ét", "G6PD": "gờ sáu pê đê", "VExUS": "véc xớt",
    "EVLW": "nước ngoài mạch phổi", "PVPI": "chỉ số tính thấm mạch phổi", "LVOT": "đường ra thất trái", "VTI": "vê tê i",
    "EEOT": "nghiệm pháp ngưng cuối thì thở ra", "PLR": "nâng chân thụ động", "PPV": "pê pê vê", "SVV": "ét vê vê",
    "CVP": "xê vê pê", "MAP": "mắp", "NEE": "liều tương đương norepinephrine", "SSC": "ét ét xê", "DO₂": "đê ô hai",
    "VO₂": "vê ô hai", "CO₂": "CO hai", "Pmsf": "áp lực đổ đầy hệ thống trung bình", "SSRI": "thuốc ức chế tái hấp thu serotonin",
    "EGDT": "hồi sức theo mục tiêu sớm", "VIP": "vi ai pi", "ROSE": "rôs", "AT1": "a tê một", "V1": "vê một", "V2": "vê hai",
    "α1": "an pha một", "β1": "bê ta một", "β2": "bê ta hai", "PDE3": "phốt pho đi e xte ra ba", "ATP": "a tê pê", "SpO₂": "SpO hai",
    "Hinshaw": "hin sô", "Guyton": "gai tơn", "Rivers": "ri vơ", "Vincent": "vanh xăng", "De Backer": "đơ ba kê", "Monnet": "mô nê",
    "Ince": "in xơ", "Malbrain": "man brên", "Legrand": "lơ gran", "Kotani": "cô ta ni", "Goradia": "gô ra đi a", "Yerke": "giơ kơ",
    "Ibarra-Estrada": "i ba ra ét tra đa", "Rodríguez-Lima": "rô đri ghét li ma", "Brokmeier": "brốc mai ơ", "Leone": "lê ô nê",
    "VANCS II": "van cờ hai", "SOFA-2": "sô pha hai", "FAST": "phát", "CT": "xê tê", "Jentzer": "giên dơ", "Lajoye": "la gioa", "Tschoellitsch": "sô lít", "Miller": "mi lơ", "Perera": "pê rê ra",
}


def head(n, kind="phan"):
    if kind == "phan":
        title = f"{TEN} – Phần {n}: {PHAN[n - 1]}"
        part = f"{TEN} · Phần {n}/6"
        nxt = f"Phần {n + 1}: {PHAN[n]}" if n < 6 else "Ca lâm sàng 1: sốc chưa rõ thể"
        theme = THEME[n]
        sub = "Tiếp cận sốc · seri Sốc (1)"
    elif kind == "ca":
        title = f"{TEN} – Ca lâm sàng {n}: {CA[n]}"
        part = f"{TEN} · Ca {n}/2"
        nxt = "Ca lâm sàng 2: sốc nhiễm khuẩn kháng trị" if n == 1 else "Trọn bộ chuyên đề: thuvienykhoa.online"
        theme = "case"
        sub = "Ca lâm sàng Hồi sức · sốc"
    else:
        title = f"{TEN} – video ngắn {n}"
        part = f"{TEN} · Video ngắn"
        nxt = "Trọn bài giảng: link ở bio · bình luận ghim"
        theme = ""
        sub = "Tiếp cận sốc"
    h = {"title": title}
    if theme:
        h["theme"] = theme
    h.update({"tts": "vieneu", "vieneu": {"voice": "Adam"}, "voice": "vi-VN-NamMinhNeural", "rate": "-8%",
              "series": "THƯ VIỆN Y KHOA ONLINE", "subtitle": sub, "part": part, "source_short": SRC,
              "sign": "Thư Viện Y Khoa Online", "lexicon": dict(sorted(LEX.items(), key=lambda kv: -len(kv[0]))),
              "brand": {"next": nxt}})
    if kind == "ngan":
        h["format"] = "vertical"
        h["vieneu"] = {"voice": "Mỹ Duyên", "tempo": 1.15}
        h["brand"] = {"intro": False, "outro_s": 3.5, "next": nxt}
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
    for n in range(1, 7):
        if (not only or f"p{n}" in only) and os.path.exists(os.path.join(HERE, f"p{n}.py")):
            d = head(n); d["scenes"] = load(f"p{n}").scenes(PAUSE); write(d, f"tiep-can-soc-phan-{n}")
    for k in (1, 2):
        if (not only or f"ca{k}" in only) and os.path.exists(os.path.join(HERE, f"ca{k}.py")):
            d = head(k, "ca"); d["scenes"] = load(f"ca{k}").scenes(PAUSE); write(d, f"tiep-can-soc-ca-{k}")
    if os.path.exists(os.path.join(HERE, "ngan.py")):
        ng = load("ngan").VIDEOS
        for k, sc in enumerate(ng, 1):
            if not only or f"n{k}" in only:
                d = head(k, "ngan"); d["scenes"] = sc; write(d, f"tiep-can-soc-ngan-{k}")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
