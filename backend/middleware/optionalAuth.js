const jwt = require('jsonwebtoken');

// Doesn't block the request if there's no token — just attaches userId if one exists
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
    } catch (error) {
      // invalid token — just proceed without userId, don't block
    }
  }

  next();
};

module.exports = optionalAuth;