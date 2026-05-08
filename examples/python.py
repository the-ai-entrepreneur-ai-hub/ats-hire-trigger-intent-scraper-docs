"""ATS Hire-Trigger Intent Scraper — Python example"""
import os
import urllib.parse
import requests

TOKEN = os.getenv("APIFY_TOKEN")
if not TOKEN:
    raise RuntimeError("Set APIFY_TOKEN env var. Get one at https://console.apify.com/account/integrations")

BASE = "https://george-the-developer--ats-hire-trigger-intent-scraper.apify.actor"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}


def jobs(company: str, keyword: str = "", days: int = 90, country: str = "", limit: int = 50) -> dict:
    qs = urllib.parse.urlencode({"company": company, "keyword": keyword, "days": days, "country": country, "limit": limit})
    r = requests.get(f"{BASE}/jobs?{qs}", headers=HEADERS, timeout=120)
    r.raise_for_status()
    return r.json()


def enrich(company: str, keyword: str = "", days: int = 90, limit: int = 50) -> dict:
    qs = urllib.parse.urlencode({"company": company, "keyword": keyword, "days": days, "limit": limit})
    r = requests.get(f"{BASE}/enrich?{qs}", headers=HEADERS, timeout=120)
    r.raise_for_status()
    return r.json()


def enrich_bulk(companies: list[str], keyword: str = "", days: int = 30, limit: int = 50) -> dict:
    r = requests.post(
        f"{BASE}/enrich/bulk",
        headers=HEADERS,
        json={"companies": companies, "keyword": keyword, "days": days, "limit": limit},
        timeout=300,
    )
    r.raise_for_status()
    return r.json()


# Use case: Vanta / Drata outbound — find companies hiring their first Security Engineer
target_companies = ["stripe.com", "notion.so", "figma.com", "gitlab.com", "airbnb.com", "linear.app"]
result = enrich_bulk(target_companies, keyword="security engineer", days=30)

first_security_hires = []
for company in result["results"]:
    for job in company.get("jobs", []):
        if job.get("intent_signals", {}).get("first_in_function"):
            first_security_hires.append({
                "company": company["company"],
                "title": job["job_title"],
                "url": job["job_url"],
                "posted": job["posted_at"],
                "tech_stack": ", ".join(job.get("intent_signals", {}).get("tech_keywords", [])),
            })

print(f"{len(first_security_hires)} companies hiring their first Security Engineer in the last 30 days")
for hire in first_security_hires:
    print(f"  {hire['company']:25s}  {hire['title']:35s}  posted {hire['posted']}  stack: {hire['tech_stack']}")
