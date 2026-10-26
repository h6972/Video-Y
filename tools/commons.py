"""Tìm và tải ảnh có giấy phép tự do từ Wikimedia Commons (chạy trên GitHub Actions).
search:   python tools/commons.py search <out.json> "query 1" "query 2" ...
download: python tools/commons.py download <spec.json>
spec: [{"title": "File:...", "out": "projects/x/img/a.jpg", "width": 1600}]
"""
import json, re, sys, os, time, urllib.request, urllib.parse
UA = {"User-Agent": "ThuVienYKhoaOnline-video-bot/1.0 (https://github.com/h6972/Video-Y; educational)"}
API = "https://commons.wikimedia.org/w/api.php"
def get(url, raw=False):
    for i in range(4):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
            return r if raw else json.loads(r)
        except Exception as e:
            print("retry", url[:120], e); time.sleep(3 + 3 * i)
    raise SystemExit("failed " + url)
def strip(h): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h or "")).strip()
def info(params):
    q = {"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": "1600"}
    q.update(params)
    d = get(API + "?" + urllib.parse.urlencode(q))
    out = []
    for p in (d.get("query", {}).get("pages", {}) or {}).values():
        ii = (p.get("imageinfo") or [{}])[0]; m = ii.get("extmetadata", {})
        out.append({"title": p.get("title"), "mime": ii.get("mime"), "w": ii.get("width"), "h": ii.get("height"),
                    "thumb": ii.get("thumburl"), "url": ii.get("url"), "page": ii.get("descriptionurl"),
                    "license": strip(m.get("LicenseShortName", {}).get("value")), "artist": strip(m.get("Artist", {}).get("value"))[:120],
                    "desc": strip(m.get("ImageDescription", {}).get("value"))[:300]})
    return out
if sys.argv[1] == "search":
    res = {}
    for q in sys.argv[3:]:
        res[q] = info({"generator": "search", "gsrsearch": q, "gsrnamespace": "6", "gsrlimit": "25"})
        print(q, len(res[q]))
    os.makedirs(os.path.dirname(sys.argv[2]), exist_ok=True)
    json.dump(res, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
else:
    spec = json.load(open(sys.argv[2])); credits = {}
    for s in spec:
        i = info({"titles": s["title"], "iiurlwidth": str(s.get("width", 1600))})[0]
        src = i["url"] if (s.get("orig") or (i["mime"] or "").startswith(("video","application/ogg"))) else (i["thumb"] or i["url"])
        os.makedirs(os.path.dirname(s["out"]), exist_ok=True)
        open(s["out"], "wb").write(get(src, raw=True))
        d = os.path.dirname(s["out"]); credits.setdefault(d, {})[os.path.basename(s["out"])] = {k: i[k] for k in ("title", "page", "license", "artist", "w", "h")}
        print("ok", s["out"], i["license"])
    for d, c in credits.items():
        p = os.path.join(d, "credits.json"); old = json.load(open(p)) if os.path.exists(p) else {}
        old.update(c); json.dump(old, open(p, "w"), ensure_ascii=False, indent=1)
