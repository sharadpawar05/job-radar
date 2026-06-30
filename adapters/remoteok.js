import { createJobPosting } from '../storage/job-posting.js';

export async function fetchRemoteokJobs(tag = '') {
  const url = tag
    ? `https://remoteok.com/api?tag=${tag}`
    : 'https://remoteok.com/api';

  const res = await fetch(url, {
    headers: { 'User-Agent': 'JobRadar/1.0' }
  });
  const data = await res.json();

  if (!Array.isArray(data)) return [];

  return data
    .filter(job => job.position)
    .map(job =>
      createJobPosting({
        title: job.position,
        company: job.company || '',
        location: job.location || 'Remote',
        description: job.description || '',
        skillsTags: job.tags || [],
        url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
        postedDate: job.date || job.created_at,
        source: 'remoteok'
      })
    );
}
