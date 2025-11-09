import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import db from '../src/db/db.js';

// Properly set __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSeeds() {
  try {
    console.log('🧹 Disabling foreign key checks...');
    await db.raw('SET FOREIGN_KEY_CHECKS = 0;');

    // Fetch all tables in the current DB schema
    const [tables] = await db.raw('SHOW TABLES;');
    const tableKey = Object.keys(tables[0])[0];

    console.log('🗑️  Truncating all tables...');
    for (const row of tables) {
      const table = row[tableKey];
      await db.raw(`TRUNCATE TABLE \`${table}\`;`);
    }

    console.log('🔒 Re-enabling foreign key checks...');
    await db.raw('SET FOREIGN_KEY_CHECKS = 1;');

    // Define SQL files in the order you want to insert them
    const sqlFiles = [
      'sneakerhead_province_inserts.sql',
      'sneakerhead_cities_municipalities_insert.sql',
      'sneakerhead_inserts.sql',
    ];

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, '../src/db/inserts', file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`📥 Running ${file}...`);
      await db.raw(sql);
    }

    console.log('✅ Seeding complete!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await db.destroy();
    console.log('🔌 Database connection closed.');
  }
}

runSeeds();