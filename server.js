import 'dotenv/config';
import cron from 'node-cron';
import express from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initDb } from './storage/index.js';
import { run } from './pipeline.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const db = initDb();

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/api/jobs', (req, res) => {
  const { minScore, source, search, skills, days, page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  let where = 'SELECT * FROM jobs WHERE 1=1';
  let countSql = 'SELECT COUNT(*) as total FROM jobs WHERE 1=1';
  const params = [];
  const countParams = [];

  if (days) {
    const clause = ` AND (
      (postedDate > '2000-01-01' AND postedDate >= datetime('now', ?))
      OR
      (postedDate IS NULL OR postedDate <= '2000-01-01') AND seenAt >= datetime('now', ?)
    )`;
    where += clause;
    countSql += clause;
    const val = `-${Number(days)} days`;
    params.push(val, val);
    countParams.push(val, val);
  }

  if (minScore != null) {
    const clause = ' AND score >= ?';
    where += clause;
    countSql += clause;
    const val = Number(minScore);
    params.push(val);
    countParams.push(val);
  }

  if (source) {
    const clause = ' AND source = ?';
    where += clause;
    countSql += clause;
    params.push(source);
    countParams.push(source);
  }

  if (search) {
    const clause = ' AND (title LIKE ? OR company LIKE ? OR description LIKE ?)';
    where += clause;
    countSql += clause;
    const term = `%${search}%`;
    params.push(term, term, term);
    countParams.push(term, term, term);
  }

  if (skills) {
    const clause = ' AND skillsTags LIKE ?';
    where += clause;
    countSql += clause;
    const val = `%${skills}%`;
    params.push(val);
    countParams.push(val);
  }

  const { total } = db.prepare(countSql).get(...countParams);
  const jobs = db.prepare(where + ' ORDER BY score DESC LIMIT ? OFFSET ?').all(...params, limitNum, offset);

  res.json({
    jobs,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum)
  });
});

app.get('/api/sources', async (req, res) => {
  const raw = await readFile('./config.json', 'utf8');
  const config = JSON.parse(raw);
  const configured = new Set([
    'greenhouse', 'lever', 'arbeitnow', 'remotive', 'remoteok', 'hackernews', 'linkedin', 'weworkremotely', 'himalayas'
  ]);
  const dbSources = db.prepare('SELECT DISTINCT source FROM jobs').all().map(r => r.source);
  const all = [...new Set([...configured, ...dbSources])].sort();
  res.json(all);
});

app.post('/api/jobs/:id/applied', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('UPDATE jobs SET appliedAt = datetime(\'now\') WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({ ok: true, id });
});

app.post('/api/refresh', async (req, res) => {
  try {
    const added = await run();
    res.json({ ok: true, added });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cron.schedule('0 */6 * * *', run);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log('Scheduler started — running every 6 hours');
  run();
});
