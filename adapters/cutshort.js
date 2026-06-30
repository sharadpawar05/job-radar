import { createJobPosting } from '../storage/job-posting.js';

export async function fetchCutshortJobs(role = 'software-engineer') {
  const url = `https://api.cutshort.io/jobs?role=${role}&limit=50`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) {
    console.warn(`Cutshort: ${res.status} for role="${role}"`);
    return [];
  }

  const data = await res.json();
  if (!data.jobs) return [];

  return data.jobs.map(job =>
    createJobPosting({
      title: job.title || '',
      company: job.company?.name || '',
      location: job.location || job.remote_type || 'India',
      description: job.description || '',
      skillsTags: job.skills || [],
      url: job.apply_url || `https://cutshort.io/job/${job.slug}`,
      postedDate: job.created_at,
      source: 'cutshort'
    })
  );
}
