---
name: "video-bai-giang-y-khoa"
description: "Biến guideline, ca lâm sàng, bài bệnh học hoặc sinh lý – cơ chế (file .md OCR, PDF) thành loạt video bài giảng slide động có giọng giảng viên tiếng Việt, dựng qua repo h6972/video-y, kèm bài đăng FB/TikTok/YouTube và trang web."
---

# Video bài giảng y khoa (slide động + lồng giọng + bài đăng + web)

Chủ kênh: bác sĩ HSCC – Nội tim mạch. Thương hiệu duy nhất trên video, bài đăng, web: **Thư Viện Y Khoa Online** (không ghi tên cá nhân). Mục tiêu: up tài liệu → loạt video truyền tải TRỌN VẸN nội dung, sinh động nhưng dày thông tin học thuật, giọng đọc đóng vai **giảng viên cao cấp** giảng cho bác sĩ; sau đó bài đăng Facebook, TikTok, YouTube cho từng phần, video ngắn dọc, ảnh bìa, phụ đề và một trang chuyên đề trên web thuvienykhoa.online.

## 0. Chọn loại loạt bài (quyết định giao diện + cấu trúc)
Xác định loại từ yêu cầu/tài liệu; nếu không rõ thì hỏi một câu. Ghi `"theme"` trong mọi script.json của loạt.

| Loại | `theme` | Giao diện | Layout riêng (ngoài layout chung) |
|---|---|---|---|
| Guideline / phác đồ (mặc định) | bỏ trống hoặc `guideline` | Navy, nhãn khuyến cáo, `ref` Mục/Bảng | — |
| Case lâm sàng | `case` | Nền đen kiểu monitor ICU, nhấn đỏ | `vitals`, `labs`, `decision`, `course` |
| Bệnh học (chẩn đoán – điều trị) | `benh-hoc` | Nền sáng giáo trình, tiêu đề serif, nhấn đỏ đô, thanh mục lục trái | `pathway` + thanh `rail` |
| Sinh lý – cơ chế | `sinh-ly` | Nền chàm, cyan–tím, sơ đồ động | `flow`, `curve`, `cycle` |

Giao diện nằm ở `engine/themes/<theme>/{theme.css,layouts.js}`; `build.py` tự chèn vào `engine/lecture.html` khi script có `theme`. Layout dùng chung mọi giao diện (`flow`, `cycle`, `curve`, `bars`, `stats`, `gauge`, `brand`, `endscreen`) ở `engine/themes/common/*.js|css`, luôn được chèn (mọi file trong thư mục). Kịch bản mẫu từng loại: `engine/themes/_mau/<theme>.json` (đọc để lấy cấu trúc trường trước khi soạn).

### Cấu trúc bài giảng theo loại
- **Guideline**: mở đầu (điểm mới) → khuyến cáo + bằng chứng (Box/Bảng gốc, nhóm/mức) → bẫy thực hành → 1–2 tình huống → tổng kết. Phần cuối loạt: ôn tập toàn loạt.
- **Mọi loại – minh hoạ bắt buộc** (người dùng muốn video sinh động như footage): rà từng phần, chỗ nào hình giúp hiểu nhanh hơn chữ thì thêm cảnh minh hoạ ngay sau slide khuyến cáo tương ứng:
  - Lưu đồ, thuật toán, Hình/Figure trong tài liệu → **vẽ lại** bằng `flow` (không chụp lại hình gốc có bản quyền), ghi `ref` "Vẽ lại theo Hình N".
  - Số liệu thử nghiệm so sánh (tỷ lệ biến cố, chảy máu, tử vong…) → `bars`; con số dịch tễ/tiên lượng nổi bật → `stats` (đếm tăng dần).
  - Thang điểm cộng dồn (Burch–Wartofsky, Wells, SOFA…) → `gauge` với một ví dụ cộng từng bước.
  - Chẩn đoán hình ảnh, ECG, siêu âm, CT, X-quang, dụng cụ (lọc, ECMO, can thiệp), bệnh phẩm → `media` với ảnh/clip thật có chú thích động.
  - Quyết định chọn thuốc/xử trí nhiều nhánh → `flow` dạng cây câu hỏi Có/Không.
  - Mục tiêu khoảng 3–5 cảnh minh hoạ mỗi phần 12–15 phút.
- **Case lâm sàng**: bìa (tóm tắt ca, không lộ chẩn đoán) → `vitals` lúc vào viện → `labs` → `decision` (2–4 điểm quyết định, mỗi điểm: tình huống, câu hỏi, "Quý vị có thể tạm dừng video để suy nghĩ.", đáp án + lý do theo guideline) → `course` diễn tiến → bài học (box/summary). Ghi "Ca bệnh minh hoạ, đã thay đổi chi tiết nhận dạng"; tuyệt đối không dùng thông tin nhận dạng người bệnh thật. Người dùng muốn mỗi ca lâm sàng gói trong **1 video**.
- **Bệnh học**: khai báo `rail` (mục lục: định nghĩa – dịch tễ, bệnh sinh, lâm sàng, chẩn đoán, điều trị, tiên lượng) và gán `"rail": "<k>"` cho mỗi cảnh. Định nghĩa (box) → bệnh sinh (`pathway`) → lâm sàng (cards) → cận lâm sàng, chẩn đoán, chẩn đoán phân biệt (compare) → điều trị → tiên lượng → bẫy, tình huống, tổng kết.
- **Sinh lý – cơ chế**: mở bằng câu hỏi lâm sàng → cơ chế từng bước (`flow`), đồ thị (`curve`), vòng điều hoà (`cycle`) → liên hệ thuốc/hồi sức → bẫy, tình huống → tổng kết. Mỗi cơ chế phải dẫn về ứng dụng lâm sàng.
- **Liều thuốc**: luôn ghi liều cụ thể (kháng đông, tiêu sợi huyết, vận mạch…). Liều không có trong tài liệu nguồn thì lấy từ tờ hướng dẫn sử dụng/guideline khác và ghi rõ nguồn trên slide và trong lời giảng.

### Trường layout riêng
- `vitals`: patient{tag,t,d,at}, findings[{t,at,c}], vitals[{k,v,u,c,f(nhãn góc),wave(ecg|pleth|resp),alarm,at}] (ô có `wave` chiếm 2 cột). Bìa case: `monitor{hr,bp}` hiện sinh hiệu của ca trên màn hình minh hoạ.
- `labs`: groups[{g,c,at,note,rows[{k,v,r(khoảng tham chiếu),f(H|L|N)}]}] (2–3 nhóm, ≤ 5 dòng/nhóm).
- `decision`: step, q, q_at, context, options[4], answer, answer_at, explain.
- `course`: events[{time,t,d,at,c}] (≤ 5).
- `pathway`: steps[{n,t,d,at,c}] (3–4 bước, nối bằng mũi tên).
- `flow`: nodes[{id,t,d,x,y,w,h,c,at}] (toạ độ tâm, vùng 1776×692 px), edges[{a,b,c,at,label,bend}], note{t,at,c,y} (note nằm trên cùng: nút đầu tiên đặt y ≥ 140).
- `curve`: xl, yl, curves[{pts[[x,y]…] 0–100,c,label,at,dash}], points[{x,y,t,c,at,dx,dy}], arrows[{from,to,c,at}], notes[] (cột phải). Kiểm tra nhãn điểm không đè nhãn đường cong (chỉnh dx/dy).
- `cycle`: nodes[{t,d,c,at}] (4–6), center, cx, cy, r, side[] (ghi chú phải).
- `flow`, `cycle`, `curve` dùng được ở mọi giao diện; nút `flow` cần đủ `h` cho chữ (tiêu đề 29px), cách nhau ≥ 60 px, nhãn cạnh ngắn; cạnh dọc không cần nhãn. Sơ đồ leo thang nhiều bậc: xếp các bậc thành hàng ngang trên, các nhánh kết quả thành hàng dưới (tránh cạnh chéo cắt qua nút).
- `bars` (mọi giao diện): groups[{t,d,at,c,hl,note,bars[{k,v,lab,c}]}] (≤ 4 nhóm, 2 cột/nhóm: cột đầu màu nhấn, cột so sánh xám), max, notes[] (cột phải, notes_w), h. Chỉ dùng số liệu có trong nguồn.
- `stats` (mọi giao diện): tiles[{tag,v (số),pre,suf,dec,l,d,c,at}] (2–4 ô, số đếm tăng dần), cols, note{t,at,c}, h.
- `gauge` (mọi giao diện): max (điểm tối đa thật của thang), zones[{to,t,c}] (nhãn vùng ngắn), parts[{t,v,at,c}] (đoạn cộng dồn + thẻ), chip_cols, verdict, verdict_at.
- `hook` (chủ yếu video dọc): kicker, hook (câu móc lớn), sub, c — không có tiêu đề cảnh.
- `media` (mọi giao diện): ảnh/clip y khoa thật kèm chú thích động. panels[{src | seq ("…/f_%03d.jpg"), n, fps, ar (rộng/cao, tính từ file thật), flex, at, cap, credit, zoom{x,y,s,at,out}, marks[{type: arrow|circle|box|line|label, x,y (% ảnh), dx,dy (đuôi mũi tên), r, w,h, x2,y2, t, c, at, lx,ly}]}], notes[{tag,t,d,at,c}] (cột phải, notes_w), h. Nhãn tự giữ trong khung ảnh; nhãn ngắn (≤ 25 ký tự).

## Nhận diện kênh & nâng cấp (mặc định cho mọi loạt từ 2026-10)
- **Logo kênh** (người dùng gửi 27/10/2026): `assets/brand/logo.png` (800×800, đã cắt tròn, nền trong suốt; huy hiệu tròn: sách mở + ống nghe + chữ thập, "THƯ VIỆN Y KHOA ONLINE · Học từ bằng chứng · Ứng dụng vào lâm sàng"). Tự xuất hiện ở: đoạn mở (logo lớn + vòng sáng xoay + địa chỉ web), chân trang mọi cảnh (logo nhỏ + "Thư Viện Y Khoa Online · thuvienykhoa.online"), màn hình kết (ô Đăng ký) và màn hình kết video dọc, ảnh bìa YouTube (`tools/thumb.py`, góc trên trái). Đổi logo: ghi đè file này (giữ tên, vuông, nền trong suốt ngoài hình tròn) — không cần sửa mã. Mã nằm trong `engine/themes/common/brand.js|css`.
- **Website kênh**: https://thuvienykhoa.online/ — hiện trên video (đoạn mở, chân trang, màn hình kết) và luôn ghi trong bài đăng: Facebook (`🌐 Trọn bộ chuyên đề: https://thuvienykhoa.online/`), mô tả YouTube (`🌐 Website: …`), bình luận ghim (`🌐 Tóm tắt và trọn bộ chuyên đề: …`). Link web là thật, không phải chỗ giữ chỗ.
- `"brand": {"next": "Phần N+1: …"}` trong mọi script.json: build.py tự thêm cảnh `intro` (logo kênh + vòng sáng + chuông, 4,2 giây) và `outro` (màn hình kết YouTube 18 giây: 2 khung video + vòng Đăng ký). chapters.py bỏ qua 2 cảnh này, chương đầu luôn 00:00. Tuỳ chọn: intro/outro false, intro_s, outro_s, music false.
- Nhạc nền: `engine/music.py` tự tổng hợp (không bản quyền), mux.py tự ghép khi có `brand`: nền ~−38 LUFS dưới giọng −16, mở/kết ~−19; có tiếng tích tắc khi đếm ngược và chuông khi lộ đáp án. Chỉnh mức bằng `"music": {"bed": -40, "intro": -21.5, "outro": -22.5}` (giá trị ước lượng, thực đo cao hơn ~2,5 dB). Kiểm tra bằng `ffmpeg … -af ebur128` (toàn bài ~−16 LUFS).
- Đếm ngược ở `quiz`/`decision`: `"countdown": {"after": <chỉ số câu "tạm dừng video">, "s": 8}` → chèn khoảng lặng + vòng đếm ngược.
- **Ảnh bìa YouTube**: `tools/thumb.py tools/thumb-<slug>.json` ([{out:"thumbs/<dự án>.png", hook, line2 (<br>), chips[], badge, tag, img (ảnh Commons, ghi nguồn trong mô tả) hoặc null (dùng hình vẽ), c}]) chạy tại chỗ bằng Playwright; xem lại ảnh trước khi gửi.
- **Phụ đề .srt**: sau khi có audio thật (giải nén zip → build.py) chạy `tools/srt.py projects/<dự án> out.srt`; lưu vào `subs/`, gửi người dùng dạng zip; nhắc tải lên YouTube Studio.
- **Video ngắn dọc** (TikTok/Reels/Shorts): 2 video/phần dài, dự án riêng `projects/<slug>-ngan-K` với `"format": "vertical"` (1080×1920), giọng **Mỹ Duyên ×1.15** (`"vieneu": {"voice": "Mỹ Duyên", "tempo": 1.15}` — người dùng chọn; Adam trầm, chậm chỉ hợp bài giảng dài), `"brand": {"intro": false, "outro_s": 3.5, "next": "Trọn bài giảng: link ở bio · bình luận ghim"}`. Cấu trúc: `hook` (câu móc 1 câu đọc) → 1 cảnh nội dung (`list`/`gauge`/`quiz` có countdown 5 giây/`box`) → câu kết mời xem trọn bài. 45–70 giây (~90–140 từ, vì Mỹ Duyên đọc chậm hơn Adam). Bài đăng có mục riêng cho video ngắn (caption ≤ 170 ký tự, `[LINK_VIDEO_DAI]`).
- Video dọc: layout `list`, `quiz`, `box`, `gauge`, `stats`, `bars` đã được phóng to cho khung 1080×1920 (CSS `body[data-format=vertical]` trong `lecture.html` và `themes/common/extra.css`); `bars` dọc nên đặt `max` để nhãn số không tràn phải; `stats` 1 ô đặt `h` ~330 để ghi chú không chạm phụ đề. Luôn chụp still giữa và cuối cảnh nội dung.
- Workflow render chỉ dựng **một dự án mỗi lần push** (dự án đầu tiên trong diff): mỗi phần commit + push riêng, hoặc commit `[skip ci]` rồi dispatch: `gh api -X POST repos/h6972/Video-Y/actions/workflows/render.yml/dispatches -f ref=main -f "inputs[project]=<dự án>"` cho từng dự án.

## Giọng đọc: VieNeu-TTS v3 Turbo — **Adam** (bài giảng dài) · **Mỹ Duyên ×1.15** (video ngắn)
- Người dùng đã chọn Adam cho bài giảng sau khi thử edge-tts (giọng Bắc, hay bị chặn), G-OmniVoice (máy chậm, không có giọng miền Nam), Gemini TTS (hạn mức thấp); cho video ngắn chọn Mỹ Duyên ×1.15 sau khi nghe 8 giọng × 3 tốc độ.
- Chạy CPU trên GitHub Actions, miễn phí, ~0,65× thời lượng đọc. Bắt buộc `onnxruntime==1.22.1` (bản mới lỗi "External data path escapes model directory").
- `"vieneu": {"tempo": 1.15}`: tăng tốc giữ cao độ (ffmpeg atempo trong tts_vieneu.py), thời lượng thật đo lại sau đó.
- Giọng miền Nam khác: Thái Sơn, Minh Triết, Đức Trí (nam); Thục Đoan, Mỹ Duyên, Kim Thanh, Thùy Dung (nữ). Đổi bằng `"vieneu": {"voice": "..."}`.
- Nghe thử giọng với lời tuỳ chọn: workflow `vieneu-samples.yml` (dispatch với `inputs[lines]=tools/<file>.json` ({lines, voices}) và `inputs[tempo]="1.15 1.25"`), kết quả mp3 ở nhánh `samples-vieneu`.
- Chế độ khác: `tts` = `edge` | `azure` (secret AZURE_SPEECH_KEY/REGION) | `gemini` (secret GEMINI_API_KEY) | `omni` (người dùng chạy `tao-giong.bat <dự án>` trên máy, repo ở `D:\Video-Y`).

## Hạ tầng
- Repo `h6972/video-y` (nhánh `main`). Gắn bằng `add_repo` (access push), clone `--depth 1` vào `/home/claude/video-y`; luôn `git pull` trước khi sửa. `gh` không dùng được GraphQL → gọi REST (`gh api …`), kể cả dispatch workflow.
- `engine/build.py projects/<dự án>`: timeline + phụ đề; chèn giao diện theo `theme` (+ `themes/common`); ước lượng thời lượng khi chưa có audio.
- `engine/capture.py projects/<dự án> stills t1 t2…` chụp ảnh kiểm tra (tự đổi khung 1080×1920 khi `format` vertical); `capture.py … video` dựng video.
- `engine/chapters.py projects/<dự án>`: mốc thời gian chương (chạy sau khi có audio thật).
- `media/<slug>/`: ảnh/clip thật dùng chung cho cả loạt (tham chiếu từ dự án bằng `../../media/<slug>/…`; có thể dùng lại ảnh của loạt khác).
- `.github/workflows/render.yml`: tự chạy khi `projects/**/script.json` đổi trên `main` (chỉ dự án đầu tiên trong diff; phần khác dispatch riêng, chạy song song). Kết quả: nhánh `renders` → `videos/<dự án>.mp4` và `<dự án>-audio.zip`; lỗi: nhánh `logs`. Nếu đẩy lên `renders` bị xung đột: workflow `artifact-to-renders.yml` (dispatch qua `gh api …/dispatches` với run_id, project).
- Repo `h6972/Video-Y` đã **công khai** (27/10/2026) → GitHub Actions miễn phí không giới hạn phút. Không đưa tài liệu gốc/bản dịch có bản quyền vào repo; khoá bí mật chỉ ở Secrets. Nếu repo trở lại riêng tư: hạn mức 2.000 phút/tháng (một phần dài ~45–60 phút, video ngắn ~15 phút) — báo người dùng trước khi dựng hàng loạt.
- Trước khi kết thúc lượt: commit + push mọi file mới trong repo (ảnh bìa, spec, phụ đề), tránh để file chưa theo dõi.
- Workspace chặn mạng ngoài → không gọi TTS tại chỗ. Mỗi phần 10–15 phút dựng ~40–60 phút; video ngắn ~15 phút.
- `posts/<slug>.md`: bài đăng mạng xã hội của loạt.

## Hình ảnh y khoa thật (ECG, siêu âm, CT, X-quang, xạ hình, dụng cụ)
- Workspace không vào được Wikimedia → dùng workflow `commons.yml` trên GitHub Actions (dispatch bằng `gh api -X POST repos/h6972/Video-Y/actions/workflows/commons.yml/dispatches -f ref=main -f "inputs[mode]=search|download" -f "inputs[arg]=…"`):
  - search: arg là các truy vấn tiếng Anh cách nhau bởi `|` (không bọc từng truy vấn trong ngoặc kép), `inputs[out]=tools/commons-<slug>.json` → `git pull`, lọc theo giấy phép.
  - download: arg = `tools/spec-<slug>.json` ([{title, out: "media/<slug>/raw/x.jpg", width}]); video .ogv/.webm tải bản gốc. Ghi `credits.json` (tác giả, giấy phép).
- Chỉ dùng CC0, CC BY, CC BY-SA, public domain; không dùng ảnh bản quyền (Radiopaedia, sách, bài báo không mở, hình gốc của guideline). Mỗi ảnh ghi `credit` "Ảnh: <tác giả> · <giấy phép> · Wikimedia Commons"; nhắc người dùng ghi nguồn trong mô tả video (BY-SA: phần ảnh giữ cùng giấy phép).
- Clip siêu âm/chụp mạch: `ffmpeg -i raw/x.ogv -vf crop=… -q:v 3 -start_number 0 media/<slug>/<clip>/f_%03d.jpg` (cắt bỏ chữ/ECG máy), dùng `seq` lặp theo fps.
- Đặt chú thích: dựng ảnh lưới 10% (PIL) để lấy toạ độ; chỉ ghi nhãn giải phẫu/dấu hiệu chắc chắn nhìn thấy hoặc được tác giả mô tả; nếu không chắc thì dùng nhãn vùng chung. Kiểm tra bằng still giữa cảnh (đang zoom) và cuối cảnh.
- Kiến thức ngoài guideline (ví dụ ECG trong thuyên tắc phổi) ghi rõ "kiến thức bổ sung" trên `ref` và trong lời giảng.

## Quy trình
1. Đọc cấu trúc tài liệu (PDF: `pdftotext`, xem ảnh trang có hình/bảng quan trọng; OCR .md: grep `^#`), đọc What's new/Box/Bảng/Hình; trích bảng khuyến cáo (COR/LOE) bằng script; đọc lại đúng mục nguồn trước khi viết mỗi phần. Đồng thuận chuyên gia không có GRADE: ghi rõ trên slide bìa.
2. Gửi **dàn ý loạt bài** (ghi rõ loại/giao diện; thường 2–6 phần tuỳ độ dài tài liệu, 10–15 phút/phần; người dùng thích ít phần, gọn; nêu các cảnh minh hoạ dự kiến và video ngắn) → chờ duyệt. Khi duyệt làm hết: soạn nối tiếp, mỗi phần xong đẩy dựng ngay, theo dõi bằng TaskCreate.
3. Soạn `projects/<slug>-phan-N/script.json` bằng một script Python (dùng chung hàm header + lexicon cho cả loạt). Bám sát nguồn, `ref` ghi Mục/Bảng; không bịa số liệu; đọc lại đoạn gốc trước khi viết tình huống; tình huống cộng điểm phải tự kiểm tra lại phép cộng và ngưỡng.
4. Kiểm tra: `build.py` → `capture.py stills` tại cuối mỗi cảnh (start+dur−1.5) → contact sheet 2×2 → xem chữ tràn, phụ đề che (nội dung kết thúc trên ~y=920), slide trống, tiêu đề bìa đè hình minh hoạ, nhãn `year` timeline ≤ ~10 ký tự, chữ trong nút `flow` không tràn. Thêm still giữa đếm ngược (start + cd.t0 + 3). `compare` nhận `widths` dạng chuỗi grid ("1fr 1.5fr 1.6fr") và có thể nhiều hơn 3 cột.
5. Xoá `still_*`, commit (kèm dòng Co-Authored-By theo hướng dẫn phiên), push. Không sửa script.json của phần đang dựng (sẽ dựng lại). Monitor danh sách run (lọc theo tiêu đề commit hoặc id run) mỗi 60 giây, báo mọi trạng thái kết thúc, re-arm khi hết 30 phút.
6. Xong mỗi phần: `git fetch --depth 1 origin renders && git show FETCH_HEAD:videos/<dự án>.mp4 > Ten-file.mp4` (chạy nền nếu chậm), ffprobe thời lượng + loudness (~−16 LUFS), trích vài khung (đoạn mở, cảnh minh hoạ, đếm ngược, màn hình kết) để xem, SendUserFile.
7. **Bài đăng** (khi cả loạt xong): lấy mốc thời gian thật (giải nén `<dự án>-audio.zip` vào dự án → build.py → chapters.py → srt.py → xoá `audio/`). Sinh `posts/<slug>.md` bằng script từ dữ liệu từng phần:
   - **Facebook**: câu mở gây chú ý, tiêu đề "<TÊN> · PHẦN N/M: …", 1–2 câu giới thiệu, "📌 Trong video" 5 ý ✔️ (số liệu thật), 1 câu hỏi tình huống không lộ đáp án, `👉 Tải bản dịch …: [LINK_BAN_DICH]`, `📚 Trọn bộ: [LINK_PLAYLIST]`, `[LINK_PHAN_X]` phần trước/sau, "⏱️ Mốc thời gian", câu miễn trừ giáo dục + nguồn, "🎙️ Thư Viện Y Khoa Online", 6–8 hashtag.
   - **TikTok**: ≤ 170 ký tự có hook + thời lượng, "📥 Bản dịch: link ở bio / bình luận ghim", "Phần N/M · Lưu lại để ôn tập!", 6–8 hashtag chữ thường.
   - **YouTube** mỗi phần: tiêu đề ≤ 100 ký tự, mô tả (giới thiệu, link giữ chỗ, mốc thời gian bắt đầu 00:00, nguồn, miễn trừ, mời đăng ký kênh), thẻ ≤ 500 ký tự.
   - **Video ngắn**: caption ≤ 170 ký tự kèm thời lượng giây, link video dài `[LINK_VIDEO_DAI]`, hashtag. Loạt cũ chưa có video ngắn: làm 2 video/phần từ các tình huống và bảng liều đã duyệt, chèn mục "Video ngắn dọc" vào `posts/<slug>.md` trước phần mô tả YouTube.
   - Gắn website https://thuvienykhoa.online/ ở Facebook, mô tả YouTube và bình luận ghim.
   - 1 **bình luận ghim** dùng chung. Giữ nguyên `[LINK_…]`, không bịa link.
   - Video có ảnh Commons: thêm dòng ghi nguồn ảnh (tác giả · giấy phép) vào mô tả YouTube của phần đó (kể cả ảnh dùng trên ảnh bìa).
   - Kèm ảnh bìa, file .srt (zip) và video ngắn; dòng "🎵 Nhạc nền tự tổng hợp, không bản quyền" trong mô tả YouTube.
   - Commit `[skip ci]`, `project_write` vào Project "Video Y Khoa" (present_to_user), SendUserFile.
   - Loạt Case/Bệnh học/Sinh lý không có bản dịch: thay dòng bản dịch bằng tài liệu tham khảo/slide tóm tắt `[LINK_TAI_LIEU]`.
8. **Đưa lên web** (khi người dùng chốt): repo `h6972/thu-vien-y-khoa` (đọc CLAUDE.md của repo). Tạo `content/chuyen-de/<slug>.json` (tóm tắt, điểm chính, phần với `phut`, `tinh_huong`, `moc` từ mốc thời gian thật; để trống `youtube`/`playlist`/`link`), `thu_tu` kế tiếp, `node build.mjs`, chụp kiểm tra, commit + push `main`.
9. Lưu dàn ý loạt bài vào Project "Video Y Khoa" bằng project_write.

## Schema script.json chung
Trường chung: `title, theme, tts:"vieneu", vieneu{voice:"Adam"} (video ngắn: {voice:"Mỹ Duyên", tempo:1.15}), voice, rate, series:"THƯ VIỆN Y KHOA ONLINE", subtitle, part ("<Tên> · Phần N/M"), source_short, sign:"Thư Viện Y Khoa Online", lexicon{}, brand{next,…}` (+ `rail` cho bệnh học; + `format:"vertical"` cho video ngắn; + `music{}` nếu cần chỉnh mức nhạc).
`scenes[]`: `id, layout, chapter, title, ref, lines[]` + trường layout (+ `countdown` ở quiz/decision). Mốc `at`: số = chỉ số câu, hoặc "L2+3.5". `hl`: thêm khoảng sáng viền.
- `title`: kicker, title (<br>), subtitle, badges[{t,c,at}] (ngắn, tránh đè hình bên phải), note, note_at, art (guideline: sepsis|lungs|pancreas|thyroid|mặc định tim).
- `list`/`summary`: items[{t,d,at,c,hl,n}], cols1, dense.
- `timeline`: events[{year,t,d,at,c}], note{t,at,c}.
- `formula`: main{…}, op, options[].
- `cards`: cards[{tag,t,d,items[],at,hl,c}] (3–4), h.
- `compare`: head[3+], widths (chuỗi grid), rows[{cells[],at,hl,c}].
- `box`: box{tag,t,at,c,size}, notes[{tag,t,at,c}].
- `quiz`: case, case_at, q, q_at, options[4], answer, answer_at, explain, countdown{after,s}.
Màu `c`: teal, coral, amber, green, blue, violet (mỗi giao diện tự đổi tông). Cho phép <b>, <em>, <br>.

## Phong cách lời giảng
- Xưng "Thưa quý đồng nghiệp", trang trọng; mở chương bằng vấn đề lâm sàng; giải thích "vì sao"; nhấn điểm mới, bẫy thực hành, liên hệ hồi sức.
- Mỗi phần có 1–2 tình huống với câu "Quý vị có thể tạm dừng video để suy nghĩ." (kèm `countdown`); kết thúc bằng tổng kết + giới thiệu phần sau và câu chào "…Thư Viện Y Khoa Online".
- Video ngắn: câu ngắn, nhịp nhanh, xưng "bạn", câu đầu là câu hỏi/móc.
- Viết số bằng chữ số (2026, 97,5%). Lời đọc viết đầy đủ thay viết tắt; viết tắt còn lại đưa vào `lexicon`.
- **Lexicon là thay chuỗi đơn giản theo thứ tự**: sắp khoá dài trước; tránh khoá ngắn dễ trùng (AF, ICU…); thêm cả dạng chỉ số dưới (SpO₂, PaO₂, FiO₂) nếu xuất hiện trong lời đọc.

## Lưu ý
- Không bao giờ yêu cầu người dùng gửi API key/token vào chat; chỉ lưu trong GitHub Secrets (đã có HF_TOKEN, GEMINI_API_KEY).
- Người dùng dùng Windows/PowerShell; ổ C đầy, repo trên máy ở `D:\Video-Y`.
- Bản dịch guideline là tác phẩm phái sinh của văn bản có bản quyền: nhắc ngắn kiểm tra điều kiện chia sẻ của tổ chức phát hành (một lần mỗi loạt); trên web chỉ điền link khi được phép.
- Ca lâm sàng: chỉ dùng ca minh hoạ hoặc ca đã ẩn danh hoàn toàn.
- Lưu kịch bản/dàn ý/bài đăng quan trọng vào Project "Video Y Khoa" bằng project_write.
- Skill anh em `video-thuc-hanh-hscc` (thở máy, siêu âm, thủ thuật) dùng chung toàn bộ phần nhận diện kênh, logo, website, nhạc nền, ảnh bìa, phụ đề, video ngắn ở trên; khi cập nhật mục này thì cập nhật cả skill đó.