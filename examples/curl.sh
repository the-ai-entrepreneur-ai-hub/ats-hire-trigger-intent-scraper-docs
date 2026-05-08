#!/usr/bin/env bash
# ATS Hire-Trigger Intent Scraper — curl examples
# Get your Apify token from https://console.apify.com/account/integrations

TOKEN="${APIFY_TOKEN:-your-token-here}"
BASE="https://george-the-developer--ats-hire-trigger-intent-scraper.apify.actor"

echo "=== Pull 50 jobs from Stripe across any ATS ==="
curl -s "$BASE/jobs?company=stripe.com&limit=50" \
  -H "Authorization: Bearer $TOKEN" | jq '.count, .ats_platform, .jobs[:2]'

echo ""
echo "=== Engineering jobs at Stripe in last 14 days, intent-enriched ==="
curl -s "$BASE/enrich?company=stripe.com&keyword=engineer&days=14&limit=20" \
  -H "Authorization: Bearer $TOKEN" | jq '.jobs[0]'

echo ""
echo "=== Cross-company keyword search ==="
curl -s "$BASE/search?keyword=sales%20engineer&companies=stripe.com,notion.so,figma.com&days=30" \
  -H "Authorization: Bearer $TOKEN" | jq '.count, .jobs[:3]'

echo ""
echo "=== Bulk enrichment (POST) — 5 companies in one call ==="
curl -s -X POST "$BASE/enrich/bulk" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"companies":["stripe.com","notion.so","figma.com","airbnb.com","gitlab.com"],"keyword":"engineer","days":30,"limit":10}' | jq '.results[].count'
