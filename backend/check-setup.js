#!/usr/bin/env node

/**
 * Setup Verification Script
 * Run this to check if your backend is configured correctly
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

async function checkSetup() {
  console.log('🔍 Checking backend setup...\n');

  // Check environment variables
  console.log('1. Checking environment variables...');
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  let envOk = true;
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.log(`   ❌ ${varName} is not set`);
      envOk = false;
    } else {
      console.log(`   ✅ ${varName} is set`);
    }
  }

  if (!envOk) {
    console.log('\n⚠️  Please create a .env file with required variables.');
    console.log('   See .env.example for reference.\n');
    return;
  }

  // Check database connection
  console.log('\n2. Checking database connection...');
  try {
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false
    });
    
    await sequelize.authenticate();
    console.log('   ✅ Database connection successful');
    
    // Check if tables exist
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'tickets', 'categories', 'priorities')
    `);
    
    if (results.length >= 4) {
      console.log('   ✅ Required database tables exist');
    } else {
      console.log('   ⚠️  Some database tables are missing');
      console.log('   Run: psql -U postgres -d ssts_db -f ../db/migrations/schema.sql');
    }
    
    await sequelize.close();
  } catch (error) {
    console.log('   ❌ Database connection failed');
    console.log(`   Error: ${error.message}`);
    console.log('\n   Please check:');
    console.log('   - PostgreSQL is running');
    console.log('   - DATABASE_URL is correct');
    console.log('   - Database ssts_db exists');
    return;
  }

  // Check dependencies
  console.log('\n3. Checking dependencies...');
  try {
    require('express');
    require('sequelize');
    require('jsonwebtoken');
    require('bcrypt');
    require('cors');
    console.log('   ✅ All required dependencies are installed');
  } catch (error) {
    console.log('   ❌ Some dependencies are missing');
    console.log('   Run: npm install');
    return;
  }

  console.log('\n✅ Setup check complete!');
  console.log('\nTo start the server, run:');
  console.log('   npm run dev\n');
}

checkSetup().catch(console.error);

