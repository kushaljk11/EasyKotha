import express from 'express';
import { register, login, logout, me, getAllUsers, getUserById, updateUser, deleteUser, updateProfile, countUsers, toggleSavePost } from '../controller/auth.controller.js';
import { authMiddleware } from '../middleware/auth.Middleware.js';
import { adminOnly, adminOrSelf } from '../middleware/auth.Middleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Auth routes for frontend (Store compatibility)
router.post('/signup', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check', authMiddleware, me);
router.put('/update-profile', authMiddleware, upload.single('profileImage'), updateProfile);
router.post('/save-post/:postId', authMiddleware, toggleSavePost);

// Original / legacy routes
router.post('/register', register);
router.get('/me', authMiddleware, me);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateProfile);

// Admin routes
router.get("/users/count", authMiddleware, adminOnly, countUsers);
router.get("/users", authMiddleware, adminOnly, getAllUsers);
router.get("/users/:id", authMiddleware, getUserById); // removed adminOnly
router.put("/users/:id", authMiddleware, adminOrSelf, updateUser);
router.delete("/users/:id", authMiddleware, adminOnly, deleteUser);

export default router;