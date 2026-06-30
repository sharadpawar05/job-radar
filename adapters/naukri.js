import { createJobPosting } from '../storage/job-posting.js';

export async function fetchNaukriJobs(keyword = 'javascript') {
  const url = `https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_key_loc&searchType=adv&keyword=${keyword}&pageNo=1`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Accept': 'application/json',
      'appid': '109',
      'systemid': 'Naukri'
    }
  });

  if (!res.ok) {
    console.warn(`Naukri: ${res.status} for keyword="${keyword}"`);
    return [];
  }

  const data = await res.json();
  if (!data.jobDetails) return [];

  return data.jobDetails.map(job =>
    createJobPosting({
      title: job.title || '',
      company: job.companyName || '',
      location: job.locationName || '',
      description: job.jobDescription || '',
      skillsTags: job.skillTags || [],
      url: `https://www.naukri.com/jobapi/v3/job/${job.jobId}`,
      postedDate: job.lastUpdated || job.publishedDate,
      source: 'naukri'
    })
  );
}
