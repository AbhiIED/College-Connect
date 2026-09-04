/**
 * Role-based authorization middleware factory.
 * Usage:  router.post("/", verifyToken, requireRole(1, 3), controller.create);
 *
 * Role map:
 *   1 = Alumni
 *   2 = Student
 *   3 = Admin
 *
 * @param  {...number} roles - Allowed User_Type_IDs
 * @returns {Function} Express middleware
 */
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Access denied. Required role: ${roles.map(r => ({ 1: "Alumni", 2: "Student", 3: "Admin" }[r] || r)).join(" or ")}`,
    });
  }

  next();
};
