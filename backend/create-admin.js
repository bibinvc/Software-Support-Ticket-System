require('dotenv').config();
const { User } = require('./src/models');

async function createAdmin() {
    try {
        const adminEmail = 'admin@example.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        const admin = await User.create({
            name: 'System Admin',
            email: adminEmail,
            password_hash: 'Admin123!', // Will be hashed by beforeCreate hook
            role: 'admin'
        });

        console.log('✅ Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: Admin123!');
    } catch (err) {
        console.error('❌ Failed to create admin user:', err.message);
    } finally {
        process.exit();
    }
}

createAdmin();
