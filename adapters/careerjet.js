import { createJobPosting } from '../storage/job-posting.js';

export async function fetchCareerjetJobs(keyword = 'javascript', country = 'in') {
  const res = await fetch(
    `https://public.api.careerjet.net/search?locale_code=en_in&location=India&keywords=${encodeURIComponent(keyword)}&resultsperpage=50&sort=date`,
    { headers: { 'User-Agent': 'JobRadar/1.0' } }
  );

  if (!res.ok) {
    console.warn(`CareerJet: ${res.status}`);
    return [];
  }

  const text = await res.text();
  const items = [...text.matchAll(/<job>([\s\S]*?)<\/job>/g)];

  return items.map(([, item]) => {
    const title = (item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
    const company = (item.match(/<company>(.*?)<\/company>/) || [])[1] || '';
    const url = (item.match(/<url>(.*?)<\/url>/) || [])[1] || '';
    const description = (item.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '';
    const date = (item.match(/<date>(.*?)<\/date>/) || [])[1] || '';
    const location = (item.match(/<location>(.*?)<\/location>/) || [])[1] || 'India';

    return createJobPosting({
      title: title.replace(/<[^>]*>/g, '').trim(),
      company,
      location,
      description: description.replace(/<[^>]*>/g, '').trim(),
      skillsTags: [],
      url,
      postedDate: date,
      source: 'careerjet'
    });
  });
}
