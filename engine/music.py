"""Nhạc nền tự tổng hợp (không bản quyền) + chuông logo + tiếng tích tắc đếm ngược, theo timeline.json.
Dùng: python engine/music.py projects/<dự án>  -> music.wav (mux.py tự gọi khi script có "brand" hoặc "music").
Mức thực đo: đoạn mở/kết ~ -19, nền dưới giọng giảng ~ -38 LUFS (giọng sau loudnorm là -16)."""
import json, os, sys, wave
import numpy as np

SR = 32000
LOOP_CH = [  # vòng hoà âm êm, Rê trưởng; mỗi hợp âm 8 giây
    [50, 54, 57, 61, 64], [47, 50, 54, 57, 61], [43, 47, 50, 54, 57], [45, 49, 52, 54, 59],
    [52, 55, 59, 62, 66], [43, 47, 50, 54, 59], [42, 45, 50, 54, 57], [45, 50, 52, 57, 61]]
CH_S, ATT, REL = 8.0, 2.6, 3.6
f = lambda m: 440.0 * 2 ** ((m - 69) / 12)


def pad_loop():
    n = int(len(LOOP_CH) * CH_S * SR)
    out = np.zeros((n, 2), np.float32)
    L = int((CH_S + REL) * SR); t = np.arange(L) / SR
    env = np.minimum(1, t / ATT) * np.clip((CH_S + REL - t) / REL, 0, 1) ** 1.6
    for k, ch in enumerate(LOOP_CH):
        notes = ch + [ch[0] - 12]
        sig = np.zeros((L, 2), np.float32)
        for j, m in enumerate(notes):
            a = (0.55 if j == len(notes) - 1 else 0.26) * (0.85 + 0.15 * np.sin(2 * np.pi * (0.07 + 0.013 * j) * t + j))
            for side, det in ((0, -1.2), (1, 1.2)):
                fr = f(m) * 2 ** (det / 1200)
                w = sum(h * np.sin(2 * np.pi * fr * (i + 1) * t + j * 0.7) for i, h in enumerate((1, .32, .1, .04)))
                sig[:, side] += (a * w).astype(np.float32)
        sig *= env[:, None]
        s0 = int(k * CH_S * SR)
        idx = (np.arange(L) + s0) % n          # vòng lặp liền mạch
        np.add.at(out, idx, sig)
    return out / np.abs(out).max() * 0.6


def bell(fr, dur=2.4, amp=0.3):
    t = np.arange(int(dur * SR)) / SR
    w = np.sin(2 * np.pi * fr * t) * np.exp(-t * 2.2) + 0.4 * np.sin(2 * np.pi * fr * 2.76 * t) * np.exp(-t * 4.5) \
        + 0.18 * np.sin(2 * np.pi * fr * 5.4 * t) * np.exp(-t * 8)
    w *= np.minimum(1, t / 0.004)
    return (amp * w).astype(np.float32)


def tick(hi=False):
    t = np.arange(int(0.09 * SR)) / SR
    fr = 1700 if hi else 1250
    return (0.16 * (np.sin(2 * np.pi * fr * t) + 0.5 * np.sin(2 * np.pi * fr * 1.5 * t)) * np.exp(-t * 70)).astype(np.float32)


def lufs(x):  # ước lượng thô (RMS, không trọng số K) – đủ để đặt mức tương đối
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9) - 0.7


def make(D):
    S = json.load(open(os.path.join(D, "timeline.json"), encoding="utf-8"))
    T = S["total"]; n = int(T * SR) + 1
    cfg = {"intro": -21.5, "bed": -40.0, "outro": -22.5}  # ước lượng RMS lệch ~+2,5 dB so với LUFS thật
    cfg.update(S.get("music") if isinstance(S.get("music"), dict) else {})
    loop = pad_loop(); base = lufs(loop)
    g = lambda db: 10 ** ((db - base) / 20)
    # đường bao âm lượng theo cảnh
    pts = [(0.0, g(cfg["bed"]))]
    intro = next((s for s in S["scenes"] if s.get("layout") == "brand"), None)
    outro = next((s for s in S["scenes"] if s.get("layout") == "endscreen"), None)
    if intro:
        e = intro["start"] + intro["dur"]
        pts = [(0.0, 0.0), (0.8, g(cfg["intro"])), (e - 0.6, g(cfg["intro"])), (e + 1.8, g(cfg["bed"]))]
    if outro:
        pts += [(outro["start"] - 0.3, g(cfg["bed"])), (outro["start"] + 1.8, g(cfg["outro"]))]
    pts += [(max(T - 3.2, pts[-1][0] + 0.1), pts[-1][1]), (T, 0.0)]
    tt = np.arange(n) / SR
    env = np.interp(tt, [p[0] for p in pts], [p[1] for p in pts]).astype(np.float32)
    reps = -(-n // len(loop))
    out = np.tile(loop, (reps, 1))[:n] * env[:, None]
    # hiệu ứng: chuông logo, tích tắc đếm ngược, chuông lộ đáp án, nốt chuông màn hình kết
    ev = []
    if intro:
        for k, (m, dt) in enumerate(((74, 0.25), (81, 0.55), (78, 0.85), (86, 1.3))):
            ev.append((intro["start"] + dt, bell(f(m), 2.8, 0.13 if k < 3 else 0.10)))
    for s in S["scenes"]:
        cd = s.get("cd")
        if not cd: continue
        t0 = s["start"] + cd["t0"]
        for k in range(int(cd["s"])):
            ev.append((t0 + k, tick(k >= cd["s"] - 3)))
        ev.append((t0 + cd["s"], bell(f(81), 1.8, 0.10)))
    if outro:
        arp = [74, 78, 81, 85, 86, 85, 81, 78]
        k = 0; t = outro["start"] + 1.0
        while t < outro["start"] + outro["dur"] - 3.5:
            ev.append((t, bell(f(arp[k % len(arp)]), 2.2, 0.045))); t += 0.75; k += 1
    for t0, w in ev:
        i = int(t0 * SR); j = min(n, i + len(w))
        if i < n: out[i:j] += w[:j - i, None]
    pk = np.abs(out).max()
    if pk > 0.95: out *= 0.95 / pk
    p = os.path.join(D, "music.wav")
    with wave.open(p, "wb") as wf:
        wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes((out * 32767).astype(np.int16).tobytes())
    print("-> music.wav", round(T, 1), "giây")
    return p


if __name__ == "__main__":
    make(os.path.abspath(sys.argv[1]))
