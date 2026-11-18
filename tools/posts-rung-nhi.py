# -*- coding: utf-8 -*-
"""Sinh posts/rung-nhi.md (Facebook, TikTok, YouTube) cho loạt "Rung nhĩ nguy cơ cao – chọn NOAC".
Mốc thời gian: chạy engine/chapters.py cho từng dự án (cần audio thật) rồi lưu vào tools/chap-rung-nhi.json."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = json.load(open(os.path.join(ROOT, "tools", "chap-rung-nhi.json"), encoding="utf8"))
WEB = "https://thuvienykhoa.online/"
NGUON = "2024 ESC AF Guidelines (Eur Heart J 2024); 2023 ACC/AHA/ACCP/HRS AF Guideline (Circulation 2024); 2021 EHRA Practical Guide on NOACs (Europace 2021); 2026 ESC Guidelines CVD and CKD; 2026 ACC Scientific Statement on DOACs; Khuyến cáo rung nhĩ VNHA 2022; các thử nghiệm gốc."
MIEN = "⚠️ Video phục vụ mục đích giáo dục cho nhân viên y tế, không thay thế hướng dẫn chính thức và đánh giá lâm sàng."

P = [
    {"ten": "Nền tảng và đánh giá nguy cơ", "phut": 10,
     "hook": "💊 Giảm liều NOAC “cho an toàn” làm tăng đột quỵ (OR 1,21) mà chảy máu không giảm!",
     "gioi": "Phần 1: bằng chứng từ 4 thử nghiệm pha 3, AVERROES, phân tích gộp Ruff, dược lý – tương tác thuốc, và đánh giá nguy cơ theo CHA2DS2-VA.",
     "y": ["4 NOAC không kém warfarin, giảm xuất huyết nội sọ (RR 0,48) nhưng tăng chảy máu tiêu hoá (RR 1,25)",
           "AVERROES: apixaban so với aspirin – đột quỵ 1,6% so với 3,7%/năm, chảy máu không khác",
           "Thải qua thận: dabigatran 80% → apixaban 27% · tương tác amiodarone, azole, ritonavir",
           "CHA2DS2-VA (ESC 2024): ≥ 2 → chống đông I C · so sánh ESC – ACC/AHA – VNHA",
           "ESC 2026: eGFR < 30 không dùng thang điểm, luôn coi nguy cơ cao"],
     "hoi": "Bà cụ 84 tuổi, 50 kg, vừa đặt stent: có chỉ định chống đông không? Đếm điểm cùng chúng tôi trong video 😉",
     "tik": "Giảm liều NOAC “cho an toàn” là sai 💊 Rung nhĩ – NOAC Phần 1: bằng chứng, dược lý, CHA2DS2-VA",
     "yt_title": "Rung nhĩ – NOAC Phần 1: Bằng chứng, dược lý, tương tác thuốc, CHA2DS2-VA",
     "yt_desc": "Phần 1 loạt bài quản lý rung nhĩ nguy cơ cao và chọn NOAC: lý do cần bàn (liều thấp sai chỉ định), bốn thử nghiệm pha 3 (RE-LY, ROCKET AF, ARISTOTLE, ENGAGE AF), AVERROES, phân tích gộp Ruff 2014, dược lý và phụ thuộc thận, tương tác thuốc hay gặp ở hồi sức, CHA2DS2-VA theo ESC 2024, so sánh ESC – ACC/AHA – VNHA, nguy cơ chảy máu và bệnh thận nặng theo ESC 2026.",
     "tags": "rung nhĩ, NOAC, DOAC, chống đông, apixaban, rivaroxaban, edoxaban, dabigatran, CHA2DS2-VA, ESC 2024, atrial fibrillation, tương tác thuốc, tim mạch, hồi sức, bài giảng y khoa, Thư Viện Y Khoa Online"},
    {"ten": "Chọn thuốc và liều", "phut": 7,
     "hook": "⚖️ Apixaban 2,5 mg “vì lớn tuổi” – đúng hay sai? Chỉ đúng khi đủ 2 trong 3 tiêu chí!",
     "gioi": "Phần 2: NOAC hay thuốc kháng vitamin K, tính chức năng thận bằng Cockcroft–Gault, bảng liều chuẩn – liều giảm và checklist 7 bước trước khi kê.",
     "y": ["NOAC ưu tiên hơn VKA (I A) – trừ van cơ học, hẹp hai lá vừa – nặng",
           "Cockcroft–Gault, không phải eGFR · ví dụ tính từng bước",
           "Liều giảm: apixaban 2/3 tiêu chí · dabigatran 110 · edoxaban 30 · rivaroxaban 15",
           "Chỗ lệch Mỹ – châu Âu – Việt Nam (dabigatran 75 mg, edoxaban CrCl > 95)",
           "Liều thấp sai chỉ định: ESC III B · ACC/AHA COR 3 có hại"],
     "hoi": "Nam 82 tuổi, 70 kg, creatinin 1,2 mg/dL đang uống apixaban 2,5 mg × 2: chỉnh liều thế nào? Đáp án trong video 😉",
     "tik": "Apixaban 2,5 mg “vì lớn tuổi”? ⚖️ Rung nhĩ – NOAC Phần 2: liều đúng tiêu chí, Cockcroft–Gault, checklist",
     "yt_title": "Rung nhĩ – NOAC Phần 2: Liều chuẩn, liều giảm, Cockcroft–Gault, checklist 7 bước",
     "yt_desc": "Phần 2 loạt bài rung nhĩ nguy cơ cao – chọn NOAC: NOAC hay thuốc kháng vitamin K, đo chức năng thận bằng Cockcroft–Gault, bảng liều chuẩn và tiêu chí giảm liều của 4 NOAC (ESC 2024), khác biệt nhãn Mỹ – châu Âu – Việt Nam, liều thấp sai chỉ định là có hại, không thêm aspirin, checklist 7 bước và một tình huống chỉnh liều apixaban.",
     "tags": "rung nhĩ, NOAC, liều apixaban, liều rivaroxaban, liều edoxaban, liều dabigatran, Cockcroft-Gault, độ thanh thải creatinin, giảm liều NOAC, ESC 2024, chống đông, tim mạch, bài giảng y khoa, Thư Viện Y Khoa Online"},
    {"ten": "Già yếu, thận, gan, chảy máu, van tim", "phut": 8,
     "hook": "🩸 Bệnh nhân lọc máu có rung nhĩ: dùng NOAC nào? ESC 2026 đã trả lời.",
     "gioi": "Phần 3: chọn NOAC cho người già yếu, bệnh thận mạn và lọc máu, tổn thương thận cấp ở hồi sức, bệnh gan, béo phì, tiền sử chảy máu và bệnh van tim.",
     "y": ["ELDERCARE-AF: edoxaban 15 mg giảm đột quỵ 6,7% → 2,3%/năm · FRAIL-AF: đổi VKA sang NOAC tăng chảy máu",
           "ESC 2026: chọn thuốc theo eGFR · lọc máu: apixaban 2,5 mg × 2 (IIb C)",
           "AKI, lọc máu liên tục: còn phân vân → heparin · không mở viên nang dabigatran",
           "Child–Pugh B tránh rivaroxaban · BMI ≥ 40: rivaroxaban hoặc apixaban",
           "INVICTUS: hẹp hai lá hậu thấp → thuốc kháng vitamin K"],
     "hoi": "Nam 70 tuổi lọc máu chu kỳ, đã quyết định chống đông: chọn thuốc nào? Đáp án trong video 😉",
     "tik": "Lọc máu + rung nhĩ: dùng gì? 🩸 Rung nhĩ – NOAC Phần 3: già yếu, thận, gan, chảy máu, van tim",
     "yt_title": "Rung nhĩ – NOAC Phần 3: Già yếu, bệnh thận mạn, lọc máu, bệnh gan, van tim",
     "yt_desc": "Phần 3 loạt bài rung nhĩ nguy cơ cao – chọn NOAC: người già yếu (ELDERCARE-AF, FRAIL-AF, ACC 2026), bệnh thận mạn theo ESC 2026, lọc máu (RENAL-AF, AXADIA-AFNET 8), tổn thương thận cấp và lọc máu liên tục ở hồi sức, bệnh gan theo Child–Pugh, béo phì và nhẹ cân, tiền sử chảy máu, bệnh van tim (RIVER, ENVISAGE-TAVI AF, INVICTUS), và một tình huống bệnh nhân lọc máu.",
     "tags": "rung nhĩ, NOAC, bệnh thận mạn, lọc máu, apixaban lọc máu, người cao tuổi, già yếu, ELDERCARE-AF, FRAIL-AF, INVICTUS, hẹp hai lá, Child-Pugh, ESC 2026, chống đông, hồi sức, Thư Viện Y Khoa Online"},
    {"ten": "Mạch vành, đột quỵ, ung thư", "phut": 8,
     "hook": "🫀 Rung nhĩ vừa đặt stent: aspirin làm tăng chảy máu gần gấp đôi (AUGUSTUS) – bỏ khi nào?",
     "gioi": "Phần 4: chống huyết khối sau PCI, bệnh mạch vành mạn, thời điểm chống đông sau nhồi máu não, sau xuất huyết nội sọ, rung nhĩ dưới lâm sàng, ung thư – và giải ca mở đầu.",
     "y": ["4 thử nghiệm sau PCI · AUGUSTUS: aspirin HR 1,89 cho chảy máu",
           "Phác đồ ESC 2024: bỏ aspirin ≤ 1 tuần, OAC + clopidogrel 6–12 tháng, rồi đơn trị",
           "Mạch vành mạn: OAC đơn trị (EPIC-CAD, AFIRE)",
           "Sau nhồi máu não: chống đông sớm hợp lý ở bệnh nhân chọn lọc (ELAN, OPTIMAS) · bẫy đọc AHA/ASA 2026",
           "PRESTIGE-AF sau xuất huyết não · ARTESIA, NOAH-AFNET 6 · NOAC trong ung thư"],
     "hoi": "Bà cụ 84 tuổi, CrCl 21, vừa đặt stent sau NSTEMI: phác đồ chống huyết khối nào? Lời giải 4 bước trong video 😉",
     "tik": "Đặt stent: bỏ aspirin khi nào? 🫀 Rung nhĩ – NOAC Phần 4: PCI, đột quỵ, xuất huyết não, ung thư",
     "yt_title": "Rung nhĩ – NOAC Phần 4: Sau PCI, mạch vành mạn, sau đột quỵ, xuất huyết não, ung thư",
     "yt_desc": "Phần 4 loạt bài rung nhĩ nguy cơ cao – chọn NOAC: bốn thử nghiệm sau PCI (PIONEER AF-PCI, RE-DUAL PCI, AUGUSTUS, ENTRUST-AF PCI), phác đồ chống huyết khối theo thời gian của ESC 2024, bệnh mạch vành mạn (AFIRE, EPIC-CAD), thời điểm chống đông sau nhồi máu não (ELAN, OPTIMAS, TIMING), AHA/ASA 2026, dùng lại chống đông sau xuất huyết não (PRESTIGE-AF), rung nhĩ dưới lâm sàng (ARTESIA, NOAH-AFNET 6), ung thư, và giải ca mở đầu.",
     "tags": "rung nhĩ, NOAC, PCI, đặt stent, bỏ aspirin, AUGUSTUS, ba thuốc chống huyết khối, bệnh mạch vành mạn, nhồi máu não, xuất huyết não, ELAN, OPTIMAS, ung thư, ESC 2024, chống đông, Thư Viện Y Khoa Online"},
    {"ten": "Thủ thuật, chảy máu và góc hồi sức", "phut": 10,
     "hook": "🚨 Đang uống NOAC mà chảy máu đe doạ tính mạng: idarucizumab, andexanet hay PCC – liều bao nhiêu?",
     "gioi": "Phần 5: ngưng NOAC trước thủ thuật, mổ cấp cứu, chuyển thuốc chống đông, phân loại và xử trí chảy máu, liều thuốc giải, và rung nhĩ mới trong nhiễm khuẩn huyết.",
     "y": ["PAUSE: bỏ 1–2 ngày, không bắc cầu heparin · số giờ ngưng theo CrCl",
           "Mổ cấp cứu, chuyển VKA ↔ NOAC ↔ heparin",
           "Phân loại chảy máu (ACC 2020) · xử trí theo mức (EHRA 2021)",
           "Idarucizumab 5 g · andexanet liều thấp/cao · PCC 50 đơn vị/kg · ANNEXA-I",
           "Rung nhĩ trong nhiễm khuẩn huyết: không chống đông thường quy giai đoạn cấp, OAC lâu dài sau đó (IIa C)"],
     "hoi": "Sốc nhiễm khuẩn, ngày 2 rung nhĩ mới, AKI, đang truyền amiodarone: có chống đông ngay không? Đáp án trong video 😉",
     "tik": "NOAC + chảy máu 🚨 Rung nhĩ – NOAC Phần 5: ngưng thuốc, thuốc giải, rung nhĩ trong nhiễm khuẩn huyết",
     "yt_title": "Rung nhĩ – NOAC Phần 5: Ngưng thuốc, xử trí chảy máu, thuốc giải, rung nhĩ ở hồi sức",
     "yt_desc": "Phần 5 loạt bài rung nhĩ nguy cơ cao – chọn NOAC: ngưng NOAC trước thủ thuật (PAUSE, EHRA 2021), mổ cấp cứu ngoài kế hoạch, chuyển đổi giữa các thuốc chống đông, phân loại chảy máu (ACC 2020), xử trí theo mức chảy máu, liều idarucizumab, andexanet, PCC, bằng chứng RE-VERSE AD và ANNEXA-I, rung nhĩ do yếu tố thúc đẩy trong nhiễm khuẩn huyết, một tình huống sốc nhiễm khuẩn, các hướng còn tranh cãi và bảy thông điệp của loạt bài.",
     "tags": "rung nhĩ, NOAC, ngưng NOAC trước mổ, PAUSE, chảy máu, thuốc giải NOAC, idarucizumab, andexanet, PCC, ANNEXA-I, nhiễm khuẩn huyết, sốc nhiễm khuẩn, hồi sức, chống đông, Thư Viện Y Khoa Online"},
]

L = ["# Bài đăng Facebook, TikTok & YouTube – Loạt bài Rung nhĩ nguy cơ cao – chọn NOAC", "",
     "Thay các chỗ giữ chỗ trước khi đăng: `[LINK_TAI_LIEU]` (tài liệu tóm tắt/slide), `[LINK_PLAYLIST]` (danh sách phát), `[LINK_PHAN_X]` (link video phần trước/sau).",
     "Mốc thời gian lấy từ video thật (giọng Adam). TikTok không cho bấm link trong mô tả → để link ở **bio** hoặc **bình luận ghim**.",
     "Ảnh bìa: `thumbs/rung-nhi-phan-N.png` · phụ đề: `subs/rung-nhi-phan-N.srt`. Loạt này không có video ngắn.", "", "---", ""]
TAG_FB = "#RungNhi #NOAC #ChongDong #TimMach #HoiSucCapCuu #YKhoa #BacSi #ThuVienYKhoaOnline"
TAG_TT = "#rungnhi #noac #chongdong #timmach #ykhoa #bacsi #hoccungbacsi #ThuVienYKhoaOnline"
for i, p in enumerate(P, 1):
    ch = "\n".join(CH[str(i)])
    nav = ([f"⬅️ Phần {i - 1}: [LINK_PHAN_{i - 1}]"] if i > 1 else []) + ([f"➡️ Phần {i + 1}: [LINK_PHAN_{i + 1}]"] if i < 5 else [])
    L += [f"## Phần {i}/5 – {p['ten']} ({p['phut']} phút)", "", "### Facebook", "", "```", p["hook"], "",
          f"🎓 RUNG NHĨ NGUY CƠ CAO – CHỌN NOAC · PHẦN {i}/5: {p['ten'].upper()}", "", p["gioi"], "", "📌 Trong video:"]
    L += ["✔️ " + y for y in p["y"]]
    L += ["", "❓ " + p["hoi"], "", "👉 Tài liệu tóm tắt và slide: [LINK_TAI_LIEU]", "📚 Trọn bộ loạt bài (5 phần): [LINK_PLAYLIST]", *nav,
          f"🌐 Trọn bộ chuyên đề: {WEB}", "", "⏱️ Mốc thời gian:", ch, "", f"{MIEN} Nguồn: {NGUON}", "", "🎙️ Thư Viện Y Khoa Online", "", TAG_FB, "```", "",
          "### TikTok", "", "```", f"{p['tik']} – {p['phut']} phút!", "", "📥 Tài liệu tóm tắt: link ở bio / bình luận ghim",
          f"🎓 Phần {i}/5 · Lưu lại để ôn tập!", "", TAG_TT, "```", "", "---", ""]
L += ["## Bình luận ghim (dùng chung Facebook, TikTok, YouTube)", "", "```", "📥 Tài liệu tóm tắt và slide: [LINK_TAI_LIEU]",
      "📚 Trọn bộ 5 phần: [LINK_PLAYLIST]", f"🌐 Tóm tắt và trọn bộ chuyên đề: {WEB}",
      "Quý đồng nghiệp có câu hỏi hay muốn chuyên đề tiếp theo, hãy để lại bình luận nhé! 🎙️ Thư Viện Y Khoa Online", "```", "", "---", "",
      "# Mô tả YouTube – Loạt bài Rung nhĩ nguy cơ cao – chọn NOAC", "",
      "Kênh: **Thư Viện Y Khoa Online**. Tiêu đề ≤ 100 ký tự; mốc thời gian bắt đầu bằng 00:00 để YouTube tự tạo chương; dán phần “Thẻ” vào ô Tags; tải phụ đề .srt lên YouTube Studio.", ""]
for i, p in enumerate(P, 1):
    ch = "\n".join(CH[str(i)])
    nav = ([f"⬅️ Phần {i - 1}: [LINK_PHAN_{i - 1}]"] if i > 1 else []) + ([f"➡️ Phần {i + 1}: [LINK_PHAN_{i + 1}]"] if i < 5 else [])
    assert len(p["yt_title"]) <= 100 and len(p["tags"]) <= 500
    L += [f"## YouTube · Phần {i}/5 – {p['ten']}", "", f"**Tiêu đề** ({len(p['yt_title'])} ký tự):", "```", p["yt_title"], "```", "", "**Mô tả:**", "```",
          f"🎓 RUNG NHĨ NGUY CƠ CAO – CHỌN NOAC · PHẦN {i}/5: {p['ten'].upper()}", "", p["yt_desc"], "",
          "📥 Tài liệu tóm tắt và slide: [LINK_TAI_LIEU]", "📚 Trọn bộ loạt bài (5 phần): [LINK_PLAYLIST]", *nav, f"🌐 Website: {WEB}", "",
          "⏱️ Nội dung:", ch, "", f"📖 Nguồn: {NGUON}", MIEN, "🎵 Nhạc nền tự tổng hợp, không bản quyền.", "",
          "🔔 Đăng ký kênh Thư Viện Y Khoa Online để nhận các chuyên đề mới.", "", "#RungNhi #NOAC #ThuVienYKhoaOnline", "```", "",
          f"**Thẻ (Tags)** ({len(p['tags'])} ký tự):", "```", p["tags"], "```", ""]
open(os.path.join(ROOT, "posts", "rung-nhi.md"), "w", encoding="utf8").write("\n".join(L))
print("posts/rung-nhi.md", len(L), "dòng")
