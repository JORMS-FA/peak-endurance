import urllib.request, json, os, sys

token = os.environ.get('SUPA_TOKEN', '').strip()
if not token:
    tf = os.environ.get('TEMP', 'C:\Temp') + '\supa_token.txt'
    with open(tf) as f:
        token = f.read().strip()

data = json.dumps({
    "site_url": "https://peak-endurance.vercel.app",
    "redirect_urls": ["https://peak-endurance.vercel.app"],
    "additional_redirect_urls": []
}).encode()

try:
    req = urllib.request.Request(
        "https://api.supabase.com/v1/projects/uoxumppvhismnttfllzj/config/auth",
        data=data, method="PATCH",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req)
    body = json.loads(resp.read())
    print("OK:", json.dumps(body, indent=2)[:500])
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}: {e.read().decode()[:300]}")
except Exception as e:
    print(f"ERROR: {e}")
