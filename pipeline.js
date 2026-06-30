import { readFile } from 'node:fs/promises';
import { initDb, saveJob } from './storage/index.js';
import { fetchGreenhouseJobs } from './adapters/greenhouse.js';
import { fetchLeverJobs } from './adapters/lever.js';
import { fetchArbeitnowJobs } from './adapters/arbeitnow.js';
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

    const greenhouseJobs = config.greenhouse.map(slug => fetchGreenhouseJobs(slug));
    const leverJobs = config.lever.map(slug => fetchLeverJobs(slug));
    const arbeitnowJobs = [fetchArbeitnowJobs(config.arbeitnow)];

    const results = await Promise.all([...greenhouseJobs, ...leverJobs, ...arbeitnowJobs]);
    const allJobs = results.flat();

    const newJobs = [];
    for (const job of allJobs) {
      const score = scoreJob(job.description, config.skills);
      if (score >= config.threshold) {
        saveJob(job, score);
        newJobs.push({ ...job, score });
        added++;
      }
    }

    console.log(`Fetched: ${allJobs.length} jobs`);
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
