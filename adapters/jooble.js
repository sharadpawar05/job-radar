import { createJobPosting } from '../storage/job-posting.js';

export async function fetchJoobleJobs(keyword = 'javascript', country = 'India') {
  const apiKey = process.env.JOOBLE_API_KEY || '';
  if (!apiKey) {
    console.warn('Jooble: missing JOOBLE_API_KEY, skipping');
    return [];
  }

  const res = await fetch(`https://jooble.org/api/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords: keyword, location: country })
  });

  if (!res.ok) {
    console.warn(`Jooble: ${res.status}`);
    return [];
  }

  const data = await res.json();
  if (!data.jobs) return [];

  return data.jobs.map(job =>
    createJobPosting({
      title: job.title || '',
      company: job.company || '',
      location: job.location || country,
      description: job.snippet || job.description || '',
      skillsTags: [],
      url: job.link || job.url || '',
      postedDate: job.date || job.updated,
      source: 'jooble'
    })
  );
}
