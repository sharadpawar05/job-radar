import 'dotenv/config';
import cron from 'node-cron';
import express from 'express';
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
  const { minScore, source, search, skills, days } = req.query;
  let sql = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];

  if (days) {
    sql += ' AND seenAt >= datetime(\'now\', ?)';
    params.push(`-${Number(days)} days`);
  }

  if (minScore != null) {
    sql += ' AND score >= ?';
    params.push(Number(minScore));
  }

  if (source) {
    sql += ' AND source = ?';
    params.push(source);
  }

  if (search) {
    sql += ' AND (title LIKE ? OR company LIKE ? OR description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (skills) {
    sql += ' AND skillsTags LIKE ?';
    params.push(`%${skills}%`);
  }

  sql += ' ORDER BY score DESC';

  const jobs = db.prepare(sql).all(...params);
  res.json(jobs);
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
