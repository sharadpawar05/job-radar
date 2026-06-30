import { createJobPosting } from '../storage/job-posting.js';

async function fetchHnItem(id) {
  const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
  return res.json();
}

export async function fetchHackernewsJobs(limit = 50) {
  const res = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json');
  const ids = await res.json();

  const stories = await Promise.all(ids.slice(0, limit).map(fetchHnItem));

  return stories
    .filter(s => s && s.title)
    .map(job =>
      createJobPosting({
        title: job.title,
        company: 'YC Job',
        location: 'Remote',
        description: job.text || '',
        skillsTags: [],
        url: job.url || `https://news.ycombinator.com/item?id=${job.id}`,
        postedDate: new Date(job.time * 1000).toISOString(),
        source: 'hackernews'
      })
    );
}
