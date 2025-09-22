import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load environment variables

// Check if a database connection already exists (to prevent multiple pools)
if (!global.dbPool) {
  global.dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 200,
    queueLimit: 0,
    connectTimeout: 20000,
  });

  console.log("✅ Database connection pool initialized");
}

const db = global.dbPool; // Use the globally stored connection pool

// Test database connection once (only when initializing the pool)
async function testDatabaseConnection() {
  try {
    const connection = await db.getConnection();
    console.log("✅ Connection successful!");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // Exit the process if connection fails
  }
}

// Test connection only if this is the first initialization
if (!global.dbTested) {
  testDatabaseConnection();
  global.dbTested = true; // Ensure this runs only once
}

export default db;

