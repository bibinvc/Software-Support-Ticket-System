#!/usr/bin/env node

/**
 * Migration script to update existing database to new schema
 * Adds missing columns and updates table structure
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SCHEMA_FILE = path.join(__dirname, '../db/migrations/schema.sql');
const MIGRATION_FILE = path.join(__dirname, '../db/migrations/add_mfa_columns.sql');

// Get connection details from DATABASE_URL
function getConnectionConfig() {
  const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/sharing_economy_db';
  const urlMatch = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  
  if (!urlMatch) {
    throw new Error('Invalid DATABASE_URL format. Expected: postgres://user:pass@host:port/database');
  }

  const [, username, password, host, port, database] = urlMatch;
  
  return {
    host,
    port: parseInt(port),
    user: username,
    password,
    database
  };
}

async function migrateDatabase() {
  console.log('🔄 Starting Database Migration...\n');

  const config = getConnectionConfig();
  const client = new Client(config);

  try {
    // Connect to database
    console.log(`Connecting to database: ${config.database}...`);
    await client.connect();
    console.log('✅ Connected\n');

    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  Users table does not exist. Running full schema migration...\n');
      await runFullSchema(client);
    } else {
      console.log('✅ Users table exists. Running incremental migration...\n');
      await runIncrementalMigration(client);
    }

    // Verify migration
    console.log('Verifying migration...');
    const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('mfa_enabled', 'mfa_secret', 'phone', 'address', 'bio', 'rating', 'total_orders', 'updated_at')
      ORDER BY column_name
    `);

    console.log(`✅ Found ${columns.rows.length} new columns:`);
    columns.rows.forEach(row => {
      console.log(`   - ${row.column_name}`);
    });

    await client.end();
    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed!\n');
    console.error(`Error: ${error.message}\n`);
    if (error.code) {
      console.error(`Error code: ${error.code}\n`);
    }
    await client.end();
    process.exit(1);
  }
}

async function runFullSchema(client) {
  console.log('Running full schema migration...');
  
  if (!fs.existsSync(SCHEMA_FILE)) {
    throw new Error(`Schema file not found: ${SCHEMA_FILE}`);
  }

  const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
  
  // Execute schema
  await client.query(schema);
  
  console.log('✅ Full schema migration completed\n');
}

async function runIncrementalMigration(client) {
  console.log('Running incremental migration (adding missing columns)...');
  
  if (!fs.existsSync(MIGRATION_FILE)) {
    throw new Error(`Migration file not found: ${MIGRATION_FILE}`);
  }

  const migration = fs.readFileSync(MIGRATION_FILE, 'utf8');
  
  // Execute migration
  await client.query(migration);
  
  console.log('✅ Incremental migration completed\n');
}

// Run migration
if (require.main === module) {
  migrateDatabase().catch(console.error);
}

module.exports = { migrateDatabase };

