"""Local preview that behaves like Netlify: clean URLs, _redirects, headers from netlify.toml and a real 404.

    python3 tools/serve.py [port]      # default 8766, then open http://localhost:8766/
"""
import http.server
import os
import sys
import tomllib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = tomllib.load(open(os.path.join(ROOT, "netlify.toml"), "rb"))
REDIRECTS = {}
for line in open(os.path.join(ROOT, "_redirects"), encoding="utf8"):
    parts = line.split()
    if len(parts) >= 3 and not line.startswith("#") and "*" not in parts[0]:
        REDIRECTS[parts[0]] = (parts[1], int(parts[2].rstrip("!")))


def headers_for(path):
    out = {}
    for rule in CONFIG.get("headers", []):
        pat = rule["for"]
        if pat == path or (pat.endswith("*") and path.startswith(pat[:-1])):
            out.update(rule["values"])
    return out


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        for k, v in headers_for(self.path.split("?")[0]).items():
            self.send_header(k, v)
        super().end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        if path.startswith("/tools/"):
            return self.not_found()
        if path in REDIRECTS:
            to, code = REDIRECTS[path]
            self.send_response(code)
            self.send_header("Location", to)
            return self.end_headers()
        fs = os.path.join(ROOT, path.lstrip("/"))
        if not (os.path.isfile(fs) or os.path.isfile(os.path.join(fs, "index.html"))):
            return self.not_found()
        return super().do_GET()

    def not_found(self):
        body = open(os.path.join(ROOT, "404.html"), "rb").read()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    print(f"Serving {ROOT} on http://localhost:{port}/")
    http.server.ThreadingHTTPServer(("", port), Handler).serve_forever()
