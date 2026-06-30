import { createJobPosting } from '../storage/job-posting.js';

export async function fetchLinkedinJobs(query = 'javascript', location = 'India') {
  const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&f_TPR=r86400&start=0`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });

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

  const locationPattern = /class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/g;
  const locations = [...text.matchAll(locationPattern)].map(m => m[1].trim());

  const jobs = [];
  for (let i = 0; i < titles.length; i++) {
    jobs.push(createJobPosting({
      title: titles[i],
      company: companyRaw[i] || '',
      location: locations[i] || location,
      description: titles[i],
      skillsTags: [],
      url: ids[i] ? `https://www.linkedin.com/jobs/view/${ids[i]}` : '',
      postedDate: new Date().toISOString(),
      source: 'linkedin'
    }));
  }

  return jobs;
}
