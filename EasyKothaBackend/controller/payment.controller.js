import axios from "axios";
import { prisma } from "../lib/prisma.js";
import { sendEmail } from "../utils/email.js";
import { generateHmacSha256Hash } from "../utils/payment.helper.js";
import {
  paymentReceiptTemplate,
  landlordPaymentNotificationTemplate,
  adminPaymentNotificationTemplate,
  landlordReleaseNotificationTemplate,
} from "../utils/emailtemplates/paymentTemplates.js";

const getMissingEnv = (keys) => keys.filter((key) => !process.env[key]);

const normalizeEnvValue = (value) => {
  if (!value) return "";
  return String(value).trim().replace(/^['\"]|['\"]$/g, "");
};

const getKhaltiSecretKey = () =>
  normalizeEnvValue(process.env.KHALTI_SECRET_KEY).replace(/^Key\s+/i, "");

const getEnvUrl = (key) => normalizeEnvValue(process.env[key]);

const extractGatewayError = (payload) => {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload?.detail === "string") return payload.detail;
  if (typeof payload?.message === "string") return payload.message;
  if (Array.isArray(payload?.errors) && payload.errors.length) {
    return payload.errors
      .map((item) => item?.message || item?.code || String(item))
      .join(", ");
  }
  try {
    return JSON.stringify(payload);
  } catch {
    return null;
  }
};

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(String(value || ""));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const toNullableInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const ADMIN_PAYMENT_EMAIL =
  normalizeEnvValue(process.env.EMAIL_USER) ||
  normalizeEnvValue(process.env.ADMIN_EMAIL) ||
  "kushalkattel0408@gmail.com";

const getUserByEmail = async (email) => {
  if (!email) return null;
  return prisma.user.findFirst({
    where: { email: { equals: String(email).trim(), mode: "insensitive" } },
    select: { id: true, name: true, email: true, profileImage: true },
  });
};

const getUserByName = async (name) => {
  if (!name) return null;
  return prisma.user.findFirst({
    where: { name: { equals: String(name).trim(), mode: "insensitive" } },
    select: { id: true, name: true, email: true, profileImage: true },
  });
};

const resolveUserForTransaction = async ({ id, email, name }) => {
  const parsedId = toNullableInt(id);

  if (parsedId) {
    const byId = await prisma.user.findUnique({
      where: { id: parsedId },
      select: { id: true, name: true, email: true, profileImage: true },
    });
    if (byId) return byId;
  }

  const byEmail = await getUserByEmail(email);
  if (byEmail) return byEmail;

  return getUserByName(name);
};

const sendPaymentReceiptEmail = async (transaction) => {
  const receiverEmail = transaction?.tenantEmail || transaction?.customerEmail;
  if (!receiverEmail) {
    return { delivered: false, skipped: true, reason: "No customer email on transaction" };
  }

  const template = paymentReceiptTemplate({
    recipientName: transaction.customerName || "Friend",
    amount: transaction.amount || 0,
    currency: "NPR",
    productName: transaction.productName || "Booking Payment",
    paymentMethod: String(transaction.paymentGateway || "online").toUpperCase(),
    paymentDate: new Date().toLocaleString(),
    transactionId: transaction.productId || "N/A",
  });

  await sendEmail({
    to: receiverEmail,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  return { delivered: true, skipped: false };
};

const sendLandlordPaymentNotificationEmail = async (transaction) => {
  if (!transaction?.landlordEmail) {
    return { delivered: false, skipped: true, reason: "No landlord email on transaction" };
  }

  const template = landlordPaymentNotificationTemplate({
    landlordName: transaction.landlordName || "Landlord",
    tenantName: transaction.tenantName || transaction.customerName || "Tenant",
    tenantEmail: transaction.tenantEmail || transaction.customerEmail || "",
    amount: transaction.amount || 0,
    currency: "NPR",
    productName: transaction.productName || "Booking Payment",
    paymentMethod: String(transaction.paymentGateway || "online").toUpperCase(),
    transactionId: transaction.productId || "N/A",
  });

  await sendEmail({
    to: transaction.landlordEmail,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  return { delivered: true, skipped: false };
};

const sendAdminPaymentNotificationEmail = async (transaction) => {
  if (!ADMIN_PAYMENT_EMAIL) {
    return { delivered: false, skipped: true, reason: "Admin email not configured" };
  }

  const template = adminPaymentNotificationTemplate({
    tenantName: transaction.tenantName || transaction.customerName || "Tenant",
    tenantEmail: transaction.tenantEmail || transaction.customerEmail || "",
    landlordName: transaction.landlordName || "Landlord",
    landlordEmail: transaction.landlordEmail || "",
    amount: transaction.amount || 0,
    currency: "NPR",
    productName: transaction.productName || "Booking Payment",
    paymentMethod: String(transaction.paymentGateway || "online").toUpperCase(),
    transactionId: transaction.productId || "N/A",
  });

  await sendEmail({
    to: ADMIN_PAYMENT_EMAIL,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  return { delivered: true, skipped: false };
};

const sendLandlordReleaseEmail = async (transaction) => {
  if (!transaction?.landlordEmail) {
    return { delivered: false, skipped: true, reason: "No landlord email on transaction" };
  }

  const template = landlordReleaseNotificationTemplate({
    landlordName: transaction.landlordName || "Landlord",
    amount: transaction.amount || 0,
    currency: "NPR",
    transactionId: transaction.productId || "N/A",
  });

  await sendEmail({
    to: transaction.landlordEmail,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  return { delivered: true, skipped: false };
};

const sendCompletionEmailBatch = async (transaction) => {
  const results = {
    tenant: { delivered: false, skipped: true },
    landlord: { delivered: false, skipped: true },
    admin: { delivered: false, skipped: true },
  };

  try {
    results.tenant = await sendPaymentReceiptEmail(transaction);
  } catch (error) {
    results.tenant = { delivered: false, skipped: false, error: error?.message || "Tenant email failed" };
  }

  try {
    results.landlord = await sendLandlordPaymentNotificationEmail(transaction);
  } catch (error) {
    results.landlord = { delivered: false, skipped: false, error: error?.message || "Landlord email failed" };
  }

  try {
    results.admin = await sendAdminPaymentNotificationEmail(transaction);
  } catch (error) {
    results.admin = { delivered: false, skipped: false, error: error?.message || "Admin email failed" };
  }

  return results;
};

export const initiatePayment = async (req, res) => {
  const {
    amount,
    productId,
    paymentGateway,
    customerName,
    customerEmail,
    customerPhone,
    customerDetails,
    productName,
    tenantId,
    tenantName,
    tenantEmail,
    landlordId,
    landlordName,
    landlordEmail,
  } = req.body;

  if (!paymentGateway) {
    return res.status(400).json({ message: "Payment gateway is required" });
  }

  const normalizedGateway = String(paymentGateway).trim().toLowerCase();
  if (!["esewa", "khalti"].includes(normalizedGateway)) {
    return res.status(400).json({ message: "Invalid payment gateway. Use esewa or khalti" });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: "Amount must be a valid number greater than 0" });
  }

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  try {
    const requesterTenantId = Number(req.user.id);
    const tenantRecord = await prisma.user.findUnique({
      where: { id: requesterTenantId },
      select: { id: true, name: true, email: true },
    });

    const parsedLandlordId = toNullableInt(landlordId);
    const landlordRecord = parsedLandlordId
      ? await prisma.user.findUnique({
          where: { id: parsedLandlordId },
          select: { id: true, name: true, email: true },
        })
      : null;

    const finalTenantName =
      tenantName || customerName || tenantRecord?.name || "Tenant";
    const finalTenantEmail =
      tenantEmail || customerEmail || tenantRecord?.email || "";

    const finalLandlordName =
      landlordName || landlordRecord?.name || null;
    const finalLandlordEmail =
      landlordEmail || landlordRecord?.email || null;

    const transactionData = {
      tenantId: requesterTenantId,
      landlordId: parsedLandlordId,
      tenantName: finalTenantName,
      tenantEmail: finalTenantEmail,
      landlordName: finalLandlordName,
      landlordEmail: finalLandlordEmail,
      customerDetails:
        customerDetails && typeof customerDetails === "object"
          ? customerDetails
          : {
              name: customerName || finalTenantName,
              email: customerEmail || finalTenantEmail,
              phone: customerPhone || "",
            },
      customerName: customerName || "",
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
      productName: productName || "Booking Payment",
      productId,
      amount: numericAmount,
      paymentGateway: normalizedGateway.toUpperCase(),
    };

    let paymentUrl;
    let paymentConfig;

    if (normalizedGateway === "esewa") {
      const missingEsewaEnv = getMissingEnv([
        "FAILURE_URL",
        "SUCCESS_URL",
        "ESEWA_MERCHANT_ID",
        "ESEWA_SECRET",
        "ESEWA_PAYMENT_URL",
      ]);

      if (missingEsewaEnv.length) {
        return res.status(400).json({
          message: `Missing eSewa configuration: ${missingEsewaEnv.join(", ")}`,
        });
      }

      const paymentData = {
        amount: numericAmount,
        failure_url: getEnvUrl("FAILURE_URL"),
        product_delivery_charge: "0",
        product_service_charge: "0",
        product_code: normalizeEnvValue(process.env.ESEWA_MERCHANT_ID),
        signed_field_names: "total_amount,transaction_uuid,product_code",
        success_url: getEnvUrl("SUCCESS_URL"),
        tax_amount: "0",
        total_amount: numericAmount,
        transaction_uuid: productId,
      };

      const signatureString = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
      const signature = generateHmacSha256Hash(signatureString, normalizeEnvValue(process.env.ESEWA_SECRET));

      const esewaPayload = { ...paymentData, signature };
      const esewaSearchParams = new URLSearchParams();
      Object.entries(esewaPayload).forEach(([key, value]) => {
        esewaSearchParams.append(key, String(value ?? ""));
      });

      paymentUrl = `${getEnvUrl("ESEWA_PAYMENT_URL")}?${esewaSearchParams.toString()}`;
    } else {
      const missingKhaltiEnv = getMissingEnv(["SUCCESS_URL", "KHALTI_PAYMENT_URL"]);

      if (missingKhaltiEnv.length) {
        return res.status(400).json({
          message: `Missing Khalti configuration: ${missingKhaltiEnv.join(", ")}`,
        });
      }

      const khaltiSecret = getKhaltiSecretKey();
      if (!khaltiSecret || khaltiSecret === "your_khalti_secret_key_here") {
        return res.status(400).json({
          message: "KHALTI_SECRET_KEY is not configured",
        });
      }

      if (!/^test_secret_key_|^live_secret_key_/i.test(khaltiSecret)) {
        return res.status(400).json({
          message: "KHALTI_SECRET_KEY format looks invalid. Use Khalti secret key (test_secret_key_... or live_secret_key_...).",
        });
      }

      paymentConfig = {
        url: getEnvUrl("KHALTI_PAYMENT_URL"),
        data: {
          return_url: getEnvUrl("SUCCESS_URL"),
          website_url: getEnvUrl("WEBSITE_URL") || "http://localhost:5173",
          amount: Math.round(numericAmount * 100),
          purchase_order_id: productId,
          purchase_order_name: productName || "Booking Payment",
          customer_info: {
            name: customerName || "",
            email: customerEmail || "",
            phone: customerPhone || "",
          },
        },
        headers: {
          Authorization: `Key ${khaltiSecret}`,
          "Content-Type": "application/json",
        },
        responseHandler: (response) => response.data?.payment_url,
      };
    }

    if (normalizedGateway === "esewa") {
      if (!isValidHttpUrl(paymentUrl)) {
        return res.status(400).json({
          message: "Payment gateway URL is not configured correctly for ESEWA",
        });
      }

      await prisma.paymentTransaction.create({
        data: transactionData,
      });

      return res.send({ url: paymentUrl });
    }

    if (!paymentConfig || !isValidHttpUrl(paymentConfig.url)) {
      return res.status(400).json({
        message: `Payment gateway URL is not configured correctly for ${normalizedGateway}`,
      });
    }

    const payment = await axios.post(paymentConfig.url, paymentConfig.data, {
      headers: paymentConfig.headers,
    });

    paymentUrl = paymentConfig.responseHandler(payment);
    if (!paymentUrl) {
      throw new Error("Payment URL is missing in the response");
    }

    await prisma.paymentTransaction.create({
      data: transactionData,
    });

    return res.send({ url: paymentUrl });
  } catch (error) {
    const upstreamStatus = error.response?.status;
    const upstreamData = error.response?.data;
    const upstreamMessage = extractGatewayError(upstreamData) || error.message;

    console.error("Error during payment initiation:", upstreamData || error.message);

    if (upstreamStatus && upstreamStatus >= 400 && upstreamStatus < 500) {
      return res.status(400).send({
        message: `Payment gateway rejected the request (${normalizedGateway.toUpperCase()})`,
        error: upstreamMessage,
      });
    }

    return res.status(502).send({
      message: "Payment initiation failed",
      error: upstreamMessage,
    });
  }
};

export const paymentStatus = async (req, res) => {
  const { product_id, pidx, status } = req.body;

  try {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { productId: product_id },
    });

    if (!transaction) {
      return res.status(400).json({ message: "Transaction not found" });
    }

    if (status === "FAILED") {
      await prisma.paymentTransaction.update({
        where: { productId: product_id },
        data: { status: "FAILED" },
      });

      return res.status(200).json({
        message: "Transaction status updated to FAILED",
        status: "FAILED",
      });
    }

    let paymentStatusCheck;

    if (transaction.paymentGateway === "ESEWA") {
      const missingEsewaVerificationEnv = getMissingEnv([
        "ESEWA_PAYMENT_STATUS_CHECK_URL",
        "ESEWA_MERCHANT_ID",
      ]);

      if (missingEsewaVerificationEnv.length) {
        return res.status(400).json({
          message: `Missing eSewa verification config: ${missingEsewaVerificationEnv.join(", ")}`,
        });
      }

      const response = await axios.get(process.env.ESEWA_PAYMENT_STATUS_CHECK_URL, {
        params: {
          product_code: process.env.ESEWA_MERCHANT_ID,
          total_amount: transaction.amount,
          transaction_uuid: transaction.productId,
        },
      });

      paymentStatusCheck = response.data;

      if (paymentStatusCheck.status === "COMPLETE") {
        const completedTransaction = await prisma.paymentTransaction.update({
          where: { productId: product_id },
          data: { status: "COMPLETED" },
        });

        const mail = await sendCompletionEmailBatch(completedTransaction);

        return res.status(200).json({
          message: "Transaction status updated successfully",
          status: "COMPLETED",
          mail,
        });
      }

      await prisma.paymentTransaction.update({
        where: { productId: product_id },
        data: { status: "FAILED" },
      });

      return res.status(200).json({
        message: "Transaction status updated to FAILED",
        status: "FAILED",
      });
    }

    if (transaction.paymentGateway === "KHALTI") {
      const missingKhaltiVerificationEnv = getMissingEnv([
        "KHALTI_SECRET_KEY",
        "KHALTI_VERIFICATION_URL",
      ]);

      if (missingKhaltiVerificationEnv.length) {
        return res.status(400).json({
          message: `Missing Khalti verification config: ${missingKhaltiVerificationEnv.join(", ")}`,
        });
      }

      const khaltiSecret = getKhaltiSecretKey();

      try {
        const response = await axios.post(
          process.env.KHALTI_VERIFICATION_URL,
          { pidx },
          {
            headers: {
              Authorization: `Key ${khaltiSecret}`,
              "Content-Type": "application/json",
            },
          }
        );
        paymentStatusCheck = response.data;
      } catch (error) {
        if (error.response?.status === 400) {
          paymentStatusCheck = error.response.data;
        } else {
          console.error("Error verifying Khalti payment:", error.response?.data || error.message);
          throw error;
        }
      }

      if (paymentStatusCheck.status === "Completed") {
        const completedTransaction = await prisma.paymentTransaction.update({
          where: { productId: product_id },
          data: { status: "COMPLETED" },
        });

        const mail = await sendCompletionEmailBatch(completedTransaction);

        return res.status(200).json({
          message: "Transaction status updated successfully",
          status: "COMPLETED",
          mail,
        });
      }

      await prisma.paymentTransaction.update({
        where: { productId: product_id },
        data: { status: "FAILED" },
      });

      return res.status(200).json({
        message: "Transaction status updated to FAILED",
        status: "FAILED",
      });
    }

    return res.status(400).json({ message: "Invalid payment gateway" });
  } catch (error) {
    console.error("Error during payment status check:", error);
    return res.status(500).send({
      message: "Payment status check failed",
      error: error.response?.data || error.message,
    });
  }
};

export const getAdminPaymentTransactions = async (req, res) => {
  try {
    const transactions = await prisma.paymentTransaction.findMany({
      where: { status: "COMPLETED" },
      include: {
        tenant: { select: { id: true, name: true, email: true, profileImage: true } },
        landlord: { select: { id: true, name: true, email: true, profileImage: true } },
        adminReleasedByUser: { select: { id: true, name: true, email: true, profileImage: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = await Promise.all(
      transactions.map(async (transaction) => {
        const tenant =
          transaction.tenant ||
          (await resolveUserForTransaction({
            id: transaction.tenantId,
            email: transaction.tenantEmail || transaction.customerEmail,
            name: transaction.tenantName || transaction.customerName,
          }));

        const landlord =
          transaction.landlord ||
          (await resolveUserForTransaction({
            id: transaction.landlordId,
            email: transaction.landlordEmail,
            name: transaction.landlordName,
          }));

        return {
          id: transaction.id,
          productId: transaction.productId,
          productName: transaction.productName,
          amount: transaction.amount,
          paymentGateway: transaction.paymentGateway,
          status: transaction.status,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          adminReleaseApproved: transaction.adminReleaseApproved,
          adminReleaseAt: transaction.adminReleaseAt,
          adminReleasedBy: transaction.adminReleasedBy,
          releasedBy: transaction.adminReleasedByUser,
          tenant: {
            id: tenant?.id || null,
            name: tenant?.name || transaction.tenantName || transaction.customerName || "Unknown tenant",
            email: tenant?.email || transaction.tenantEmail || transaction.customerEmail || "",
            profileImage: tenant?.profileImage || null,
          },
          landlord: {
            id: landlord?.id || null,
            name: landlord?.name || transaction.landlordName || "Unknown landlord",
            email: landlord?.email || transaction.landlordEmail || "",
            profileImage: landlord?.profileImage || null,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    console.error("Error in getAdminPaymentTransactions:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin payment transactions",
      error: error.message,
    });
  }
};

export const toggleAdminReleaseApproval = async (req, res) => {
  try {
    const transactionId = Number(req.params.id);
    const { adminReleaseApproved } = req.body;

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction id",
      });
    }

    if (typeof adminReleaseApproved !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "adminReleaseApproved must be a boolean",
      });
    }

    const existing = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Payment transaction not found",
      });
    }

    if (existing.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Only completed payments can be released",
      });
    }

    const updated = await prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        adminReleaseApproved,
        adminReleaseAt: adminReleaseApproved ? new Date() : null,
        adminReleasedBy: adminReleaseApproved ? Number(req.user.id) : null,
      },
      include: {
        tenant: { select: { id: true, name: true, email: true, profileImage: true } },
        landlord: { select: { id: true, name: true, email: true, profileImage: true } },
      },
    });

    let releaseMail = { delivered: false, skipped: true, reason: "Not required" };
    if (!existing.adminReleaseApproved && adminReleaseApproved) {
      try {
        releaseMail = await sendLandlordReleaseEmail(updated);
      } catch (error) {
        releaseMail = {
          delivered: false,
          skipped: false,
          error: error?.message || "Failed to send release email",
        };
      }
    }

    return res.status(200).json({
      success: true,
      data: updated,
      releaseMail,
    });
  } catch (error) {
    console.error("Error in toggleAdminReleaseApproval:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update admin release flag",
      error: error.message,
    });
  }
};
