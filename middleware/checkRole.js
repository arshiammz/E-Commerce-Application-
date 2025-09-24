const checkRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
  if (req.user.role !== role) {
    return res.status(403).json({ message: `Access denied. ${role} only.` });
  }
  next();
};

module.exports = checkRole;

