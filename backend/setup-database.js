#!/usr/bin/env node

/**
 * Automated Database Setup Script
 * Creates database, runs migrations, and verifies setup
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_NAME = process.env.DB_NAME || 'sharing_economy_db';
const SCHEMA_FILE = path.join(__dirname, '../db/migrations/schema.sql');
const NON_INTERACTIVE = process.argv.includes('--yes') || process.argv.includes('-y');

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
    database: currentDb, // Connect to postgres db first to create ssts_db
    targetDb: DB_NAME
  };
}

async function setupDatabase() {
  console.log('🚀 Starting Database Setup...\n');

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

    // Step 2: Check if database exists
    console.log(`2. Checking if database "${config.targetDb}" exists...`);
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.targetDb]
    );

    if (dbCheck.rows.length > 0) {
      console.log(`   ⚠️  Database "${config.targetDb}" already exists`);
      if (NON_INTERACTIVE) {
        console.log('   Continuing (non-interactive mode)...\n');
      } else {
        const answer = await askQuestion('   Do you want to continue? (y/n): ');
        if (answer.toLowerCase() !== 'y') {
          console.log('   Setup cancelled.');
          await adminClient.end();
          return;
        }
      }
    } else {
      // Step 3: Create database
      console.log(`3. Creating database "${config.targetDb}"...`);
      await adminClient.query(`CREATE DATABASE ${config.targetDb}`);
      console.log(`   ✅ Database "${config.targetDb}" created\n`);
    }

    await adminClient.end();

    // Step 4: Connect to the new database
    console.log(`4. Connecting to database "${config.targetDb}"...`);
    const dbClient = new Client({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.targetDb
    });

    await dbClient.connect();
    console.log(`   ✅ Connected to "${config.targetDb}"\n`);

    // Step 5: Check if schema file exists
    console.log('5. Checking for schema file...');
    if (!fs.existsSync(SCHEMA_FILE)) {
      throw new Error(`Schema file not found: ${SCHEMA_FILE}`);
    }
    console.log('   ✅ Schema file found\n');

    // Step 6: Check if tables already exist
    console.log('6. Checking existing tables...');
    const tablesCheck = await dbClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'services', 'orders')
    `);

    if (tablesCheck.rows.length > 0) {
      console.log(`   ⚠️  Found ${tablesCheck.rows.length} existing table(s)`);
      if (NON_INTERACTIVE) {
        console.log('   Re-running migrations (non-interactive mode)...');
        await runMigrations(dbClient);
      } else {
        const answer = await askQuestion('   Tables already exist. Re-run migrations? (y/n): ');
        if (answer.toLowerCase() !== 'y') {
          console.log('   Skipping migrations.\n');
        } else {
          await runMigrations(dbClient);
        }
      }
    } else {
      await runMigrations(dbClient);
    }

    // Step 7: Verify setup
    console.log('7. Verifying setup...');
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
    const categoriesCheck = await dbClient.query('SELECT COUNT(*) as count FROM categories');

    console.log(`\n   ✅ Categories: ${categoriesCheck.rows[0].count} entries`);

    await dbClient.end();

    console.log('\n✅ Database setup completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Update backend/.env with:');
    console.log(`   DATABASE_URL=postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.targetDb}`);
    console.log('2. Start the backend: npm run dev');
    console.log('3. Create your first user account\n');

  } catch (error) {
    console.error('\n❌ Setup failed!\n');
    
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
  // Note: This is a simple approach. For production, use a proper migration tool.
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

// Simple readline for asking questions (basic implementation)
function askQuestion(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Run setup
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };

