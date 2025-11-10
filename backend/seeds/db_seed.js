import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
// ...existing code...
import { createSshTunnel, closeSshTunnel } from "../src/db/sshTunnel.js";

// Properly set __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSeeds() {
  let db; // will import after tunnel is up
  let hadError = false;
  try {
    // create SSH tunnel so the DB module can connect via forwarded local port
    console.log("🔐 Starting SSH tunnel for seeding...");
    await createSshTunnel(); // accepts options if needed

    // import db after tunnel established so connection uses forwarded port
    const dbModule = await import("../src/db/db.js");
    db = dbModule.default;

    console.log("🧹 Disabling foreign key checks...");
    await db.raw("SET FOREIGN_KEY_CHECKS = 0;");

    // Fetch all tables in the current DB schema
    const [tables] = await db.raw("SHOW TABLES;");
    const tableKey = Object.keys(tables[0])[0];

    console.log("🗑️  Truncating all tables...");
    for (const row of tables) {
      const table = row[tableKey];
      await db.raw(`TRUNCATE TABLE \`${table}\`;`);
    }

    console.log("🔒 Re-enabling foreign key checks...");
    await db.raw("SET FOREIGN_KEY_CHECKS = 1;");

    // Define SQL files in the order you want to insert them
    const sqlFiles = [
      "sneakerhead_province_inserts.sql",
      "sneakerhead_cities_municipalities_insert.sql",
      "sneakerhead_inserts.sql",
    ];

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, "../src/db/inserts", file);
      const sql = fs.readFileSync(filePath, "utf8");
      console.log(`📥 Running ${file}...`);
      await db.raw(sql);
    }

    console.log("✅ Seeding complete!");
  } catch (err) {
    hadError = true;
    console.error("❌ Error during seeding:", err);
  } finally {
    if (db) {
      try {
        await db.destroy();
        console.log("🔌 Database connection closed.");
      } catch (e) {
        console.error("Error closing DB connection:", e);
      }
    }

    try {
      await closeSshTunnel();
      console.log("🔌 SSH tunnel closed.");
    } catch (e) {
      console.error("Error closing SSH tunnel:", e);
    }

    // exit once everything is cleaned up
    // use small delay to allow logs to flush in some environments
    setTimeout(() => {
      process.exit(hadError ? 1 : 0);
    }, 50);
  }
}

runSeeds();
