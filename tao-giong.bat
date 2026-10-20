@echo off
chcp 65001 >nul
REM Dùng: tao-giong.bat udmi5-phan-3        (tạo giọng + đẩy lên GitHub để dựng video)
REM       tao-giong.bat udmi5-phan-3 test   (chỉ 3 câu đầu để nghe thử, không đẩy lên)
cd /d "%~dp0"
if "%~1"=="" (echo Thieu ten du an, vi du: tao-giong.bat udmi5-phan-3 & pause & exit /b 1)
call .venv\Scripts\activate.bat
git pull
if /i "%~2"=="test" (
  python engine\tts_omni.py projects\%1 --test
  echo Nghe thu trong thu muc projects\%1\audio
  pause & exit /b
)
python engine\tts_omni.py projects\%1 || (pause & exit /b 1)
git add voices projects\%1\audio
git commit -m "Giong doc OmniVoice: %1"
git push
echo Da day giong len GitHub. Video se tu dung trong vai chuc phut.
pause
