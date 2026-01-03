const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

// Read the migration SQL
const migrationSQL = fs.readFileSync(
  './scripts/migrations/20250103_increase_ai_usage_limit_to_50.sql',
  'utf8'
);

// Supabase connection using direct PostgreSQL connection
const client = new Client({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.wkfxwnayexznjhcktwwu',
  password: 'Freebeeri1983!',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  console.log('🔄 Connecting to Supabase database...\n');

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('🔄 Running migration to increase limit from 20 to 50...\n');

    await client.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');

    // Verify the changes
    console.log('🔍 Verifying changes...\n');
    const result = await client.query('SELECT * FROM get_ai_usage()');

    if (result.rows && result.rows.length > 0) {
      const stats = result.rows[0];
      console.log('📊 Current AI Usage Stats:');
      console.log(`   Current count: ${stats.current_count}`);
      console.log(`   Daily limit: ${stats.daily_limit}`);
      console.log(`   Remaining: ${stats.remaining}`);
      console.log('');

      if (stats.daily_limit === 50) {
        console.log('✅ SUCCESS! Daily limit is now 50 requests.');
      } else {
        console.log(`⚠️  Warning: Daily limit shows as ${stats.daily_limit}, expected 50`);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

runMigration();
