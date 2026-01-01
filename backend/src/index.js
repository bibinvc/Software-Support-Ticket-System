require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const ticketsRoutes = require('./routes/tickets');
const commentsRoutes = require('./routes/comments');
const attachmentsRoutes = require('./routes/attachments');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/tickets', commentsRoutes);
app.use('/api/attachments', attachmentsRoutes);

const PORT = process.env.PORT || 4000;

async function start(){
  try{
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
  }catch(err){
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
