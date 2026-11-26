# -*- coding: utf-8 -*-
"""Sinh posts/tiep-can-soc.md (Facebook, TikTok, YouTube, video ngắn) cho loạt "Tiếp cận sốc" (seri Sốc, chuyên đề 1).
Mốc thời gian + thời lượng: tools/chap-tiep-can-soc.json {"phan-1": {"phut": 12, "ch": [...]}, ..., "ngan-1": {"s": 48}}."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = json.load(open(os.path.join(ROOT, "tools", "chap-tiep-can-soc.json"), encoding="utf8"))
WEB = "https://thuvienykhoa.online/"
NGUON = ("ESICM 2025 – khuyến cáo sốc tuần hoàn và theo dõi huyết động (Intensive Care Med 2025); ESICM 2024–2025 về dịch hồi sức (3 phần); "
         "Surviving Sepsis Campaign 2026; SCCM/ESICM 2026 – định nghĩa sốc nhiễm khuẩn kháng trị; SCAI 2026; Vincent & De Backer, NEJM 2013; "
         "các thử nghiệm gốc (SOAP II, SEPSISPAM, 65 trial, CENSER, ANDROMEDA-SHOCK 1–2, ATHOS-3…); Textbook of Critical Care 8e; Oh's Intensive Care Manual 2026; Guyton 15e.")
MIEN = "⚠️ Video phục vụ mục đích giáo dục cho nhân viên y tế, không thay thế hướng dẫn chính thức và đánh giá lâm sàng. Ca lâm sàng là ca minh hoạ, đã thay đổi chi tiết nhận dạng."
N = 8  # 6 phần + 2 ca

P = [
    {"k": "phan-1", "nhan": "Phần 1/6", "ten": "Sốc là gì: định nghĩa mới và sinh lý tuần hoàn",
     "hook": "🩺 Huyết áp 112/70 mà vẫn đang sốc? Theo ESICM 2025, tụt huyết áp không còn là điều kiện bắt buộc.",
     "gioi": "Phần 1 mở đầu seri Sốc: định nghĩa sốc theo ESICM 2025, cung cấp – tiêu thụ oxy, lactate, hồi lưu tĩnh mạch và vì sao đại tuần hoàn đạt chưa chắc vi tuần hoàn đạt.",
     "y": ["Sốc = giảm tưới máu mô · tụt huyết áp không bắt buộc · lactate thường > 2 mmol/L",
           "Đường cong DO₂ – VO₂: DO₂ tới hạn và vì sao không đuổi theo DO₂ siêu bình thường",
           "Lactate tăng không chỉ do thiếu oxy: kích thích β2, suy gan, thiếu thiamine, epinephrine",
           "Thể tích tạo áp lực, hồi lưu tĩnh mạch, đường cong Frank–Starling và vòng xoắn của sốc",
           "Bốn kiểu mất đồng bộ đại – vi tuần hoàn (Ince) · bốn thể sốc và kiểu huyết động"],
     "hoi": "Nữ 72 tuổi, HA 112/70 (nền 160/90), da nổi bông, CRT 5 giây, lactate 4,5: có sốc không? Đáp án trong video 😉",
     "tik": "Huyết áp 112/70 vẫn sốc? 🩺 Tiếp cận sốc Phần 1: định nghĩa ESICM 2025, DO₂–VO₂, lactate",
     "yt_title": "Tiếp cận sốc – Phần 1: Định nghĩa sốc ESICM 2025 và sinh lý tuần hoàn",
     "yt_desc": "Phần 1 seri Sốc (chuyên đề 1: Tiếp cận sốc): định nghĩa sốc tuần hoàn theo ESICM 2025 và vì sao tụt huyết áp không còn bắt buộc, dịch tễ sốc trong hồi sức, đường cong cung cấp – tiêu thụ oxy, lactate, thể tích tạo áp lực và hồi lưu tĩnh mạch, đáp ứng khác nhau với cùng một bolus, vòng xoắn của sốc tiến triển, bốn kiểu mất đồng bộ đại – vi tuần hoàn, bốn thể sốc và một tình huống nhận diện sốc.",
     "tags": "sốc, sốc tuần hoàn, tiếp cận sốc, định nghĩa sốc, ESICM 2025, lactate, DO2 VO2, hồi lưu tĩnh mạch, vi tuần hoàn, huyết động, hồi sức cấp cứu, bài giảng y khoa, Thư Viện Y Khoa Online"},
    {"k": "phan-2", "nhan": "Phần 2/6", "ten": "Nhận diện sốc và xếp thể sốc tại giường",
     "hook": "⏱️ 15 phút đầu: sốc gì? Ba cửa sổ tưới máu, CRT đo đúng cách và siêu âm tim trả lời phần lớn.",
     "gioi": "Phần 2: dấu hiệu lâm sàng nào thật sự chỉ báo sốc, CRT và lactate, cặp ScvO₂ – Pv-aCO₂, siêu âm tim và RUSH, LVOT VTI, phân độ SCAI 2026.",
     "y": ["Ba cửa sổ tưới máu · CRT đo chuẩn: lam kính, 10 giây, > 3 giây là bất thường",
           "ANDROMEDA-SHOCK 1 và 2: CRT hay lactate để dẫn đường hồi sức",
           "Lactate để theo dõi, không để đuổi theo · Pv-aCO₂ > 6 mmHg: lưu lượng chưa đủ",
           "Siêu âm tim là công cụ hình ảnh đầu tay · RUSH: bơm – bể chứa – ống dẫn · LVOT VTI",
           "SCAI 2026: tách bất ổn huyết động khỏi giảm tưới máu"],
     "hoi": "Nam 64 tuổi khó thở đột ngột sau mổ khớp háng, thất phải giãn, tĩnh mạch chủ dưới không xẹp: thể sốc nào? Đáp án trong video 😉",
     "tik": "15 phút đầu: sốc gì? ⏱️ Tiếp cận sốc Phần 2: CRT, lactate, Pv-aCO₂, RUSH, SCAI 2026",
     "yt_title": "Tiếp cận sốc – Phần 2: Nhận diện sốc, CRT, lactate, siêu âm RUSH, SCAI 2026",
     "yt_desc": "Phần 2 seri Sốc (Tiếp cận sốc): ba cửa sổ tưới máu, dấu hiệu nào thật sự chỉ báo sốc, đo thời gian đổ đầy mao mạch đúng cách, lactate để theo dõi chứ không để đuổi theo, ANDROMEDA-SHOCK và ANDROMEDA-SHOCK-2, đọc ScvO₂ và Pv-aCO₂ theo cặp, siêu âm tim trong sốc, phác đồ RUSH, LVOT VTI và nâng chân thụ động, phân độ SCAI 2026 và một tình huống xếp thể sốc.",
     "tags": "sốc, nhận diện sốc, thời gian đổ đầy mao mạch, CRT, lactate, ANDROMEDA-SHOCK, ScvO2, Pv-aCO2, siêu âm tim, RUSH, POCUS, LVOT VTI, SCAI 2026, sốc tim, hồi sức cấp cứu, Thư Viện Y Khoa Online"},
    {"k": "phan-3", "nhan": "Phần 3/6", "ten": "Theo dõi huyết động và đáp ứng dịch",
     "hook": "💧 Sau giờ đầu, chỉ khoảng 20% người bệnh sốc còn đáp ứng dịch. Truyền tiếp thì phải hỏi trước!",
     "gioi": "Phần 3: các phép thử đáp ứng dịch theo ESICM 2025, nâng chân thụ động đúng cách, thử dịch, CVP, dịch có liều độc và khi nào đo cung lượng tim.",
     "y": ["Mỗi bolus sau giờ đầu phải có lý do · chỉ 20% còn đáp ứng sau 4 giờ",
           "Nâng chân thụ động là phép thử chủ lực: đo cung lượng tim thời gian thực, ngưỡng ≥ 10%",
           "PPV chỉ khi không tự thở và Vt ≥ 8 mL/kg · không dùng tĩnh mạch chủ dưới đơn độc",
           "CVP: đo nhưng không đặt đích · dịch cũng có liều độc",
           "Chọn phương tiện đo cung lượng tim theo thất phải và ARDS"],
     "hoi": "Sốc nhiễm khuẩn, ARDS, đang tự thở trên máy, rung nhĩ: chọn phép thử đáp ứng dịch nào? Đáp án trong video 😉",
     "tik": "Truyền thêm dịch không? 💧 Tiếp cận sốc Phần 3: nâng chân thụ động, PPV, CVP, cung lượng tim",
     "yt_title": "Tiếp cận sốc – Phần 3: Đáp ứng dịch, nâng chân thụ động, CVP, đo cung lượng tim",
     "yt_desc": "Phần 3 seri Sốc (Tiếp cận sốc): vì sao phải hỏi đáp ứng dịch trước mỗi lần truyền, các phép thử theo ESICM 2025 (nâng chân thụ động, EEOT, PPV, thử dịch nhỏ, thử tăng Vt), làm nâng chân thụ động đúng cách, độ chính xác chẩn đoán, thử dịch, CVP chỉ là tín hiệu an toàn, quá tải dịch, khi nào và bằng gì đo cung lượng tim, và một tình huống chọn phép thử.",
     "tags": "sốc, đáp ứng dịch, nâng chân thụ động, PLR, PPV, CVP, thử dịch, fluid challenge, cung lượng tim, theo dõi huyết động, ESICM 2025, quá tải dịch, hồi sức cấp cứu, Thư Viện Y Khoa Online"},
    {"k": "phan-4", "nhan": "Phần 4/6", "ten": "Dịch và mục tiêu huyết áp",
     "hook": "📉 30 mL/kg là đích hay là trần? Và MAP 65 có đủ cho mọi người bệnh sốc?",
     "gioi": "Phần 4: bốn giai đoạn dịch ROSE, chọn loại dịch và lượng dịch theo ESICM 2024–2025, rút dịch, mục tiêu huyết áp theo thể sốc và thời điểm bắt đầu vận mạch.",
     "y": ["Dịch theo giai đoạn ROSE: hồi sức → tối ưu → ổn định → tháo dịch",
           "Tinh thể cân bằng là mặc định · muối cho chấn thương sọ não · albumin cho xơ gan",
           "30 mL/kg là trần cho giai đoạn mù, sau đó cá thể hoá · dịch theo từng thể sốc",
           "SEPSISPAM, 65 trial: MAP 65 đủ cho đa số · cá thể hoá ở tăng huyết áp mạn, chấn thương, sọ não",
           "CENSER: không chờ “đủ dịch” mới dùng norepinephrine"],
     "hoi": "Nam 34 tuổi gãy xương chậu, HA 76/44, đang chờ nút mạch: hồi sức thế nào trước khi cầm máu? Đáp án trong video 😉",
     "tik": "30 mL/kg: đích hay trần? 📉 Tiếp cận sốc Phần 4: ROSE, chọn dịch, MAP 65, vận mạch sớm",
     "yt_title": "Tiếp cận sốc – Phần 4: Dịch hồi sức ESICM, MAP 65, vận mạch sớm (CENSER)",
     "yt_desc": "Phần 4 seri Sốc (Tiếp cận sốc): bốn giai đoạn dịch ROSE, chọn loại dịch theo ESICM 2024, bao nhiêu dịch theo ESICM 2025, dịch theo từng thể sốc, rút dịch, mục tiêu huyết áp theo thể sốc, SEPSISPAM và 65 trial, thời điểm bắt đầu vận mạch (CENSER) và một tình huống sốc mất máu do chấn thương.",
     "tags": "sốc, dịch hồi sức, ROSE, tinh thể cân bằng, albumin, 30 mL/kg, ESICM dịch, MAP 65, SEPSISPAM, 65 trial, CENSER, norepinephrine sớm, sốc mất máu, hồi sức cấp cứu, Thư Viện Y Khoa Online"},
    {"k": "phan-5", "nhan": "Phần 5/6", "ten": "Thuốc vận mạch và tăng co bóp",
     "hook": "💉 Cùng ghi 0,5 µg/kg/phút norepinephrine, liều thật có thể lệch gấp đôi. Base hay tartrate?",
     "gioi": "Phần 5: thụ thể và cơ chế, tác dụng từng thuốc, SOAP II và hai mươi năm thử nghiệm vận mạch, bậc thang SSC 2026, liều, base – tartrate, liều tương đương norepinephrine và truyền qua đường ngoại vi.",
     "y": ["Thụ thể α, β, V1, AT1 và đường truyền tín hiệu · tác dụng chính của từng thuốc",
           "SOAP II: dopamine gây loạn nhịp gần gấp đôi · liều thấp không bảo vệ thận",
           "Bậc thang SSC 2026: norepinephrine → vasopressin → epinephrine",
           "Base hay tartrate: lệch gấp đôi · ngưỡng mới (SOFA-2, SCCM/ESICM 2026) tính theo base",
           "Liều tương đương norepinephrine (NEE) · truyền norepinephrine qua đường ngoại vi"],
     "hoi": "Norepinephrine 60 µg/mL chạy 28 mL/giờ cho người 70 kg, kèm vasopressin 0,03 U/phút: NEE là bao nhiêu? Tự tính rồi xem đáp án 😉",
     "tik": "Norepinephrine lệch gấp đôi? 💉 Tiếp cận sốc Phần 5: cơ chế, SOAP II, SSC 2026, NEE, đường ngoại vi",
     "yt_title": "Tiếp cận sốc – Phần 5: Thuốc vận mạch, SSC 2026, base hay tartrate, NEE",
     "yt_desc": "Phần 5 seri Sốc (Tiếp cận sốc): thụ thể và đường truyền tín hiệu của thuốc vận mạch, tác dụng chính của norepinephrine, epinephrine, dopamine, dobutamine, vasopressin, angiotensin II, SOAP II và hai mươi năm thử nghiệm, bậc thang thuốc vận mạch theo Surviving Sepsis Campaign 2026, liều trong các nguồn, norepinephrine base và tartrate, liều tương đương norepinephrine, truyền ngoại vi, công thức pha – quy đổi và một bài tính NEE.",
     "tags": "thuốc vận mạch, norepinephrine, vasopressin, epinephrine, dopamine, dobutamine, SOAP II, SSC 2026, norepinephrine base tartrate, NEE, liều tương đương norepinephrine, truyền ngoại vi, sốc nhiễm khuẩn, hồi sức, Thư Viện Y Khoa Online"},
    {"k": "phan-6", "nhan": "Phần 6/6", "ten": "Sốc kháng trị và thuốc cứu vãn",
     "hook": "🚨 SCCM/ESICM 2026 lần đầu định nghĩa sốc nhiễm khuẩn kháng trị. Ngưỡng NEE khoảng 0,5 – và còn hơn thế.",
     "gioi": "Phần 6: tiêu chí sốc nhiễm khuẩn kháng trị SCCM/ESICM 2026, tìm nguyên nhân trước khi thêm thuốc, vasopressin, angiotensin II, xanh methylen, hydroxocobalamin và những câu hỏi còn mở.",
     "y": ["Định nghĩa 2026: NEE ≈ 0,5 + giảm tưới máu + siêu âm tim",
           "Kháng trị: tìm ổ nhiễm, chảy máu, áp lực ổ bụng, sốc hỗn hợp trước khi thêm thuốc",
           "Vasopressin và ATHOS-3 (angiotensin II): tiết kiệm catecholamine",
           "Xanh methylen: huyết động tốt hơn, sống còn chưa rõ · bốn câu hỏi trước khi truyền",
           "Hydroxocobalamin: bằng chứng còn rất mỏng · bảy thông điệp của cả loạt bài"],
     "hoi": "Norepinephrine 0,6 + vasopressin, bụng căng, thiểu niệu mới: bước tiếp theo là gì? Đáp án trong video 😉",
     "tik": "Sốc kháng trị: định nghĩa 2026 🚨 Tiếp cận sốc Phần 6: vasopressin, angiotensin II, xanh methylen",
     "yt_title": "Tiếp cận sốc – Phần 6: Sốc kháng trị SCCM/ESICM 2026, thuốc cứu vãn",
     "yt_desc": "Phần 6 seri Sốc (Tiếp cận sốc): tiêu chí sốc nhiễm khuẩn kháng trị theo đồng thuận SCCM/ESICM 2026, tìm nguyên nhân trước khi thêm thuốc, vasopressin, angiotensin II (ATHOS-3), xanh methylen và bốn câu hỏi an toàn (SSRI, G6PD, SpO₂), hydroxocobalamin, những câu hỏi còn mở, một tình huống kháng trị và bảy thông điệp của cả loạt bài.",
     "tags": "sốc kháng trị, sốc nhiễm khuẩn kháng trị, SCCM ESICM 2026, vasopressin, angiotensin II, ATHOS-3, xanh methylen, methylene blue, hydroxocobalamin, NEE, thuốc cứu vãn, áp lực ổ bụng, hồi sức, Thư Viện Y Khoa Online"},
    {"k": "ca-1", "nhan": "Ca lâm sàng 1/2", "ten": "Sốc chưa rõ thể",
     "hook": "🧩 Sốt, lơ mơ, huyết áp tụt: nhiễm khuẩn chắc rồi? Siêu âm tim có thể kể một câu chuyện khác.",
     "gioi": "Ca lâm sàng 1: bốn điểm quyết định – có phải sốc, siêu âm xếp thể sốc, có truyền thêm dịch, và MAP đạt nhưng tưới máu chưa đạt.",
     "y": ["Tụt áp + lactate cao chưa cho biết thể sốc",
           "Siêu âm tim sớm phát hiện thành phần tim",
           "Vận mạch sớm, qua ngoại vi, cùng lúc với dịch khi tụt áp nặng",
           "Hỏi đáp ứng dịch trước mỗi bolus: nâng chân + VTI, ngưỡng ≥ 10%",
           "MAP đạt chưa phải đích cuối: VTI, ScvO₂, Pv-aCO₂, CRT"],
     "hoi": "Bốn điểm quyết định, mỗi điểm có thời gian để bạn tự trả lời trước. Thử sức nhé 😉",
     "tik": "Sốt, tụt áp: sốc gì? 🧩 Ca lâm sàng 1 – 4 quyết định cùng siêu âm tim",
     "yt_title": "Tiếp cận sốc – Ca lâm sàng 1: Sốc chưa rõ thể, 4 quyết định tại giường",
     "yt_desc": "Ca lâm sàng 1 của chuyên đề Tiếp cận sốc (ca minh hoạ): người bệnh sốt, lơ mơ, huyết áp tụt; bốn điểm quyết định – nhận diện sốc và xử trí ngay, siêu âm tim xếp thể sốc, có truyền thêm dịch không, MAP đạt nhưng tưới máu chưa đạt – mỗi điểm có đếm ngược để tự trả lời, đáp án theo ESICM 2025 và SSC 2026.",
     "tags": "ca lâm sàng sốc, sốc hỗn hợp, sốc nhiễm khuẩn, siêu âm tim, POCUS, đáp ứng dịch, nâng chân thụ động, LVOT VTI, norepinephrine ngoại vi, ESICM 2025, SSC 2026, hồi sức cấp cứu, Thư Viện Y Khoa Online"},
    {"k": "ca-2", "nhan": "Ca lâm sàng 2/2", "ten": "Sốc nhiễm khuẩn kháng trị",
     "hook": "📈 Norepinephrine tăng mãi mà huyết áp vẫn thấp: đã kháng trị chưa, hay ta đang bỏ sót điều gì?",
     "gioi": "Ca lâm sàng 2: tính NEE đúng, tiêu chí kháng trị 2026, nguyên nhân bị bỏ sót (áp lực ổ bụng 22 mmHg) và quyết định có dùng xanh methylen.",
     "y": ["Tính NEE đúng dạng base · vasopressin × 2,5 · ngưỡng 0,5",
           "Kháng trị cần cả giảm tưới máu và siêu âm, không chỉ một con số liều",
           "Tìm nguyên nhân trước khi thêm thuốc: ổ nhiễm, chảy máu, áp lực ổ bụng, sốc hỗn hợp",
           "Áp lực ổ bụng 22 mmHg: làm gì",
           "Xanh methylen: SSRI, G6PD, SpO₂ · chưa giảm tử vong"],
     "hoi": "Ngày 2 sau mổ, norepinephrine + vasopressin, áp lực ổ bụng 22 mmHg: có phải sốc kháng trị? Đáp án trong video 😉",
     "tik": "Tăng mãi vẫn tụt áp 📈 Ca lâm sàng 2: sốc nhiễm khuẩn kháng trị, NEE, áp lực ổ bụng",
     "yt_title": "Tiếp cận sốc – Ca lâm sàng 2: Sốc nhiễm khuẩn kháng trị, NEE, áp lực ổ bụng",
     "yt_desc": "Ca lâm sàng 2 của chuyên đề Tiếp cận sốc (ca minh hoạ): sốc nhiễm khuẩn sau mổ, norepinephrine tăng dần kèm vasopressin; bốn điểm quyết định – có phải sốc kháng trị theo SCCM/ESICM 2026 (tính NEE), siêu âm và nguyên nhân bị bỏ sót, áp lực ổ bụng 22 mmHg, có dùng xanh methylen không – mỗi điểm có đếm ngược để tự trả lời.",
     "tags": "ca lâm sàng sốc, sốc nhiễm khuẩn kháng trị, SCCM ESICM 2026, NEE, vasopressin, áp lực ổ bụng, hội chứng khoang bụng, xanh methylen, methylene blue, norepinephrine base, hồi sức cấp cứu, Thư Viện Y Khoa Online"},
]

NGAN = [  # (dự án ngắn, video dài liên quan, caption)
    (1, "phan-1", "Huyết áp 112/70 mà vẫn đang sốc? 🩺 Định nghĩa sốc ESICM 2025"),
    (2, "phan-1", "Norepinephrine cũng là một “bolus dịch”? 💉 Thể tích tạo áp lực, giải thích trong 1 phút"),
    (3, "phan-2", "Bạn đo CRT có đúng cách? ⏱️ Lam kính, 10 giây, ngưỡng 3 giây"),
    (4, "phan-2", "CRT hay lactate để dẫn đường hồi sức? 📊 ANDROMEDA-SHOCK 1 và 2"),
    (5, "phan-3", "Nâng chân thụ động trong 60 giây 🦵 Làm đúng, đo đúng, đọc đúng"),
    (6, "phan-3", "Tĩnh mạch chủ dưới xẹp: có truyền dịch? 💧 ESICM 2025 nói gì"),
    (7, "phan-4", "30 mL/kg: đích hay trần? 💧 ESICM 2025 về dịch hồi sức"),
    (8, "phan-4", "MAP 65 có đủ không? 📉 SEPSISPAM, 65 trial và khi nào cá thể hoá"),
    (9, "phan-5", "Vì sao dopamine bị “giáng chức”? 💉 Bài học từ SOAP II"),
    (10, "phan-5", "Cùng 0,5 µg/kg/phút, có thể lệch gấp đôi 😱 Norepinephrine base hay tartrate"),
    (11, "phan-6", "Sốc kháng trị: định nghĩa mới 2026 🚨 SCCM/ESICM"),
    (12, "phan-6", "Xanh methylen: hỏi gì trước khi truyền? 🧪 Bốn câu hỏi an toàn"),
]

TAG_FB = "#Soc #HoiSucCapCuu #HuyetDong #VanMach #ICU #YKhoa #BacSi #ThuVienYKhoaOnline"
TAG_TT = "#soc #hoisuc #huyetdong #icu #ykhoa #bacsi #hoccungbacsi #ThuVienYKhoaOnline"


def nav(i):
    out = []
    if i > 1:
        out.append(f"⬅️ {P[i - 2]['nhan'].split(' (')[0]}: [LINK_{P[i - 2]['k'].upper().replace('-', '_')}]")
    if i < N:
        out.append(f"➡️ {P[i]['nhan'].split(' (')[0]}: [LINK_{P[i]['k'].upper().replace('-', '_')}]")
    return out


L = ["# Bài đăng Facebook, TikTok & YouTube – Seri Sốc · Chuyên đề 1: Tiếp cận sốc", "",
     "Thay các chỗ giữ chỗ trước khi đăng: `[LINK_TAI_LIEU]` (tài liệu tóm tắt/slide), `[LINK_PLAYLIST]` (danh sách phát), `[LINK_PHAN_N]`, `[LINK_CA_N]` (video trước/sau), `[LINK_VIDEO_DAI]` (video dài tương ứng của video ngắn).",
     "Mốc thời gian lấy từ video thật (giọng Adam). TikTok không cho bấm link trong mô tả → để link ở **bio** hoặc **bình luận ghim**.",
     "Ảnh bìa: `thumbs/tiep-can-soc-<phan-N|ca-K>.png` · phụ đề: `subs/tiep-can-soc-*.srt` · 12 video ngắn dọc: `tiep-can-soc-ngan-1..12`.", "", "---", ""]
for i, p in enumerate(P, 1):
    c = CH[p["k"]]
    ch = "\n".join(c["ch"])
    L += [f"## {p['nhan']} – {p['ten']} ({c['phut']} phút)", "", "### Facebook", "", "```", p["hook"], "",
          f"🎓 TIẾP CẬN SỐC · {p['nhan'].upper()}: {p['ten'].upper()}", "", p["gioi"], "", "📌 Trong video:"]
    L += ["✔️ " + y for y in p["y"]]
    L += ["", "❓ " + p["hoi"], "", "👉 Tài liệu tóm tắt và slide: [LINK_TAI_LIEU]", f"📚 Trọn bộ chuyên đề ({N} video): [LINK_PLAYLIST]", *nav(i),
          f"🌐 Trọn bộ chuyên đề: {WEB}", "", "⏱️ Mốc thời gian:", ch, "", f"{MIEN} Nguồn: {NGUON}", "", "🎙️ Thư Viện Y Khoa Online", "", TAG_FB, "```", "",
          "### TikTok", "", "```", f"{p['tik']} – {c['phut']} phút!", "", "📥 Tài liệu tóm tắt: link ở bio / bình luận ghim",
          f"🎓 {p['nhan'].split(' (')[0]} · Lưu lại để ôn tập!", "", TAG_TT, "```", "", "---", ""]

L += ["## Video ngắn dọc (TikTok · Reels · YouTube Shorts)", "",
      "Mỗi video dài có 2 video ngắn (giọng Mỹ Duyên ×1.15). Caption ≤ 170 ký tự; thay `[LINK_VIDEO_DAI]` bằng link video dài tương ứng.", ""]
for k, ref, cap in NGAN:
    s = CH[f"ngan-{k}"]["s"]
    nhan = next(p["nhan"].split(" (")[0] for p in P if p["k"] == ref)
    txt = f"{cap} · {s} giây · Trọn bài: {nhan} 👉 link ở bio"
    assert len(txt) <= 170, (k, len(txt))
    L += [f"### Ngắn {k} – `tiep-can-soc-ngan-{k}` ({s} giây, từ {nhan})", "", "```", txt, "", "#soc #hoisuc #icu #ykhoa #bacsi #ThuVienYKhoaOnline", "```", "",
          "YouTube Shorts – mô tả:", "```", f"{cap}", f"🎬 Trọn bài giảng ({nhan}): [LINK_VIDEO_DAI]", f"🌐 {WEB}", "#Shorts #HoiSuc #ThuVienYKhoaOnline", "```", ""]
L += ["---", ""]

L += ["## Bình luận ghim (dùng chung Facebook, TikTok, YouTube)", "", "```", "📥 Tài liệu tóm tắt và slide: [LINK_TAI_LIEU]",
      f"📚 Trọn bộ {N} video (6 phần + 2 ca lâm sàng): [LINK_PLAYLIST]", f"🌐 Tóm tắt và trọn bộ chuyên đề: {WEB}",
      "Chuyên đề tiếp theo của seri Sốc: sốc tim, sốc mất máu, sốc tắc nghẽn, phản vệ…",
      "Quý đồng nghiệp có câu hỏi hay muốn chuyên đề tiếp theo, hãy để lại bình luận nhé! 🎙️ Thư Viện Y Khoa Online", "```", "", "---", "",
      "# Mô tả YouTube – Seri Sốc · Chuyên đề 1: Tiếp cận sốc", "",
      "Kênh: **Thư Viện Y Khoa Online**. Tiêu đề ≤ 100 ký tự; mốc thời gian bắt đầu bằng 00:00 để YouTube tự tạo chương; dán phần “Thẻ” vào ô Tags; tải phụ đề .srt lên YouTube Studio.", ""]
for i, p in enumerate(P, 1):
    c = CH[p["k"]]
    ch = "\n".join(c["ch"])
    assert len(p["yt_title"]) <= 100 and len(p["tags"]) <= 500, p["k"]
    L += [f"## YouTube · {p['nhan']} – {p['ten']}", "", f"**Tiêu đề** ({len(p['yt_title'])} ký tự):", "```", p["yt_title"], "```", "", "**Mô tả:**", "```",
          f"🎓 TIẾP CẬN SỐC · {p['nhan'].upper()}: {p['ten'].upper()}", "", p["yt_desc"], "",
          "📥 Tài liệu tóm tắt và slide: [LINK_TAI_LIEU]", f"📚 Trọn bộ chuyên đề ({N} video): [LINK_PLAYLIST]", *nav(i), f"🌐 Website: {WEB}", "",
          "⏱️ Nội dung:", ch, "", f"📖 Nguồn: {NGUON}", MIEN, "🎵 Nhạc nền tự tổng hợp, không bản quyền.", "",
          "🔔 Đăng ký kênh Thư Viện Y Khoa Online để nhận các chuyên đề mới.", "", "#Soc #HoiSucCapCuu #ThuVienYKhoaOnline", "```", "",
          f"**Thẻ (Tags)** ({len(p['tags'])} ký tự):", "```", p["tags"], "```", ""]
open(os.path.join(ROOT, "posts", "tiep-can-soc.md"), "w", encoding="utf8").write("\n".join(L))
print("posts/tiep-can-soc.md", len(L), "dòng")
