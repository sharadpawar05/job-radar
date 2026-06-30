import Database from 'better-sqlite3';

let db;

export function initDb(dbPath = './jobs.db') {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT,
      company TEXT,
      location TEXT,
      description TEXT,
      skillsTags TEXT,
      url TEXT,
      postedDate TEXT,
      source TEXT,
      score REAL,
      seenAt TEXT,
      appliedAt TEXT
    )
  `);

  const cols = db.prepare("PRAGMA table_info(jobs)").all();
  if (!cols.some(c => c.name === 'appliedAt')) {
    db.exec(`ALTER TABLE jobs ADD COLUMN appliedAt TEXT`);
  }

  return db;
}

export function saveJob(job, score = 0) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO jobs (id, title, company, location, description, skillsTags, url, postedDate, source, score, seenAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    job.id,
    job.title,
    job.company,
    job.location,
    job.description,
    JSON.stringify(job.skillsTags),
    job.url,
    job.postedDate?.toISOString() || new Date().toISOString(),
    job.source,
    score,
    new Date().toISOString()
  );
}

export function getDb() {
  return db;
}
