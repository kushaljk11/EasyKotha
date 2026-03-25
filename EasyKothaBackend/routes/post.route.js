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
import {
  getSimilarPosts,
  getUserRecommendations
} from "../controller/post.controller.js";


const postrouter = express.Router();

/** Public listing feed with filter support. */
postrouter.get("/posts", getAllPosts);

/** Returns listings created by the authenticated landlord. */
postrouter.get("/posts/landlord", authMiddleware, getLandlordPosts);

/** Returns available listing type values. */
postrouter.get("/posts/types", getRoomTypes);

/** Returns keyword suggestions based on stored search history. */
postrouter.get("/posts/suggestions", getPostSuggestions);

/** Returns recent searches for the signed-in user. */
postrouter.get("/posts/recent-searches", authMiddleware, getRecentSearches);

/** Returns listings saved by the current user. */
postrouter.get("/posts/savedposts", authMiddleware, getSavedPosts);

/** Admin metric: total listing count. */
postrouter.get("/posts/count", authMiddleware, adminOnly, countPosts);

/** Admin metric: pending listing count. */
postrouter.get("/posts/pending/count", authMiddleware, adminOnly, countPendingPosts);

/** Admin metric: approved listing count. */
postrouter.get("/posts/approved/count", authMiddleware, adminOnly, countApprovedPosts);

/** Returns details for a single listing. */
postrouter.get("/posts/:id", getPostById);

/** Creates a new listing. */
postrouter.post("/createpost", authMiddleware, createPost);

/** Saves or unsaves a listing for the current user. */
postrouter.post("/:postId/save", authMiddleware, savePost);

/** Updates a listing for the owner or admin. */
postrouter.put("/updatepost/:id", authMiddleware, updatePost);

/** Deletes a listing for the owner or admin. */
postrouter.delete("/deletepost/:id", authMiddleware, deletePost);

/** Admin action to approve or reject a listing. */
postrouter.patch("/posts/:id/status", authMiddleware, adminOnly, updatePostStatus);

postrouter.get("/posts/:id/recommendations", getSimilarPosts);

postrouter.get("/recommendations/user", authMiddleware, getUserRecommendations);
export default postrouter;