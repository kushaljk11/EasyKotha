import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not found in environment variables.");
}

//authenticate middleware
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.userId || decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

//admin only
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }
  next();
};

//admin or self
export const adminOrSelf = (req, res, next) => {
  const requesterId = req.user.id;      
  const requesterRole = req.user.role;
  const targetId = req.params.id;       

  if (requesterRole === "ADMIN" || String(requesterId) === String(targetId)) {
    return next();
  }

  return res.status(403).json({
    message:
      "Access denied. Only admin or the account owner can perform this action.",
  });
};
