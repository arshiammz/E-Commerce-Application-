const checkSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Access denied. Sellers only.' });
  }
  next();
};

module.exports = checkSeller;
