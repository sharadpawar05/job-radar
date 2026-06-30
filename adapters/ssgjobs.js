import { createJobPosting } from '../storage/job-posting.js';

export async function fetchSsgJobs(tag = 'javascript') {
  const res = await fetch(`https://api.searx.jobs/v1/jobs?tag=${tag}&limit=50`, {
    headers: { 'User-Agent': 'JobRadar/1.0' }
  });

  if (!res.ok) {
    console.warn(`SsgJobs: ${res.status}`);
    return [];
  }

  const data = await res.json();
  if (!data.jobs) return [];

  return data.jobs.map(job =>
    createJobPosting({
      title: job.title || '',
      company: job.company_name || '',
      location: job.location || 'Remote',
      description: job.description || '',
      skillsTags: job.tags || [],
      url: job.url || '',
      postedDate: job.date_posted || job.created_at,
      source: 'ssgjobs'
    })
  );
}
