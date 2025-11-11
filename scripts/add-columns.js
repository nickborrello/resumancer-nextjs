import 'dotenv/config';
import postgres from 'postgres';

// Use the DATABASE_URL from .env.local
const sql = postgres('postgresql://postgres:17129572@localhost:5432/resumancer_dev');

async function addColumns() {
  try {
    await sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "education" json;`;
    await sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "experiences" json;`;
    await sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "projects" json;`;
    await sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "skills" json;`;
    console.log('Columns added successfully');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    await sql.end();
    process.exit();
  }
}

addColumns();