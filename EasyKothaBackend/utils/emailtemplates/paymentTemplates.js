const BRAND_COLORS = {
  primary: "#166534",
  primaryDark: "#14532d",
  textDark: "#0f172a",
  textMuted: "#64748b",
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  border: "#dcfce7",
};

export const paymentReceiptTemplate = ({
  recipientName = "there",
  amount = "0",
  currency = "NPR",
  productName = "your booking",
  paymentMethod = "Online",
  paymentDate = new Date().toLocaleString(),
  transactionId = "N/A",
}) => {
  const subject = `Payment received: ${currency} ${amount}`;

  const text = [
    `Hi ${recipientName},`,
    "",
    `Your payment of ${currency} ${amount} for ${productName} was successful.`,
    `Method: ${paymentMethod}`,
    `Date: ${paymentDate}`,
    `Transaction ID: ${transactionId}`,
    "",
    "Please keep this email as your payment reference.",
    "",
    "- EasyKotha",
  ].join("\n");

  const html = `
<div style="background:${BRAND_COLORS.pageBg};padding:24px;font-family:Arial,sans-serif;color:${BRAND_COLORS.textDark};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
    style="max-width:640px;margin:0 auto;background:${BRAND_COLORS.cardBg};
           border:1px solid ${BRAND_COLORS.border};border-radius:14px;overflow:hidden;">
    <tr>
      <td style="background:${BRAND_COLORS.primary};padding:18px 24px;font-size:22px;
                 font-weight:700;color:#ffffff;">
        EasyKotha Payment Receipt
      </td>
    </tr>
    <tr>
      <td style="padding:24px;line-height:1.6;">
        <p style="margin:0 0 12px;font-size:16px;">Hi ${recipientName},</p>
        <p style="margin:0 0 12px;color:${BRAND_COLORS.textMuted};">
          Your payment was completed successfully.
        </p>

        <div style="margin:16px 0;padding:16px;border-radius:12px;
                    background:#f0fdf4;border:1px solid #bbf7d0;">
          <p style="margin:0;font-size:14px;color:${BRAND_COLORS.textMuted};">Amount Paid</p>
          <p style="margin:4px 0 10px;font-size:28px;font-weight:700;color:${BRAND_COLORS.primaryDark};">
            ${currency} ${amount}
          </p>
          <p style="margin:0;font-size:13px;color:${BRAND_COLORS.textMuted};">For: ${productName}</p>
          <p style="margin:2px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Method: ${paymentMethod}</p>
          <p style="margin:2px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Date: ${paymentDate}</p>
          <p style="margin:2px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Txn ID: ${transactionId}</p>
        </div>

        <p style="margin:16px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">
          Keep this email as your payment reference.
        </p>
      </td>
    </tr>
  </table>
</div>`;

  return { subject, text, html };
};

export const landlordPaymentNotificationTemplate = ({
  landlordName = "there",
  tenantName = "A tenant",
  tenantEmail = "",
  amount = "0",
  currency = "NPR",
  productName = "your property booking",
  paymentMethod = "Online",
  transactionId = "N/A",
}) => {
  const subject = `Tenant payment received: ${currency} ${amount}`;

  const contactLine =
    "Contact @kushalkattel0408@gmail.com if you don't receive payment under 1-3 working days";

  const text = [
    `Hi ${landlordName},`,
    "",
    `${tenantName}${tenantEmail ? ` (${tenantEmail})` : ""} completed a payment of ${currency} ${amount} for ${productName}.`,
    `Method: ${paymentMethod}`,
    `Transaction ID: ${transactionId}`,
    "",
    contactLine,
    "",
    "- EasyKotha",
  ].join("\n");

  const html = `
<div style="background:${BRAND_COLORS.pageBg};padding:24px;font-family:Arial,sans-serif;color:${BRAND_COLORS.textDark};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
    style="max-width:640px;margin:0 auto;background:${BRAND_COLORS.cardBg};border:1px solid ${BRAND_COLORS.border};border-radius:14px;overflow:hidden;">
    <tr>
      <td style="background:${BRAND_COLORS.primary};padding:18px 24px;font-size:20px;font-weight:700;color:#ffffff;">
        EasyKotha Landlord Payment Alert
      </td>
    </tr>
    <tr>
      <td style="padding:24px;line-height:1.6;">
        <p style="margin:0 0 10px;font-size:16px;">Hi ${landlordName},</p>
        <p style="margin:0 0 10px;color:${BRAND_COLORS.textMuted};">
          <b>${tenantName}</b>${tenantEmail ? ` (${tenantEmail})` : ""} completed a payment.
        </p>
        <div style="margin:14px 0;padding:14px;border-radius:12px;background:#f0fdf4;border:1px solid #bbf7d0;">
          <p style="margin:0;font-size:14px;color:${BRAND_COLORS.textMuted};">Amount</p>
          <p style="margin:4px 0 8px;font-size:26px;font-weight:700;color:${BRAND_COLORS.primaryDark};">${currency} ${amount}</p>
          <p style="margin:2px 0;font-size:13px;color:${BRAND_COLORS.textMuted};">For: ${productName}</p>
          <p style="margin:2px 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Method: ${paymentMethod}</p>
          <p style="margin:2px 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Txn ID: ${transactionId}</p>
        </div>
        <p style="margin:14px 0 0;font-size:13px;color:${BRAND_COLORS.primaryDark};font-weight:700;">
          Contact @kushalkattel0408@gmail.com if you don't receive payment under 1-3 working days
        </p>
      </td>
    </tr>
  </table>
</div>`;

  return { subject, text, html };
};

export const adminPaymentNotificationTemplate = ({
  tenantName = "Tenant",
  tenantEmail = "",
  landlordName = "Landlord",
  landlordEmail = "",
  amount = "0",
  currency = "NPR",
  productName = "Booking Payment",
  paymentMethod = "Online",
  transactionId = "N/A",
}) => {
  const subject = `Admin alert: payment completed (${currency} ${amount})`;
  const text = [
    "Payment completed in EasyKotha.",
    `Tenant: ${tenantName}${tenantEmail ? ` (${tenantEmail})` : ""}`,
    `Landlord: ${landlordName}${landlordEmail ? ` (${landlordEmail})` : ""}`,
    `Amount: ${currency} ${amount}`,
    `Product: ${productName}`,
    `Method: ${paymentMethod}`,
    `Transaction ID: ${transactionId}`,
  ].join("\n");

  const html = `
<div style="font-family:Arial,sans-serif;color:${BRAND_COLORS.textDark};padding:24px;background:${BRAND_COLORS.pageBg};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border:1px solid ${BRAND_COLORS.border};border-radius:12px;overflow:hidden;">
    <tr><td style="padding:16px 20px;background:${BRAND_COLORS.primary};color:#fff;font-weight:700;">EasyKotha Admin Payment Notification</td></tr>
    <tr><td style="padding:20px;line-height:1.6;">
      <p style="margin:0 0 6px;"><b>Tenant:</b> ${tenantName}${tenantEmail ? ` (${tenantEmail})` : ""}</p>
      <p style="margin:0 0 6px;"><b>Landlord:</b> ${landlordName}${landlordEmail ? ` (${landlordEmail})` : ""}</p>
      <p style="margin:0 0 6px;"><b>Amount:</b> ${currency} ${amount}</p>
      <p style="margin:0 0 6px;"><b>Product:</b> ${productName}</p>
      <p style="margin:0 0 6px;"><b>Method:</b> ${paymentMethod}</p>
      <p style="margin:0;"><b>Transaction ID:</b> ${transactionId}</p>
    </td></tr>
  </table>
</div>`;

  return { subject, text, html };
};

export const landlordReleaseNotificationTemplate = ({
  landlordName = "there",
  amount = "0",
  currency = "NPR",
  transactionId = "N/A",
}) => {
  const subject = `Funds released by admin: ${currency} ${amount}`;
  const text = [
    `Hi ${landlordName},`,
    "",
    "Your payment has been released by admin.",
    `Amount: ${currency} ${amount}`,
    `Transaction ID: ${transactionId}`,
    "",
    "- EasyKotha",
  ].join("\n");

  const html = `
<div style="font-family:Arial,sans-serif;color:${BRAND_COLORS.textDark};padding:24px;background:${BRAND_COLORS.pageBg};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border:1px solid ${BRAND_COLORS.border};border-radius:12px;overflow:hidden;">
    <tr><td style="padding:16px 20px;background:${BRAND_COLORS.primary};color:#fff;font-weight:700;">EasyKotha Payment Release</td></tr>
    <tr><td style="padding:20px;line-height:1.6;">
      <p style="margin:0 0 10px;">Hi ${landlordName},</p>
      <p style="margin:0 0 8px;color:${BRAND_COLORS.textMuted};">Your funds have been released by admin.</p>
      <p style="margin:0 0 6px;"><b>Amount:</b> ${currency} ${amount}</p>
      <p style="margin:0;"><b>Transaction ID:</b> ${transactionId}</p>
    </td></tr>
  </table>
</div>`;

  return { subject, text, html };
};
