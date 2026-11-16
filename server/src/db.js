import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
const databaseConfig = databaseUrl
  ? { connectionString: databaseUrl }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
    };

if (!databaseUrl && (!databaseConfig.host || !databaseConfig.database || !databaseConfig.user)) {
  throw new Error('Set DATABASE_URL or provide PGHOST, PGDATABASE, and PGUSER.');
}

export const pool = new Pool(databaseConfig);
