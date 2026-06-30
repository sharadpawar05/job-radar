import { createJobPosting } from '../storage/job-posting.js';

export async function fetchArbeitnowJobs(keywords = []) {
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
  const { data } = await res.json();

  const lowerKeywords = keywords.map(k => k.toLowerCase());

  return data
    .filter(job => {
      if (lowerKeywords.length === 0) return true;
      const tags = (job.tags || []).map(t => t.toLowerCase());
      const desc = (job.description || '').toLowerCase();
      return lowerKeywords.some(kw => tags.some(t => t.includes(kw)) || desc.includes(kw));
    })
    .map(job =>
      createJobPosting({
        title: job.title,
        company: job.company_name,
        location: job.location || '',
        description: job.description || '',
        skillsTags: job.tags || [],
        url: job.url,
        postedDate: job.created_at,
        source: 'arbeitnow'
      })
    );
}
