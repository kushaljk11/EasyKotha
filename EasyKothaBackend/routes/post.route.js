import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  updatePostStatus,
  countPosts,
  countPendingPosts,
  countApprovedPosts,
  savePost,
  getSavedPosts,
  getRoomTypes,
  getPostSuggestions,
  getLandlordPosts,
  getRecentSearches,
} from "../controller/post.controller.js";
import { authMiddleware, adminOnly } from "../middleware/auth.Middleware.js";

const postrouter = express.Router();

// Get all posts (with filters)
postrouter.get("/posts", getAllPosts);

// get landlord posts
postrouter.get("/posts/landlord", authMiddleware, getLandlordPosts);

// Get room types
postrouter.get("/posts/types", getRoomTypes);

// Get search suggestions (keyword tracking)
postrouter.get("/posts/suggestions", getPostSuggestions);

// Get recent searches (tracked keywords)
postrouter.get("/posts/recent-searches", authMiddleware, getRecentSearches);

//get saved posts
postrouter.get("/posts/savedposts", authMiddleware, getSavedPosts);

//to count the post
postrouter.get("/posts/count", authMiddleware, adminOnly, countPosts);

//to count pending posts
postrouter.get("/posts/pending/count", authMiddleware, adminOnly, countPendingPosts);

//to count approved posts
postrouter.get("/posts/approved/count", authMiddleware, adminOnly, countApprovedPosts);

// Get single post by ID
postrouter.get("/posts/:id", getPostById);

// Create new post
postrouter.post("/createpost", authMiddleware, createPost);

//save the post
postrouter.post("/:postId/save", authMiddleware, savePost);

// Update post (only owner)
postrouter.put("/updatepost/:id", authMiddleware, updatePost);

// Delete post (only owner)
postrouter.delete("/deletepost/:id", authMiddleware, deletePost);

// Admin approves/rejects post
postrouter.patch("/posts/:id/status", authMiddleware, adminOnly, updatePostStatus);

export default postrouter;