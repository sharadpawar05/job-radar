import { createJobPosting } from '../storage/job-posting.js';

export async function fetchIndeedJobs(query = 'javascript', country = 'in') {
  // Indeed RSS feed - works without API key
  const rssUrl = `https://www.indeed.${country === 'in' ? 'co.in' : 'com'}/rss?q=${encodeURIComponent(query)}&sort=date&limit=50`;

  const res = await fetch(rssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
  });

  if (!res.ok) {
    console.warn(`Indeed: ${res.status} for query="${query}"`);
    return [];
  }

  const text = await res.text();
  const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  return items.map(([, item]) => {
    const title = (item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
    const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
    const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || [])[1] || '';
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
    const source_tag = (item.match(/<source>(.*?)<\/source>/) || [])[1] || '';

    return createJobPosting({
      title: title.replace(/ - .*$/, '').trim(),
      company: source_tag || '',
      location: country === 'in' ? 'India' : '',
      description: desc,
      skillsTags: [],
      url: link,
      postedDate: pubDate,
      source: 'indeed'
    });
  });
}
