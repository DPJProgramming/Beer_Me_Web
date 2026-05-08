import Database from 'better-sqlite3';
import fs from 'fs';

// Allow selecting DB type via env var. Default to sqlite for local dev.
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
if (dbType !== 'sqlite') {
	console.log(`DB_TYPE=${dbType} - skipping SQLite setup`);
	process.exit(0);
}

const db = new Database('./data/beers.db');
const schema = fs.readFileSync('./db/schema.sql', 'utf8');
const seed = fs.readFileSync('./db/seed.sql', 'utf8');

try {
	db.exec(schema);
	db.exec(seed);
	console.log('SQLite database setup complete');
} catch (err) {
	console.error('Error running SQLite setup:', err.message);
	process.exit(1);
} finally {
	db.close();
}