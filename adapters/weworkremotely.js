import { createJobPosting } from '../storage/job-posting.js';

export async function fetchWeworkremotelyJobs(category = 'remote-programming-jobs') {
  const rssUrl = `https://weworkremotely.com/categories/${category}.rss`;

  const res = await fetch(rssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
  });

  if (!res.ok) {
    console.warn(`WeWorkRemotely: ${res.status} for category="${category}"`);
    return [];
  }

  const text = await res.text();
  const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  return items.map(([, item]) => {
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || [])[1] ||
                  (item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
    const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
    const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || [])[1] || '';
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';

    const companyMatch = title.match(/^(.*?):/);
    const company = companyMatch ? companyMatch[1].trim() : '';
    const cleanTitle = company ? title.replace(/^.*?:\s*/, '').trim() : title;

    return createJobPosting({
      title: cleanTitle,
      company,
      location: 'Remote',
      description: desc.replace(/<[^>]+>/g, '').trim(),
      skillsTags: [],
      url: link,
      postedDate: pubDate,
      source: 'weworkremotely'
    });
  });
}
