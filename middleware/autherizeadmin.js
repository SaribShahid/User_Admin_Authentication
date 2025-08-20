const authorizeAdmin = (req, res, next) => 
    {
  if(!req.user)
    return res.status(403).json({ message: 'User Not Found' });
  if (req.user.role !== 'admin') 
    {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

module.exports = authorizeAdmin;
