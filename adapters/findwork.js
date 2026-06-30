import { createJobPosting } from '../storage/job-posting.js';

export async function fetchFindworkJobs(keywords = []) {
  const token = process.env.FINDWORK_API_KEY || '';

  if (!token) {
    console.warn('Findwork: missing FINDWORK_API_KEY, skipping');
    return [];
  }

  const params = new URLSearchParams({ order_by: 'date_posted' });
  if (keywords.length) params.set('search', keywords.join(' '));

  const res = await fetch(`https://findwork.dev/api/jobs/?${params}`, {
    headers: { Authorization: `Token ${token}` }
  });
  const data = await res.json();

  if (!data.results) return [];

  return data.results.map(job =>
    createJobPosting({
      title: job.role || '',
      company: job.company_name || '',
      location: job.location || '',
      description: job.text || '',
      skillsTags: job.employment_type ? [job.employment_type] : [],
      url: job.url || job.apply_url || '',
      postedDate: job.date_posted,
      source: 'findwork'
    })
  );
}
