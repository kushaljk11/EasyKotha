import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not found in environment variables.");
}


//to check jwt token validity
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ message: "Authorization header missing." });

    const token = authHeader.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Invalid token format." });

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;  
    // req.user = { userId: <id>, role: <role> }

    next();

  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};


//admin
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
