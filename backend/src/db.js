import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../tracepath.db');

let db = null;

export function initDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Enable WAL mode for better concurrency
      db.run('PRAGMA journal_mode = WAL', (err) => {
        if (err) console.warn('WAL mode not available:', err);
      });
      
      // Create batches_metadata table if it doesn't exist
      db.run(`
        CREATE TABLE IF NOT EXISTS batches_metadata (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          batchId TEXT UNIQUE NOT NULL,
          productImage BLOB,
          certificates BLOB,
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`SQLite database initialized at: ${dbPath}`);
        resolve(db);
      });
    });
  });
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

export function getBatchMetadata(batchId) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const stmt = db.prepare || db;
    
    db.get('SELECT * FROM batches_metadata WHERE batchId = ?', [batchId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

export function setBatchMetadata(batchId, metadata) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const { productImage, certificates, notes } = metadata;
    
    db.run(`
      INSERT INTO batches_metadata (batchId, productImage, certificates, notes)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(batchId) DO UPDATE SET
        productImage = excluded.productImage,
        certificates = excluded.certificates,
        notes = excluded.notes
    `, [batchId, productImage || null, certificates || null, notes || null], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

export function closeDB() {
  if (db) {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
      db = null;
    });
  }
}
