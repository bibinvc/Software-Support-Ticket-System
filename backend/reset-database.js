#!/usr/bin/env node

/**
 * Reset Database Script
 * Drops the existing database and creates a fresh one with migrations
 * WARNING: This will delete all data!
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_NAME = 'ssts_db';
const SCHEMA_FILE = path.join(__dirname, '../db/migrations/schema.sql');

// Get connection details from DATABASE_URL or use defaults
function getConnectionConfig() {
  const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
  const urlMatch = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  
  if (!urlMatch) {
    throw new Error('Invalid DATABASE_URL format');
  }

  const [, username, password, host, port, currentDb] = urlMatch;
  
  return {
    host,
    port: parseInt(port),
    user: username,
    password,
    database: currentDb,
    targetDb: DB_NAME
  };
}

async function resetDatabase() {
  console.log('⚠️  WARNING: This will DELETE all data in the database!\n');
  console.log('🚀 Starting Database Reset...\n');

  const config = getConnectionConfig();
  const adminClient = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    // Step 1: Connect to PostgreSQL
    console.log('1. Connecting to PostgreSQL...');
    await adminClient.connect();
    console.log('   ✅ Connected to PostgreSQL\n');

    // Step 2: Terminate active connections to the database
    console.log(`2. Terminating active connections to "${config.targetDb}"...`);
    try {
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid()
      `, [config.targetDb]);
      console.log('   ✅ Active connections terminated\n');
    } catch (err) {
      // Database might not exist, which is fine
      if (!err.message.includes('does not exist')) {
        console.log(`   ⚠️  Warning: ${err.message}\n`);
      }
    }

    // Step 3: Drop database if it exists
    console.log(`3. Dropping database "${config.targetDb}" if it exists...`);
    try {
      await adminClient.query(`DROP DATABASE IF EXISTS ${config.targetDb}`);
      console.log(`   ✅ Database "${config.targetDb}" dropped\n`);
    } catch (err) {
      console.log(`   ⚠️  Warning: ${err.message}\n`);
    }

    // Step 4: Create new database
    console.log(`4. Creating fresh database "${config.targetDb}"...`);
    await adminClient.query(`CREATE DATABASE ${config.targetDb}`);
    console.log(`   ✅ Database "${config.targetDb}" created\n`);

    await adminClient.end();

    // Step 5: Connect to the new database
    console.log(`5. Connecting to database "${config.targetDb}"...`);
    const dbClient = new Client({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.targetDb
    });

    await dbClient.connect();
    console.log(`   ✅ Connected to "${config.targetDb}"\n`);

    // Step 6: Check if schema file exists
    console.log('6. Checking for schema file...');
    if (!fs.existsSync(SCHEMA_FILE)) {
      throw new Error(`Schema file not found: ${SCHEMA_FILE}`);
    }
    console.log('   ✅ Schema file found\n');

    // Step 7: Run migrations
    console.log('7. Running migrations...');
    await runMigrations(dbClient);

    // Step 8: Verify setup
    console.log('8. Verifying setup...');
    const verifyTables = await dbClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`   ✅ Found ${verifyTables.rows.length} table(s):`);
    verifyTables.rows.forEach(row => {
      console.log(`      - ${row.table_name}`);
    });

    // Check seed data
    const prioritiesCheck = await dbClient.query('SELECT COUNT(*) as count FROM priorities');
    const categoriesCheck = await dbClient.query('SELECT COUNT(*) as count FROM categories');

    console.log(`\n   ✅ Priorities: ${prioritiesCheck.rows[0].count} entries`);
    console.log(`   ✅ Categories: ${categoriesCheck.rows[0].count} entries`);

    await dbClient.end();

    console.log('\n✅ Database reset completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Your DATABASE_URL should be:');
    console.log(`   DATABASE_URL=postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.targetDb}`);
    console.log('2. Start the backend: npm run dev');
    console.log('3. Create your first user account\n');

  } catch (error) {
    console.error('\n❌ Reset failed!\n');
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.error('🔴 PostgreSQL is not running!\n');
      console.error('📋 Quick Fix Options:\n');
      console.error('   Option 1: Run PowerShell script (as Administrator):');
      console.error('     .\\start-postgres.ps1\n');
      console.error('   Option 2: Double-click: start-postgres.bat\n');
      console.error('   Option 3: Manual start:');
      console.error('     1. Press Win+R, type: services.msc');
      console.error('     2. Find "postgresql-x64-XX" service');
      console.error('     3. Right-click → Start\n');
      console.error('   Option 4: Command line (as Administrator):');
      console.error('     net start postgresql-x64-16\n');
      console.error('   See QUICK_START_POSTGRES.md for detailed instructions.\n');
    } else if (error.code === '28P01' || error.message.includes('password')) {
      console.error('🔴 Authentication failed!\n');
      console.error('   Check your DATABASE_URL in backend/.env');
      console.error('   Format: postgres://username:password@host:port/database\n');
    } else if (error.message.includes('Invalid DATABASE_URL')) {
      console.error('🔴 Invalid DATABASE_URL format!\n');
      console.error('   Expected: postgres://username:password@host:port/database');
      console.error('   Check your backend/.env file\n');
    } else {
      console.error(`Error: ${error.message}\n`);
      if (error.code) {
        console.error(`Error code: ${error.code}\n`);
      }
    }
    
    process.exit(1);
  }
}

async function runMigrations(dbClient) {
  console.log('   Running migrations...');
  
  const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
  
  // Split by semicolons and execute each statement
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await dbClient.query(statement);
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.error(`   ⚠️  Warning: ${err.message}`);
        }
      }
    }
  }
  
  console.log('   ✅ Migrations completed\n');
}

// Run reset
if (require.main === module) {
  resetDatabase().catch(console.error);
}

module.exports = { resetDatabase };

