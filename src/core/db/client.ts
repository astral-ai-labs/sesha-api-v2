/* ==========================================================================*/
// client.ts — Database client configuration
/* ==========================================================================*/
// Purpose: Initialize Drizzle ORM with PostgreSQL connection
// Sections: Imports, Client Setup, Exports

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/* ==========================================================================*/
// Client Setup
/* ==========================================================================*/

// Load environment variables
config({ path: ".env.local" });

// 1️⃣ Create PostgreSQL client -----
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

// 2️⃣ Initialize Drizzle ORM -----
export const db = drizzle({ client });
