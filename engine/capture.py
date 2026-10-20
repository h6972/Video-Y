"""Dựng hình: chụp từng khung video.html -> MP4 (song song nhiều tiến trình).
Dùng: capture.py <thư mục dự án> video [số luồng]
      capture.py <thư mục dự án> stills t1 t2 ..."""
import sys, os, subprocess, json, multiprocessing as mp
from playwright.sync_api import sync_playwright
FPS = 25

def open_page(p, D):
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    pg.goto(f'file://{D}/video.html?capture'); pg.evaluate('FONTS_READY'); pg.wait_for_timeout(500)
    return b, pg

def seg(args):
    D, k, f0, f1 = args
    out = f'{D}/_seg{k:02d}.mp4'
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'veryfast', out],
                          stdin=subprocess.PIPE)
    with sync_playwright() as p:
        b, pg = open_page(p, D)
        for i in range(f0, f1):
            pg.evaluate(f'render({i / FPS})')
            ff.stdin.write(pg.screenshot(type='jpeg', quality=90))
            if (i - f0) % 1000 == 0: print(f'luồng {k}: {i - f0}/{f1 - f0}', flush=True)
        b.close()
    ff.stdin.close(); ff.wait()
    return out

if __name__ == '__main__':
    D = os.path.abspath(sys.argv[1]); mode = sys.argv[2]
    if mode == 'stills':
        with sync_playwright() as p:
            b, pg = open_page(p, D)
            for t in map(float, sys.argv[3:]):
                pg.evaluate(f'render({t})'); pg.screenshot(path=f'{D}/still_{t:06.1f}.png')
            b.close()
        sys.exit()
    total = json.load(open(f'{D}/timeline.json', encoding='utf-8'))['total']
    n = int(total * FPS) + 1
    W = int(sys.argv[3]) if len(sys.argv) > 3 else max(1, min(4, os.cpu_count() or 1))
    step = -(-n // W)
    jobs = [(D, k, k * step, min(n, (k + 1) * step)) for k in range(W) if k * step < n]
    with mp.Pool(len(jobs)) as pool:
        segs = pool.map(seg, jobs)
    lst = f'{D}/_segs.txt'
    open(lst, 'w').write(''.join(f"file '{s}'\n" for s in segs))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy',
                    f'{D}/video-silent.mp4'], check=True)
    for s in segs + [lst]: os.remove(s)
    print('-> video-silent.mp4', n, 'khung,', len(jobs), 'luồng')
