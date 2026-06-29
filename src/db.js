import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'coc_advisor.db');

let db;

export function initDb() {
  db = new Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS roster (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      critter_name TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'T1',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, critter_name)
    )
  `);
  // Safe migration for DBs created before tier column existed
  try { db.exec(`ALTER TABLE roster ADD COLUMN tier TEXT NOT NULL DEFAULT 'T1'`); } catch { /* already exists */ }
  return db;
}

export function getRoster(userId) {
  return db.prepare('SELECT critter_name AS name, tier FROM roster WHERE user_id = ? ORDER BY critter_name').all(userId);
}

export function setRoster(userId, entries) {
  const del = db.prepare('DELETE FROM roster WHERE user_id = ?');
  const ins = db.prepare('INSERT INTO roster (user_id, critter_name, tier) VALUES (?, ?, ?)');
  db.transaction(() => {
    del.run(userId);
    for (const { name, tier } of entries) ins.run(userId, name, tier);
  })();
}

export function clearRoster(userId) {
  db.prepare('DELETE FROM roster WHERE user_id = ?').run(userId);
}

export function addToRoster(userId, critterName) {
  db.prepare('INSERT OR IGNORE INTO roster (user_id, critter_name, tier) VALUES (?, ?, ?)').run(userId, critterName, 'T1');
}

export function removeFromRoster(userId, critterName) {
  db.prepare('DELETE FROM roster WHERE user_id = ? AND critter_name = ?').run(userId, critterName);
}
