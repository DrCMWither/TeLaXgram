set -euo pipefail

: "${BOT_TOKEN:?Set BOT_TOKEN first}"
: "${WEBHOOK_SECRET:?Set WEBHOOK_SECRET first}"
: "${WORKER_URL:?Set WORKER_URL first, e.g. https://telaxgram.example.workers.dev}"

payload="$(python3 -c 'import json, os, re, sys; secret=os.environ["WEBHOOK_SECRET"]; url=os.environ["WORKER_URL"].rstrip("/") + "/webhook"; sys.exit("WEBHOOK_SECRET must match [A-Za-z0-9_-]{1,256}") if not re.fullmatch(r"[A-Za-z0-9_-]{1,256}", secret) else None; print(json.dumps({"url": url, "secret_token": secret, "allowed_updates": ["inline_query", "message", "callback_query"], "drop_pending_updates": True}, ensure_ascii=False))')"; curl --fail-with-body -sS -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" -H "Content-Type: application/json" -d "$payload" | python3 -m json.tool