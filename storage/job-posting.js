import { createHash } from 'node:crypto';

export function createJobPosting({ title, company, location, description, skillsTags, url, postedDate, source }) {
  const id = createHash('sha256')
    .update(`${company}${title}${url}`)
    .digest('hex');

  return {
    id,
    title,
    company,
    location: location || '',
    description: description || '',
    skillsTags: skillsTags || [],
    url,
    postedDate: postedDate ? new Date(postedDate) : new Date(),
    source: source || 'unknown'
  };
}
