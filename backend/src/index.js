require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const ticketsRoutes = require('./routes/tickets');
const commentsRoutes = require('./routes/comments');
const attachmentsRoutes = require('./routes/attachments');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const prioritiesRoutes = require('./routes/priorities');
const statisticsRoutes = require('./routes/statistics');
const auditRoutes = require('./routes/audit');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Serve uploaded files statically
const path = require('path');
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/tickets', commentsRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/priorities', prioritiesRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/audit', auditRoutes);

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Software Support Ticket System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      tickets: '/api/tickets',
      attachments: '/api/attachments',
      users: '/api/users',
      categories: '/api/categories',
      priorities: '/api/priorities',
      statistics: '/api/statistics',
      audit: '/api/audit',
      health: '/api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 4000;

async function start(){
  try{
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    console.log('Synchronizing database models...');
    await sequelize.sync({ alter: false }); // Don't alter existing tables
    console.log('✅ Database models synchronized');
    
    app.listen(PORT, ()=> {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
    });
  }catch(err){
    console.error('\n❌ Failed to start server\n');
    if (err.name === 'SequelizeConnectionRefusedError' || err.code === 'ECONNREFUSED') {
      console.error('🔴 PostgreSQL Connection Error:');
      console.error('   PostgreSQL is not running or not accessible.\n');
      console.error('📋 Quick Fix:');
      console.error('   1. Start PostgreSQL service (see POSTGRES_SETUP_WINDOWS.md)');
      console.error('   2. Check DATABASE_URL in .env file');
      console.error('   3. Run: npm run check-postgres\n');
    } else {
      console.error('Error details:', err.message);
    }
    process.exit(1);
  }
}

start();
