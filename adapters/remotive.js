import { createJobPosting } from '../storage/job-posting.js';

export async function fetchRemotiveJobs(category = '') {
  const url = category
    ? `https://remotive.com/api/remote-jobs?category=${category}`
    : 'https://remotive.com/api/remote-jobs';

  const res = await fetch(url);
  const { jobs } = await res.json();

  return jobs.map(job =>
    createJobPosting({
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      description: job.description || '',
      skillsTags: job.tags || [],
      url: job.url,
      postedDate: job.publication_date,
      source: 'remotive'
    })
  );
}
