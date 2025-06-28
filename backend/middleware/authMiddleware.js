// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  let token;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // attach user to req object
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message); 
    return res.status(401).json({ message: 'Token is not valid' });
  }
};