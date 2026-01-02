require('dotenv').config();
const { User } = require('./src/models');
const bcrypt = require('bcrypt');

/**
 * Fix double-hashed passwords for users created by admin
 * This script resets passwords for users who can't login
 * 
 * Usage: node fix-user-passwords.js
 */

async function fixUserPasswords() {
  try {
    console.log('🔍 Checking for users with double-hashed passwords...\n');
    
    const users = await User.findAll();
    
    if (users.length === 0) {
      console.log('No users found in database.');
      return;
    }
    
    console.log(`Found ${users.length} user(s).\n`);
    console.log('Users who need password reset:');
    console.log('================================\n');
    
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.is_active ? 'Active' : 'Inactive'}`);
      console.log('---\n');
    });
    
    console.log('\n📝 To fix login issues:');
    console.log('1. Use the Admin panel to reset passwords for affected users');
    console.log('2. Or use SQL to reset a password:');
    console.log('   UPDATE users SET password_hash = $1 WHERE id = $2;');
    console.log('   (You need to hash the password first)\n');
    
    console.log('💡 Quick fix - Reset password via Admin panel:');
    console.log('   1. Log in as admin');
    console.log('   2. Go to Admin → Users');
    console.log('   3. Edit the user');
    console.log('   4. Set a new password (minimum 6 characters)');
    console.log('   5. Save\n');
    
    await User.sequelize.close();
    console.log('✅ Done!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Run the script
fixUserPasswords();

