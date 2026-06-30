import { createJobPosting } from '../storage/job-posting.js';

export async function fetchHimalayasJobs(limit = 50, offset = 0) {
  const url = `https://himalayas.app/jobs/api?limit=${limit}&offset=${offset}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'JobRadar/1.0' }
  });

  if (!res.ok) {
    console.warn(`Himalayas: ${res.status}`);
    return [];
  }

  const data = await res.json();
  if (!data.jobs) return [];

  return data.jobs.map(j =>
    createJobPosting({
      title: j.title || '',
      company: j.companyName || '',
      location: (j.locationRestrictions || []).join(', ') || 'Remote',
      description: j.excerpt || j.description || j.title || '',
      skillsTags: j.categories || [],
      url: j.applicationLink || `https://himalayas.app/jobs/${j.guid}`,
      postedDate: j.pubDate || new Date().toISOString(),
      source: 'himalayas'
    })
  );
}
