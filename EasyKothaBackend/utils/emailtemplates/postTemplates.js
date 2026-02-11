import { baseTemplate } from "./baseTemplate.js";

export const postPendingTemplate = (post) =>
  baseTemplate({
    title: "Post Pending Approval",
    body: `Your post "<b>${post.title}</b>" has been submitted and is waiting for admin approval.`,
  });

export const postApprovedTemplate = (post) =>
  baseTemplate({
    title: "Post Approved",
    body: `Your post "<b>${post.title}</b>" has been approved and is now visible to users.`,
  });

export const postRejectedTemplate = (post) =>
  baseTemplate({
    title: "Post Rejected ",
    body: `Your post "<b>${post.title}</b>" was rejected by the admin. Please review and submit again.`,
  });
