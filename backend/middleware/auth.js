const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token, access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    // ✅ Fix: log reason so you can debug expired vs malformed tokens
    console.error('JWT verification failed:', err.message);
    res.status(401).json({ msg: 'Invalid or expired token' });
  }
};

