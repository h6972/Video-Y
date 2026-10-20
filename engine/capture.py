import sys, subprocess, json, os
from playwright.sync_api import sync_playwright
D=os.path.abspath(sys.argv[1]); mode=sys.argv[2]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1920,'height':1080})
    pg.goto(f'file://{D}/video.html?capture'); pg.evaluate('FONTS_READY'); pg.wait_for_timeout(500)
    total=pg.evaluate('TOTAL')
    if mode=='stills':
        for t in map(float,sys.argv[3:]):
            pg.evaluate(f'render({t})'); pg.screenshot(path=f'{D}/still_{t:06.1f}.png',type='png')
    else:
        fps=25; n=int(total*fps)+1
        ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(fps),'-i','-',
            '-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium',f'{D}/video-silent.mp4'],stdin=subprocess.PIPE)
        for i in range(n):
            pg.evaluate(f'render({i/fps})'); ff.stdin.write(pg.screenshot(type='jpeg',quality=92))
            if i%250==0: print(i,n,flush=True)
        ff.stdin.close(); ff.wait()
    b.close()
