@echo off
chcp 65001 >nul
REM Chọn giọng ứng viên làm giọng chuẩn của kênh:  chon-giong.bat nam-03
cd /d "%~dp0"
if "%~1"=="" (echo Thieu ten giong, vi du: chon-giong.bat nam-03 & pause & exit /b 1)
if not exist "giong-ung-vien\%1.wav" (echo Khong thay giong-ung-vien\%1.wav & pause & exit /b 1)
if not exist voices mkdir voices
copy /y "giong-ung-vien\%1.wav" voices\nam.wav >nul
copy /y "giong-ung-vien\loi-doc.txt" voices\nam.txt >nul
echo Da chon %1 lam giong chuan cua kenh (voices\nam.wav).
echo Xoa giong thu cu de tao lai bang giong moi...
for /d %%d in (projects\*) do if exist "%%d\audio\*.flac" del /q "%%d\audio\*.flac"
echo Xong. Nghe thu lai:  tao-giong.bat udmi5-phan-1 test
pause
