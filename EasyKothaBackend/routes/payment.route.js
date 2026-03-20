import express from "express";
import {
	initiatePayment,
	paymentStatus,
	getAdminPaymentTransactions,
	toggleAdminReleaseApproval,
} from "../controller/payment.controller.js";
import { authMiddleware, adminOnly } from "../middleware/auth.Middleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/initiate-payment", authMiddleware, initiatePayment);
paymentRouter.post("/payment-status", authMiddleware, paymentStatus);
paymentRouter.get("/admin/transactions", authMiddleware, adminOnly, getAdminPaymentTransactions);
paymentRouter.patch(
	"/admin/transactions/:id/release",
	authMiddleware,
	adminOnly,
	toggleAdminReleaseApproval
);

export default paymentRouter;
