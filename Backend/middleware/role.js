const role = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: No user information found'
        });
      }
  
      const userRole = req.user.role;
 
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Requires one of these roles - ${allowedRoles.join(', ')}`
        });
      }
        next();
    };
  };
  
  module.exports = role;