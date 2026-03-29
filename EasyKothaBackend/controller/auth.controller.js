import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import { sendEmail } from "../utils/email.js";
import { welcomeTemplate } from "../utils/emailtemplates/wellcomeTemplate.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables.");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const isValidEmail = (email = "") => EMAIL_REGEX.test(email);

/**
 * Creates a signed login token used by the frontend for authenticated requests.
 */
const generateToken = (user) => {
  return jwt.sign({ userId: user.id || user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Registers a new account.
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser)
      return res.status(409).json({ message: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role || "TENANT",
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        city: user.city,
        profileImage: user.profileImage,
      },
      token,
    });

    Promise.resolve()
      .then(async () => {
        try {
          await sendEmail({
            to: user.email,
            subject: "Welcome to Easy Kotha!",
            html: welcomeTemplate({ name: user.name }),
          });
        } catch (emailError) {
          console.error("Email notification error:", emailError.message);
        }
      })
      .catch(() => {
        /** The detailed error is already logged in the block above. */
      });

    return;

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Logs a user in and returns profile details with a token.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password required.",
    });
  }

  try {
    // Normalizes email format so login checks remain consistent.
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: normalizedEmail },
      include: { savedPosts: true }
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    // Social sign-in users may not have a local password hash.
    if (!user.password || typeof user.password !== "string") {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    // Stores last login time for account activity tracking.
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = generateToken(updatedUser);

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        district: updatedUser.district,
        city: updatedUser.city,
        profileImage: updatedUser.profileImage,
        savedPosts: user.savedPosts || [],
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Logs a user out on the client side.
 */
export const logout = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Returns the authenticated user's profile.
 */
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        district: true,
        city: true,
        profileImage: true,
        savedPosts: true,
        createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json(user);
  } catch (error) {
    console.error("ME Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Admin endpoint that returns paginated user records.
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const role = req.query.role;

    const where = {};
    if (role && role !== "All Roles") {
      where.role = role.toUpperCase();
    }

    const totalUsers = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        district: true,
        city: true,
        profileImage: true,
        lastLogin: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        region: u.city && u.district ? `${u.city}, ${u.district}` : "N/A",
        avatar: u.profileImage,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Returns a single user profile by id.
 */
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
        district: true,
        city: true,
        profileImage: true,
        createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        city: user.city,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ===================== UPDATE USER ===================== */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, status } = req.body;

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (status) data.status = status;

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data
    });

    return res.json({
      message: "User updated successfully.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ===================== DELETE USER ===================== */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id: Number(id) } });

    return res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ===================== UPDATE PROFILE ===================== */
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, email, district, city, password } = req.body;

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (district !== undefined) data.district = district;
    if (city !== undefined) data.city = city;

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "profile_images",
          transformation: [
            { width: 400, height: 400, crop: "fill" },
            { quality: "auto" },
          ],
        });
        data.profileImage = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Failed to upload image." });
      }
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ===================== COUNT USERS ===================== */
export const countUsers = async (req, res) => {
  try {
    const [
      totalUsers,
      tenantCount,
      landlordCount,
      adminCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "TENANT" } }),
      prisma.user.count({ where: { role: "LANDLORD" } }),
      prisma.user.count({ where: { role: "ADMIN" } })
    ]);

    return res.json({
      totalUsers,
      tenantCount,
      landlordCount,
      adminCount
    });
  } catch (error) {
    console.error("Count Users Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ===================== TOGGLE SAVE POST ===================== */
export const toggleSavePost = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { postId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { savedPosts: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isSaved = user.savedPosts.some(post => post.id === postId);

    let updatedUser;
    if (isSaved) {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          savedPosts: {
            disconnect: { id: postId }
          }
        },
        include: { savedPosts: true }
      });
    } else {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          savedPosts: {
            connect: { id: postId }
          }
        },
        include: { savedPosts: true }
      });
    }

    return res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      district: updatedUser.district,
      city: updatedUser.city,
      profileImage: updatedUser.profileImage,
      savedPosts: updatedUser.savedPosts,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("Toggle Save Post Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
