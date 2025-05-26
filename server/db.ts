import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Ensure we have a DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres client
const connectionString = process.env.DATABASE_URL;
console.log("Connecting to database with URL:", connectionString ? connectionString.replace(/:.+@/, ':*****@') : 'undefined');

// For use with Node.js native driver
const sql = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 30,
  ssl: { rejectUnauthorized: false }, // Required for Supabase connections
  onnotice: () => {}, // Suppress notice messages
  debug: false // Disable verbose logging to prevent excessive output
});

// Initialize drizzle
export const db = drizzle(sql);