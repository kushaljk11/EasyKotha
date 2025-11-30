import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto'

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables.");
}

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

//user registration
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(409).json({ message: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "TENANT"
      }
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required." });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    const token = generateToken(user);

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//get all users for admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json({ users });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//get user by id for admin
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user)
      return res.status(404).json({ message: "User not found." });

    return res.json({ user });

  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existingUser)
      return res.status(404).json({ message: "User not found." });

    let updatedData = { name, email, role };

    // If password is provided, hash it
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json({
      message: "User updated successfully.",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existingUser)
      return res.status(404).json({ message: "User not found." });

    await prisma.user.delete({
      where: { id: Number(id) }
    });

    return res.json({ message: "User deleted successfully." });

  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const me = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ message: "Authorization header missing." });

    const token = authHeader.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Invalid token format." });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (!user)
      return res.status(404).json({ message: "User not found." });

    return res.json({ user });

  } catch (error) {
    console.error("ME Error:", error);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required." });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return res.status(404).json({ message: "Email not registered." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExp: expiry,
      },
    });

    
    console.log("Password Reset Link:");
    console.log(`http://localhost:5000/reset-password/${resetToken}`);

    return res.json({
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token)
      return res.status(400).json({ message: "Token is required." });

    if (!newPassword)
      return res.status(400).json({ message: "New password is required." });

    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token." });

    if (user.resetTokenExp < new Date())
      return res.status(400).json({ message: "Reset token expired." });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return res.json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

