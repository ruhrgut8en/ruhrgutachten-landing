#!/usr/bin/env python3
"""Ruhrgutachten Landing — Deploy Webhook Listener"""
import subprocess, os, sys, json, logging
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get("WEBHOOK_PORT", 9876))
TOKEN = os.environ.get("WEBHOOK_TOKEN", "").strip()
PROJECT_DIR = "/opt/hermes/web/ruhrgutachten-premium"
LOG = logging.getLogger("deploy")

if not TOKEN:
    try:
        with open("/opt/data/secrets/hermes_windows.token") as f:
            TOKEN = f.read().strip()
    except:
        pass
    if not TOKEN:
        print("FATAL: No WEBHOOK_TOKEN set", file=sys.stderr)
        sys.exit(1)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")

def deploy():
    LOG.info("🚀 Deploy triggered")
    env = os.environ.copy()
    env["GIT_SSH_COMMAND"] = "ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
    
    steps = [
        (["git", "pull", "origin", "master"], "pull"),
        (["npm", "ci"], "install"),
        (["npm", "run", "build"], "build"),
    ]
    
    for cmd, name in steps:
        LOG.info(f"Running: {name}")
        try:
            r = subprocess.run(cmd, cwd=PROJECT_DIR, env=env, capture_output=True, text=True, timeout=120)
            if r.returncode != 0:
                LOG.error(f"FAIL {name}: {r.stderr[-500:]}")
                return False, r.stderr[-500:]
            LOG.info(f"OK {name}")
        except subprocess.TimeoutExpired:
            LOG.error(f"TIMEOUT {name}")
            return False, f"Timeout at {name}"
    
    LOG.info("✅ Deploy complete")
    return True, "deployed"

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        auth = self.headers.get("Authorization", "")
        token = auth.replace("Bearer ", "").strip()
        
        if token != TOKEN:
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b'{"error":"unauthorized"}')
            return
        
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b"{}"
        LOG.info(f"Webhook from: {json.loads(body).get('actor', 'unknown')}")
        
        ok, msg = deploy()
        status = 200 if ok else 500
        self.send_response(status)
        self.end_headers()
        self.wfile.write(json.dumps({"status": msg}).encode())
    
    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        LOG.info(f"{self.client_address[0]} — {format % args}")

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), Handler)
    LOG.info(f"🔌 Deploy webhook on :{PORT}")
    server.serve_forever()
