// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

exports.protect = (req, res, next) => {
  console.log('Auth middleware hit'); 
  const authHeader = req.headers.authorization || req.headers.Authorization;

  let token;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
  console.log('Token receive kora hoyeche:', token); 

  if (!token) {
    console.log('No token provided');
    return res.status(501).json({ message: 'Not authorized, no token' });
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