import { createJobPosting } from '../storage/job-posting.js';

export async function fetchAdzunaJobs(country = 'us', query = 'developer') {
  const appId = process.env.ADZUNA_APP_ID || '';
  const appKey = process.env.ADZUNA_APP_KEY || '';

  if (!appId || !appKey) {
    console.warn('Adzuna: missing ADZUNA_APP_ID or ADZUNA_APP_KEY, skipping');
    return [];
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${query}&content-type=application/json`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.results) return [];

  return data.results.map(job =>
    createJobPosting({
      title: job.title,
      company: job.company?.display_name || '',
      location: job.location?.display_name || '',
      description: job.description || '',
      skillsTags: job.tags || [],
      url: job.redirect_url,
      postedDate: job.created,
      source: 'adzuna'
    })
  );
}
