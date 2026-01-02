#!/usr/bin/env node

/**
 * Password Fix Helper
 * Helps you test and update the PostgreSQL password in .env
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_FILE = path.join(__dirname, '.env');

// Parse DATABASE_URL
function parseDatabaseUrl(url) {
  const match = url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) return null;
  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5]
  };
}

// Test connection with password
async function testConnection(config, password) {
  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.username,
    password: password,
    database: 'postgres' // Test with postgres database first
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch (error) {
    return false;
  }
}

// Update .env file
function updateEnvFile(newPassword) {
  let envContent = '';
  
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf8');
  }

  const lines = envContent.split('\n');
  let found = false;
  const newLines = lines.map(line => {
    if (line.startsWith('DATABASE_URL=')) {
      found = true;
      const config = parseDatabaseUrl(line.split('=')[1].trim());
      if (config) {
        return `DATABASE_URL=postgres://${config.username}:${newPassword}@${config.host}:${config.port}/${config.database}`;
      }
    }
    return line;
  });

  if (!found) {
    // Add DATABASE_URL if it doesn't exist
    newLines.push(`DATABASE_URL=postgres://postgres:${newPassword}@localhost:5432/ssts_db`);
  }

  fs.writeFileSync(ENV_FILE, newLines.join('\n'), 'utf8');
}

// Ask question
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🔐 PostgreSQL Password Fix Helper\n');

  const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ssts_db';
  const config = parseDatabaseUrl(dbUrl);

  if (!config) {
    console.error('❌ Invalid DATABASE_URL format in .env file');
    console.error('   Expected: postgres://username:password@host:port/database\n');
    process.exit(1);
  }

  console.log('Current Configuration:');
  console.log(`   Username: ${config.username}`);
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Password: ${'*'.repeat(config.password.length)} (hidden)\n`);

  console.log('Testing current password...');
  const currentWorks = await testConnection(config, config.password);
  
  if (currentWorks) {
    console.log('✅ Current password works!');
    console.log('   Your DATABASE_URL is correct.\n');
    return;
  }

  console.log('❌ Current password does not work.\n');
  console.log('Let\'s find the correct password.\n');

  // Try common passwords
  const commonPasswords = ['postgres', 'admin', 'password', 'root', ''];
  console.log('Trying common passwords...\n');

  for (const pwd of commonPasswords) {
    process.stdout.write(`   Trying "${pwd || '(empty)'}"... `);
    const works = await testConnection(config, pwd);
    if (works) {
      console.log('✅ WORKS!\n');
      const update = await askQuestion('Update .env file with this password? (y/n): ');
      if (update.toLowerCase() === 'y') {
        updateEnvFile(pwd);
        console.log('\n✅ .env file updated!\n');
        console.log('You can now run: npm run check-postgres\n');
      }
      return;
    }
    console.log('❌');
  }

  // Ask user for password
  console.log('\nNone of the common passwords worked.\n');
  console.log('Please enter the PostgreSQL password you set during installation:');
  const password = await askQuestion('Password: ');

  if (!password) {
    console.log('\n⚠️  No password entered. Exiting.\n');
    process.exit(0);
  }

  console.log('\nTesting password...');
  const works = await testConnection(config, password);

  if (works) {
    console.log('✅ Password works!\n');
    const update = await askQuestion('Update .env file with this password? (y/n): ');
    if (update.toLowerCase() === 'y') {
      updateEnvFile(password);
      console.log('\n✅ .env file updated!\n');
      console.log('You can now run: npm run check-postgres\n');
    }
  } else {
    console.log('❌ Password still doesn\'t work.\n');
    console.log('Options:');
    console.log('1. Reset PostgreSQL password:');
    console.log('   psql -U postgres');
    console.log('   ALTER USER postgres WITH PASSWORD \'newpassword\';');
    console.log('   \\q');
    console.log('   Then run this script again.\n');
    console.log('2. Check if you\'re using a different username');
    console.log('3. Verify PostgreSQL is configured correctly\n');
  }
}

main().catch(console.error);

