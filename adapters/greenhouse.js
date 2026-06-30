import { createJobPosting } from '../storage/job-posting.js';

export async function fetchGreenhouseJobs(companySlug) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs`);
  const data = await res.json();

  if (!data.jobs || !Array.isArray(data.jobs)) {
    console.warn(`Greenhouse/${companySlug}: no jobs array returned`);
    return [];
  }

  return data.jobs.map(job =>
    createJobPosting({
      title: job.title,
      company: companySlug,
      location: job.location?.name || '',
      description: job.content || '',
      skillsTags: [],
      url: job.absolute_url,
      postedDate: job.updated_at,
      source: 'greenhouse'
    })
  );
}
