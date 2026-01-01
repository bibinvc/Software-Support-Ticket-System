const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth' });
  const token = auth.split(' ')[1];
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  }catch(err){
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (roles=[]) => (req,res,next)=>{
  if(!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if(roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
}

module.exports = { authenticate, requireRole };
