// verify token
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
 
  if (typeof bearerHeader !== 'undefined') {
    const splits = bearerHeader.split(' ');
    const bearerToken = splits[1];
    
    if (bearerToken === process.env.API_KEY) {
      next();
    } else {
      res.status(403).json({ error: 'invalid token' });
    }
  } else {
    res.status(403).json({ error: 'invalid token' });
  }
};

export default verifyToken;
