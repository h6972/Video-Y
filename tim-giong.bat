@echo off
chcp 65001 >nul
REM Tạo nhiều giọng ứng viên để chọn:  tim-giong.bat [số nam] [số nữ]   (mặc định 6 6)
cd /d "%~dp0"
call .venv\Scripts\activate.bat
git pull
python engine\tim_giong.py %1 %2
start "" giong-ung-vien
pause
