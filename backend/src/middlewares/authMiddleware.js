import jwt from "jsonwebtoken";

export function authenticateUser(roleName) {
  return function (req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check role_name from JWT payload
      if (decoded.role_name !== roleName) {
        return res.status(403).json({ error: "Forbidden - Insufficient permissions" });
      }

      req.user = decoded; // Attach decoded token to request object
      next();
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
  };
}
