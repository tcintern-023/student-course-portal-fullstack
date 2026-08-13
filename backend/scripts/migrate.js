require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function migrate() {
  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  console.log("Running migration against:", maskUrl(process.env.DATABASE_URL));

  try {
    await pool.query(sql);
    console.log("✅ Migration complete — tables created (or already existed).");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

/** Hides the password in the connection string when logging. */
function maskUrl(url) {
  if (!url) return "(none)";
  return url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
}

migrate();
