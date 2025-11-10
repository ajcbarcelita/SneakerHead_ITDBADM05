// testConnection.js
import db from "./db.js"; // adjust path if needed

async function testDbConnection() {
  try {
    // Try a simple query
    const result = await db.raw("SELECT 1+1 AS result");
    console.log("✅ Database connection successful!");
    console.log("Test query result:", result[0] || result); // MySQL may wrap results
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  } finally {
    // Always close the connection
    await db.destroy();
  }
}

testDbConnection();
