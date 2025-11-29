import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.Middleware.js';
import { register, login, updateUser, deleteUser, me, getAllUsers, getUserById } from '../controller/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
router.get("/users", getAllUsers);
router.get("/:id", authMiddleware, adminOnly, getUserById);
router.put("/update/:id", authMiddleware, updateUser);
router.delete("/delete/:id", authMiddleware, adminOnly, deleteUser);

export default router;