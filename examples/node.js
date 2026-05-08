// ATS Hire-Trigger Intent Scraper — Node.js example
// Requires Node 18+ (built-in fetch)

const TOKEN = process.env.APIFY_TOKEN;
if (!TOKEN) throw new Error('Set APIFY_TOKEN env var. Get one at https://console.apify.com/account/integrations');

const BASE = 'https://george-the-developer--ats-hire-trigger-intent-scraper.apify.actor';

async function jobs(company, { keyword = '', days = 90, country = '', limit = 50 } = {}) {
  const qs = new URLSearchParams({ company, keyword, days, country, limit }).toString();
  const res = await fetch(`${BASE}/jobs?${qs}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Jobs failed: ${res.status}`);
  return res.json();
}

async function enrich(company, { keyword = '', days = 90, limit = 50 } = {}) {
  const qs = new URLSearchParams({ company, keyword, days, limit }).toString();
  const res = await fetch(`${BASE}/enrich?${qs}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Enrich failed: ${res.status}`);
  return res.json();
}

async function enrichBulk(companies, { keyword = '', days = 30, limit = 50 } = {}) {
  const res = await fetch(`${BASE}/enrich/bulk`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ companies, keyword, days, limit }),
  });
  if (!res.ok) throw new Error(`Bulk enrich failed: ${res.status}`);
  return res.json();
}

// Use case: find companies hiring Sales Engineers AND mentioning Salesforce in the JD
const targetCompanies = ['stripe.com', 'notion.so', 'figma.com', 'gitlab.com', 'airbnb.com'];
const result = await enrichBulk(targetCompanies, { keyword: 'sales engineer', days: 30 });

const usingSalesforce = [];
for (const company of result.results) {
  for (const job of company.jobs || []) {
    if (job.intent_signals?.tech_keywords?.includes('Salesforce')) {
      usingSalesforce.push({
        company: company.company,
        title: job.job_title,
        url: job.job_url,
        posted: job.posted_at,
        surge: job.intent_signals.hiring_surge,
      });
    }
  }
}

console.log(`${usingSalesforce.length} Sales Engineer roles mentioning Salesforce, posted in last 30 days`);
console.table(usingSalesforce);
