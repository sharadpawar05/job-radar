import { readFile } from 'node:fs/promises';
import { initDb, saveJob } from './storage/index.js';
import { fetchGreenhouseJobs } from './adapters/greenhouse.js';
import { fetchLeverJobs } from './adapters/lever.js';
import { fetchArbeitnowJobs } from './adapters/arbeitnow.js';
import { fetchRemotiveJobs } from './adapters/remotive.js';
import { fetchRemoteokJobs } from './adapters/remoteok.js';
import { fetchHackernewsJobs } from './adapters/hackernews.js';
import { fetchLinkedinJobs } from './adapters/linkedin.js';
import { scoreJob } from './matcher/index.js';
import { sendTelegramDigest } from './notifier/index.js';

async function loadConfig() {
  const raw = await readFile('./config.json', 'utf8');
  return JSON.parse(raw);
}

export async function run() {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Job run started`);

  let added = 0;
  try {
    const config = await loadConfig();
    initDb();

    const fetches = [
      ...config.greenhouse.map(slug => fetchGreenhouseJobs(slug)),
      ...config.lever.map(slug => fetchLeverJobs(slug)),
      fetchArbeitnowJobs(config.arbeitnow),
      ...config.remotive.map(cat => fetchRemotiveJobs(cat)),
      ...config.remoteok.map(tag => fetchRemoteokJobs(tag)),
      fetchHackernewsJobs(config.hackernewsLimit || 50),
      ...config.linkedin.map(q => fetchLinkedinJobs(q.query, q.location))
    ];

    const results = await Promise.allSettled(fetches);

    let totalFetched = 0;
    for (const r of results) {
      if (r.status === 'fulfilled') totalFetched += r.value.length;
      else console.warn('Source failed:', r.reason?.message || r.reason);
    }

    const allJobs = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    const newJobs = [];
    for (const job of allJobs) {
      const score = scoreJob(job.description, config.skills);
      if (score >= config.threshold) {
        saveJob(job, score);
        newJobs.push({ ...job, score });
        added++;
      }
    }

    console.log(`Fetched: ${totalFetched} jobs from ${fetches.length} sources`);
    console.log(`Added: ${added} jobs above threshold ${config.threshold}`);

    if (newJobs.length > 0) {
      await sendTelegramDigest(newJobs);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Job run failed:`, err);
  }

  const endTime = new Date().toISOString();
  console.log(`[${endTime}] Job run finished`);

  return added;
}
