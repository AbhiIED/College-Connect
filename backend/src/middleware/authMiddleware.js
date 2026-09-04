const jwt = require("jsonwebtoken");

/**
 * Verify JWT access token from Authorization header.
 * Attaches decoded payload { id, email, role } to req.user.
 */
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Verify JWT AND ensure the user has Admin role (User_Type_ID = 3).
 * Reuses verifyToken internally to avoid duplicating JWT logic.
 */
exports.verifyAdmin = (req, res, next) => {
  exports.verifyToken(req, res, (err) => {
    if (err) return; // verifyToken already sent the error response

    if (req.user.role !== 3) {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    next();
  });
};
