"""Tell IndexNow search engines (Bing, Yandex, Naver, Seznam; Bing also feeds Copilot and ChatGPT search) that pages changed.

Run after a deploy:  python3 tools/indexnow.py            (every URL in sitemap.xml)
                     python3 tools/indexnow.py /about/ ...  (just these paths)
The key file /<INDEXNOW_KEY>.txt is written by build.py and must be live first.
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from build import INDEXNOW_KEY, SITE_URL  # noqa: E402


def main():
    if len(sys.argv) > 1:
        urls = [SITE_URL + "/" + a.lstrip("/") for a in sys.argv[1:]]
    else:
        urls = re.findall(r"<loc>([^<]+)</loc>", (ROOT / "sitemap.xml").read_text(encoding="utf8"))
    host = SITE_URL.split("//", 1)[1]
    body = json.dumps({"host": host, "key": INDEXNOW_KEY, "keyLocation": f"{SITE_URL}/{INDEXNOW_KEY}.txt",
                       "urlList": urls}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body,
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f"IndexNow: {r.status} for {len(urls)} URL(s)")


if __name__ == "__main__":
    main()
