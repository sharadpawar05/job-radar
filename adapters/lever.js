import { createJobPosting } from '../storage/job-posting.js';

export async function fetchLeverJobs(companySlug) {
  const res = await fetch(`https://api.lever.co/v0/postings/${companySlug}?mode=json`);
  const data = await res.json();

  if (!Array.isArray(data)) return [];

  return data.map(job =>
    createJobPosting({
      title: job.text,
      company: companySlug,
      location: job.categories?.location || '',
      url: job.hostedUrl,
      postedDate: job.createdAt,
      source: 'lever'
    })
  );
}
