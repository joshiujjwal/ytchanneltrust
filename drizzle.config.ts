import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load .env.local file
dotenv.config({ path: '.env.local' });

export default {
  schema: './src/lib/db/schema.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
  },
} satisfies Config;
