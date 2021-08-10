const jwt = require('jsonwebtoken');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const token = req.header('auth_token');
  if (!token) return res.status(401).json({ error: 'access denied' });

  try {
    const verify = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verify;
    next();
  } catch (error) {
    res.status(400).json({ error: 'invalid token' });
  }
};
