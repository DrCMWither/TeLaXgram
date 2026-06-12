set -euo pipefail

: "${BOT_TOKEN:?Set BOT_TOKEN first}"
: "${WEBHOOK_SECRET:?Set WEBHOOK_SECRET first}"
: "${WORKER_URL:?Set WORKER_URL first, e.g. https://telaxgram.example.workers.dev}"

curl -sS -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\
    \"url\": \"${WORKER_URL%/}/webhook\",\
    \"secret_token\": \"${WEBHOOK_SECRET}\",\
    \"allowed_updates\": [\"inline_query\", \"message\"],\
    \"drop_pending_updates\": true\
  }" | python3 -m json.tool
