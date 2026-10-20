# Video Y Khoa

Quy trình tự động tạo video y khoa có giọng đọc (Microsoft Azure TTS) bằng GitHub Actions.

## Cấu trúc
- `projects/<tên>/script.json`: kịch bản lồng tiếng (chia cảnh, từng câu)
- `projects/<tên>/template.html`: hình ảnh động của từng cảnh
- `engine/`: build (timeline + SSML), tts_azure (giọng đọc), capture (dựng hình), mux (ghép tiếng)
- `fonts/`: font Inter (hỗ trợ tiếng Việt)

## Cài đặt một lần
Vào **Settings → Secrets and variables → Actions → New repository secret**, tạo 2 secret:
- `AZURE_SPEECH_KEY`: Key 1 của tài nguyên Speech trên Azure
- `AZURE_SPEECH_REGION`: vùng của tài nguyên, ví dụ `southeastasia`

## Tạo video
- Tự động: mỗi lần `script.json` hoặc `template.html` trong `projects/` thay đổi trên nhánh `main`.
- Thủ công: tab **Actions → Render video → Run workflow**, nhập tên dự án.

Kết quả: file MP4 ở mục Artifacts của lần chạy, và trong nhánh `renders`, thư mục `videos/`.

Đổi giọng đọc: sửa `"voice"` trong `script.json` (`vi-VN-NamMinhNeural` nam, `vi-VN-HoaiMyNeural` nữ).
