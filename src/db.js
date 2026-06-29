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
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, critter_name)
    )
  `);
  return db;
}

export function getRoster(userId) {
  // TODO: return array of critter names for userId
  return [];
}

export function addToRoster(userId, critterName) {
  // TODO: insert (userId, critterName) into roster table
}

export function removeFromRoster(userId, critterName) {
  // TODO: delete (userId, critterName) from roster table
}
