const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in environment. Check your .env file.");
  process.exit(1);
}

// Neon (and most hosted Postgres providers) require SSL. `rejectUnauthorized: false`
// is the standard setting for connecting to Neon from node-postgres.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

module.exports = pool;
