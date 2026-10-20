"""
Tạo giọng đọc bằng Microsoft Azure TTS cho video y khoa.
Chạy trên MÁY CỦA ANH (không gửi key cho ai).

Cài đặt (1 lần):
    pip install azure-cognitiveservices-speech

Đặt key (Windows PowerShell):
    $env:AZURE_SPEECH_KEY="dán-key-vào-đây"
    $env:AZURE_SPEECH_REGION="southeastasia"     # đúng vùng anh tạo tài nguyên Speech

Chạy (đặt file này cạnh thư mục ssml/):
    python tts_azure.py

Kết quả: thư mục audio/ gồm s1_1.mp3, s1_2.mp3, ... -> nén lại gửi cho Claude để ghép video.
Đổi giọng: sửa <voice name="..."> trong ssml (vi-VN-NamMinhNeural = nam, vi-VN-HoaiMyNeural = nữ)
"""
import os, glob, sys
import azure.cognitiveservices.speech as speechsdk

key, region = os.environ.get("AZURE_SPEECH_KEY"), os.environ.get("AZURE_SPEECH_REGION")
if not key or not region:
    sys.exit("Thiếu AZURE_SPEECH_KEY hoặc AZURE_SPEECH_REGION (xem hướng dẫn đầu file).")

here = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(here, "audio"), exist_ok=True)

cfg = speechsdk.SpeechConfig(subscription=key, region=region)
cfg.set_speech_synthesis_output_format(
    speechsdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3)

files = sorted(glob.glob(os.path.join(here, "ssml", "*.ssml")))
if not files:
    sys.exit("Không thấy thư mục ssml/ cạnh file này.")

for f in files:
    name = os.path.splitext(os.path.basename(f))[0]
    out = os.path.join(here, "audio", name + ".mp3")
    if os.path.exists(out):
        print("bỏ qua (đã có):", name); continue
    ssml = open(f, encoding="utf-8").read()
    synth = speechsdk.SpeechSynthesizer(speech_config=cfg,
                                        audio_config=speechsdk.audio.AudioOutputConfig(filename=out))
    r = synth.speak_ssml_async(ssml).get()
    if r.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print("xong:", name)
    else:
        d = r.cancellation_details
        if os.path.exists(out): os.remove(out)
        sys.exit(f"Lỗi ở {name}: {r.reason} {getattr(d, 'error_details', '')}")

print("\nHoàn tất. Nén thư mục audio/ và gửi lại cho Claude.")
