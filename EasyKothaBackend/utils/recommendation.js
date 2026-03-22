import fs from "fs";
import path from "path";

let similarity = {};

try {
  const data = fs.readFileSync(
    path.resolve("post_similarity.json"),
    "utf-8"
  );
  similarity = JSON.parse(data);
} catch (err) {
  console.log("⚠️ Recommendation file not found");
}

// Get similar posts
export const getSimilarPostIds = (postId, topN = 6) => {
  if (!similarity[postId]) return [];

  const scores = similarity[postId];

  return Object.entries(scores)
    .filter(([id]) => id !== postId)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([id]) => id);
};