#!/usr/bin/env python3
"""Ruhrgutachten Landing — CI Deploy Script
Gets the latest commit SHA from GitHub, compares with local, and auto-deploys if new.
"""
import subprocess, os, sys, json, logging, urllib.request

PROJECT_DIR = "/opt/hermes/web/ruhrgutachten-premium"
REPO = "ruhrgut8en/ruhrgutachten-landing"
DEPLOY_STATE = "/tmp/ruhrgutachten-deploy-state.json"
LOG = logging.getLogger("ci-deploy")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")

def get_remote_sha():
    """Get latest commit SHA from GitHub API"""
    url = f"https://api.github.com/repos/{REPO}/commits/master"
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json"})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        return data["sha"]
    except Exception as e:
        LOG.error(f"GitHub API fail: {e}")
        return None

def get_local_sha():
    """Get local HEAD SHA"""
    try:
        r = subprocess.run(["git", "rev-parse", "HEAD"], cwd=PROJECT_DIR,
                          capture_output=True, text=True, timeout=5)
        return r.stdout.strip() if r.returncode == 0 else None
    except:
        return None

def get_deployed_sha():
    """Get last deployed SHA from state file"""
    try:
        with open(DEPLOY_STATE) as f:
            return json.load(f).get("sha")
    except:
        return None

def save_deployed_sha(sha):
    with open(DEPLOY_STATE, "w") as f:
        json.dump({"sha": sha, "ts": subprocess.run(["date", "-Iseconds"], capture_output=True, text=True).stdout.strip()}, f)

def deploy():
    env = os.environ.copy()
    env["GIT_SSH_COMMAND"] = "ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
    
    LOG.info("📥 git pull...")
    r = subprocess.run(["git", "pull", "origin", "master"], cwd=PROJECT_DIR, env=env,
                      capture_output=True, text=True, timeout=30)
    if r.returncode != 0:
        LOG.error(f"Pull failed: {r.stderr[-200:]}")
        return False
    
    LOG.info("📦 npm ci...")
    r = subprocess.run(["npm", "ci"], cwd=PROJECT_DIR, capture_output=True, text=True, timeout=120)
    if r.returncode != 0:
        LOG.error(f"npm ci failed")
        return False
    
    LOG.info("🔨 npm run build...")
    r = subprocess.run(["npm", "run", "build"], cwd=PROJECT_DIR, capture_output=True, text=True, timeout=60)
    if r.returncode != 0:
        LOG.error(f"Build failed: {r.stderr[-200:]}")
        return False
    
    LOG.info("✅ Deploy complete")
    return True

def main():
    remote = get_remote_sha()
    if not remote:
        print("ERROR: Cannot reach GitHub")
        sys.exit(1)
    
    deployed = get_deployed_sha()
    
    if remote == deployed:
        LOG.info(f"No changes — deployed {remote[:8]}")
        return
    
    LOG.info(f"New commit! {deployed[:8] if deployed else 'none'} → {remote[:8]}")
    
    if deploy():
        save_deployed_sha(remote)
        LOG.info(f"🎉 Deployed {remote[:8]}")
    else:
        LOG.error("Deploy failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
