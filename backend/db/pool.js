const mysql = require("mysql2/promise");

function requireEnv(name, fallback = "") {
  const value = (process.env[name] ?? fallback ?? "").toString().trim();
  if (!value) throw new Error(`Falta variable de entorno: ${name}`);
  return value;
}

function toInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

let pool;

function getPool() {
  if (pool) return pool;

  const host = requireEnv("DB_HOST", "localhost");
  const user = requireEnv("DB_USER", "root");
  const password = process.env.DB_PASSWORD ?? "";
  const database = requireEnv("DB_NAME", "");
  const port = toInt(process.env.DB_PORT, 3306);

  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

module.exports = { getPool };

