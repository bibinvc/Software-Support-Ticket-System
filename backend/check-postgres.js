#!/usr/bin/env node

/**
 * PostgreSQL Connection Checker
 * Helps diagnose PostgreSQL connection issues
 */

require('dotenv').config();
const { Client } = require('pg');

async function checkPostgreSQL() {
  console.log('🔍 Checking PostgreSQL Connection...\n');

  const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ssts_db';
  
  // Parse connection string
  const urlMatch = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!urlMatch) {
    console.log('❌ Invalid DATABASE_URL format');
    console.log('   Expected format: postgres://username:password@host:port/database');
    return;
  }

  const [, username, password, host, port, database] = urlMatch;
  
  console.log('Connection Details:');
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   Database: ${database}`);
  console.log(`   Username: ${username}\n`);

  const client = new Client({
    host,
    port: parseInt(port),
    user: username,
    password,
    database
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL!\n');

    // Check if database exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [database]
    );
    
    if (dbCheck.rows.length > 0) {
      console.log(`✅ Database "${database}" exists`);
    } else {
      console.log(`⚠️  Database "${database}" does not exist`);
      console.log(`   Create it with: CREATE DATABASE ${database};`);
    }

    // Check for required tables
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'tickets', 'categories', 'priorities')
      ORDER BY table_name
    `);

    if (tablesCheck.rows.length > 0) {
      console.log(`\n✅ Found ${tablesCheck.rows.length} required table(s):`);
      tablesCheck.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('\n⚠️  No required tables found');
      console.log('   Run: psql -U postgres -d ssts_db -f ../db/migrations/schema.sql');
    }

    await client.end();
    console.log('\n✅ All checks passed! Your PostgreSQL setup looks good.\n');
    
  } catch (error) {
    console.log('❌ Connection failed!\n');
    console.log(`Error: ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Troubleshooting Steps:\n');
      console.log('1. Check if PostgreSQL is running:');
      console.log('   Windows: Open Services (Win+R → services.msc)');
      console.log('   Look for "postgresql" service and start it\n');
      console.log('2. Verify PostgreSQL is installed:');
      console.log('   Run: psql --version\n');
      console.log('3. Check if PostgreSQL is on a different port:');
      console.log('   Default is 5432, but it might be different\n');
      console.log('4. Try starting PostgreSQL manually:');
      console.log('   Windows: net start postgresql-x64-XX (version number)\n');
    } else if (error.code === '28P01' || error.message.includes('password authentication')) {
      console.log('🔧 Authentication failed - check username and password in DATABASE_URL\n');
      console.log('💡 Quick fix: Run "npm run fix-password" to test and update password\n');
    } else if (error.code === '3D000') {
      console.log('🔧 Database does not exist');
      console.log(`   Create it with: CREATE DATABASE ${database};\n`);
    } else {
      console.log(`Error code: ${error.code}`);
      console.log('Check PostgreSQL logs for more details\n');
    }
  }
}

checkPostgreSQL().catch(console.error);

