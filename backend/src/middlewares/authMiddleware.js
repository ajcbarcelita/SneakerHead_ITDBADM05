import jwt from 'jsonwebtoken';

export function isAuthenticated(role) {
  return function (req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Customer access
      if (role === 'Customer'  && (decoded.role === 'Customer')) {
        req.user = decoded;
        return next();
      }

      // Branch Manager - Only Branch Manager can access
      if (role === 'Branch Manager' && (decoded.role === 'Branch Manager')) {
        req.user = decoded;
        return next();
      }

      // System Admin access - only System Admin can access
      if (role === 'System Admin' && decoded.role === 'System Admin') {
        req.user = decoded;
        return next();
      }

      // If none of the above conditions matched
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });

    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  }
}