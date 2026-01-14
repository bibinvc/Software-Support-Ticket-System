require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const attachmentsRoutes = require('./routes/attachments');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const prioritiesRoutes = require('./routes/priorities');
const ticketsRoutes = require('./routes/tickets');
const commentsRoutes = require('./routes/comments');
const statisticsRoutes = require('./routes/statistics');
const auditRoutes = require('./routes/audit');
const { helmetConfig, corsOptions, apiLimiter } = require('./middleware/security');

const app = express();

// Security middleware
app.use(helmetConfig);
app.use(require('cors')(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
const path = require('path');
const fs = require('fs');
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/priorities', prioritiesRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/tickets', commentsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/audit', auditRoutes);

// Root API endpoint
app.get('/api', apiLimiter, (req, res) => {
  res.json({
    message: 'Support Ticket System API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      attachments: '/api/attachments',
      users: '/api/users',
      categories: '/api/categories',
      priorities: '/api/priorities',
      tickets: '/api/tickets',
      statistics: '/api/statistics',
      audit: '/api/audit',
      health: '/api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4000;

async function start(){
  try{
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established');
    
    console.log('Synchronizing database models...');
    await sequelize.sync({ alter: false }); // Don't alter existing tables
    console.log('Database models synchronized');
    
    app.listen(PORT, ()=> {
      console.log(`\nServer running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/api/health\n`);
    });
  }catch(err){
    console.error('\nFailed to start server\n');
    if (err.name === 'SequelizeConnectionRefusedError' || err.code === 'ECONNREFUSED') {
      console.error('PostgreSQL Connection Error:');
      console.error('   PostgreSQL is not running or not accessible.\n');
      console.error('Quick Fix:');
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
