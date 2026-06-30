import { createJobPosting } from '../storage/job-posting.js';

export async function fetchGreenhouseJobs(companySlug) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs`);
  const data = await res.json();

  return data.jobs.map(job =>
    createJobPosting({
      title: job.title,
      company: companySlug,
      location: job.location?.name || '',
      url: job.absolute_url,
      postedDate: job.updated_at,
      source: 'greenhouse'
    })
  );
}
