# Video Y Khoa

Quy trình tự động tạo video y khoa có giọng đọc (Microsoft Azure TTS) bằng GitHub Actions.

## Cấu trúc
- `projects/<tên>/script.json`: kịch bản lồng tiếng (chia cảnh, từng câu)
- `projects/<tên>/template.html`: hình ảnh động của từng cảnh
- `engine/`: build (timeline + SSML), tts_azure (giọng đọc), capture (dựng hình), mux (ghép tiếng)
- `fonts/`: font Inter (hỗ trợ tiếng Việt)

## Giọng đọc
`"tts"` trong `script.json`: `"edge"` (mặc định, miễn phí, không cần key) hoặc `"azure"` (chính thức, cần secret bên dưới).

## Cài đặt Azure (chỉ khi dùng "azure")
Vào **Settings → Secrets and variables → Actions → New repository secret**, tạo 2 secret:
- `AZURE_SPEECH_KEY`: Key 1 của tài nguyên Speech trên Azure
- `AZURE_SPEECH_REGION`: vùng của tài nguyên, ví dụ `southeastasia`

## Tạo video
- Tự động: mỗi lần `script.json` hoặc `template.html` trong `projects/` thay đổi trên nhánh `main`.
- Thủ công: tab **Actions → Render video → Run workflow**, nhập tên dự án.

Kết quả: file MP4 ở mục Artifacts của lần chạy, và trong nhánh `renders`, thư mục `videos/`.

Đổi giọng đọc: sửa `"voice"` trong `script.json` (`vi-VN-NamMinhNeural` nam, `vi-VN-HoaiMyNeural` nữ).

## Giọng OmniVoice trên máy có GPU (Windows, card NVIDIA)
Trong `script.json` đặt `"tts": "omni"` (tuỳ chọn `"omni": {"voice": "nam", "instruct": "male, middle-aged, low pitch"}`).

### Cài đặt một lần
1. Cập nhật driver NVIDIA mới nhất (GeForce Experience / NVIDIA App).
2. Cài **Python 3.12** (python.org, tích *Add python.exe to PATH*) và **Git for Windows**.
3. Mở PowerShell:
   ```
   cd $HOME\Documents
   git clone https://github.com/h6972/Video-Y.git
   cd Video-Y
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu128
   pip install omnivoice soundfile
   hf auth login
   ```
   (dán HF token khi được hỏi; đã đồng ý điều khoản trang g-group-ai-lab/g-omnivoice)

### Mỗi video
- Nghe thử 3 câu: `tao-giong.bat <dự án> test`
- Tạo giọng + đẩy lên GitHub: `tao-giong.bat <dự án>` → GitHub tự dựng video.
- Giọng chuẩn của kênh nằm ở `voices/` (tạo lần đầu, dùng lại cho mọi video; xoá file để tạo giọng mới).
