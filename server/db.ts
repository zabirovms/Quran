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
  ssl: { 
    rejectUnauthorized: false,
    sslmode: 'require'
  }, // Required for Supabase connections
  onnotice: () => {}, // Suppress notice messages
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  connection: {
    application_name: 'tajik-quran-portal'
  },
  transform: {
    undefined: null // Transform undefined to null
  }
});

// Test the connection
sql`SELECT 1`
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1); // Exit if we can't connect to the database
  });

// Initialize drizzle
export const db = drizzle(sql);