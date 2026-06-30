import { createJobPosting } from '../storage/job-posting.js';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchJobDescription(jobId) {
  try {
    const res = await fetch(`https://www.linkedin.com/jobs/view/${jobId}`, { headers: HEADERS });
    if (!res.ok) return '';
    const text = await res.text();
    const match = text.match(/description__text[^>]*>([\s\S]*?)<\/div>/);
    return match ? match[1].replace(/<[^>]+>/g, '').trim() : '';
  } catch {
    return '';
  }
}

async function fetchBatchWithLimit(jobs, limit = 5) {
  const results = [];
  for (let i = 0; i < jobs.length; i += limit) {
    const batch = jobs.slice(i, i + limit);
    const descs = await Promise.all(batch.map(j => fetchJobDescription(j.id)));
    for (let k = 0; k < batch.length; k++) {
      results.push({ ...batch[k], description: descs[k] || batch[k].title });
    }
    if (i + limit < jobs.length) await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

export async function fetchLinkedinJobs(query = 'javascript', location = 'India') {
  const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&f_TPR=r86400&start=0`;

  const res = await fetch(url, { headers: HEADERS });

  if (!res.ok) {
    console.warn(`LinkedIn: ${res.status} for query="${query}"`);
    return [];
  }

  const text = await res.text();

  const titlePattern = /<h3[^>]*base-search-card__title[^>]*>([\s\S]*?)<\/h3>/g;
  const titles = [...text.matchAll(titlePattern)].map(m => m[1].trim());

  const entityPattern = /data-entity-urn="urn:li:jobPosting:(\d+)"/g;
  const ids = [...text.matchAll(entityPattern)].map(m => m[1]);

  const subtitlePattern = /class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
  const companyRaw = [...text.matchAll(subtitlePattern)].map(m => m[1].replace(/<[^>]+>/g, '').trim());

  const locationPattern = /class="[^"]*job-search-card__location[^>]*"[^>]*>([\s\S]*?)<\/span>/g;
  const locations = [...text.matchAll(locationPattern)].map(m => m[1].trim());

  const basics = titles.map((title, i) => ({
    title,
    company: companyRaw[i] || '',
    location: locations[i] || location,
    id: ids[i] || '',
  }));

  const enriched = await fetchBatchWithLimit(basics, 5);

  return enriched.map(j =>
    createJobPosting({
      title: j.title,
      company: j.company,
      location: j.location,
      description: j.description || j.title,
      skillsTags: [],
      url: j.id ? `https://www.linkedin.com/jobs/view/${j.id}` : '',
      postedDate: new Date().toISOString(),
      source: 'linkedin'
    })
  );
}
