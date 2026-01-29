#!/bin/bash

# Test the n8n Deal Processor Webhook
# Usage: ./test-workflow.sh "PRODUCT_URL"

WEBHOOK_URL="http://localhost:5678/webhook/process-deal"
PRODUCT_URL="${1:-https://www.amazon.in/dp/B0DFXV72S1}"

echo "🚀 Sending product URL to n8n workflow..."
echo "URL: $PRODUCT_URL"
echo ""

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$PRODUCT_URL\"}" \
  | jq '.'

echo ""
echo "✅ Check your Telegram channel @deals_fiesta for the post!"
