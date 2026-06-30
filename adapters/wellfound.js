import { createJobPosting } from '../storage/job-posting.js';

export async function fetchWellfoundJobs(role = 'software-engineer') {
  const rssUrl = `https://wellfound.com/jobs.rss?role=${role}`;
  const res = await fetch(rssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  if (!res.ok) {
    console.warn(`Wellfound: ${res.status}`);
    return [];
  }

  const text = await res.text();
  const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  return items.map(([, item]) => {
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || [])[1] || '';
    const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
    const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || [])[1] || '';
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';

    return createJobPosting({
      title,
      company: 'Startup',
      location: 'India',
      description: desc,
      skillsTags: [],
      url: link,
      postedDate: pubDate,
      source: 'wellfound'
    });
  });
}
