import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, ShieldCheck, Wallet, Banknote, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axios";
import { useAuthStore } from "../../store/useAuthStore";
import { generateUniqueId } from "../../utils/paymentHelper";

const primary = "#166534";

const PaymentForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authUser } = useAuthStore();

  const amountFromQuery = searchParams.get("amount") || "";
  const gatewayFromQuery = (searchParams.get("gateway") || "esewa").toLowerCase();
  const productNameFromQuery = searchParams.get("productName") || "Room Booking Payment";
  const landlordIdFromQuery = searchParams.get("landlordId") || "";
  const landlordNameFromQuery = searchParams.get("landlordName") || "";
  const landlordEmailFromQuery = searchParams.get("landlordEmail") || "";
  const tenantNameFromQuery = searchParams.get("tenantName") || "";
  const tenantEmailFromQuery = searchParams.get("tenantEmail") || "";

  const [formData, setFormData] = useState({
    customerName: authUser?.name || "",
    customerEmail: authUser?.email || "",
    customerPhone: authUser?.phone || "",
    productName: productNameFromQuery,
    amount: amountFromQuery,
    paymentGateway: gatewayFromQuery,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalAmount = useMemo(() => Number(formData.amount || 0), [formData.amount]);

  const inputClass =
    "mt-1 w-full rounded-xl border border-green-100 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitGatewayForm = (url, fields) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;

    Object.entries(fields || {}).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value ?? "");
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const productId = generateUniqueId();
      sessionStorage.setItem("current_transaction_id", productId);

      const response = await axiosInstance.post("/payment/initiate-payment", {
        ...formData,
        amount: finalAmount,
        productId,
        successUrl: `${window.location.origin}/payment-success`,
        failureUrl: `${window.location.origin}/payment-failure`,
        tenantId: authUser?.id || authUser?._id || null,
        tenantName: authUser?.name || tenantNameFromQuery || formData.customerName || "",
        tenantEmail: authUser?.email || tenantEmailFromQuery || formData.customerEmail || "",
        landlordId: landlordIdFromQuery || null,
        landlordName: landlordNameFromQuery || "",
        landlordEmail: landlordEmailFromQuery || "",
        customerDetails: {
          name: formData.customerName || "",
          email: formData.customerEmail || "",
          phone: formData.customerPhone || "",
        },
      });

      if (
        response.data?.gateway === "esewa" &&
        response.data?.method === "POST" &&
        response.data?.url &&
        response.data?.fields
      ) {
        submitGatewayForm(response.data.url, response.data.fields);
      } else if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error("Payment gateway URL is invalid. Please try again.");
      }
    } catch (error) {
      const responseData = error?.response?.data;
      const errorMessage =
        typeof responseData?.error === "string" ? responseData.error : responseData?.message;
      toast.error(errorMessage || "Payment initiation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6"
      style={{ background: "radial-gradient(circle at 20% 5%, #d1fae5 0%, #f0fdf4 16%, #ecfeff 52%, #f8fafc 100%)" }}
    >
      <div className="pointer-events-none absolute -left-20 top-14 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-50"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="rounded-3xl border border-green-100 bg-white/90 p-6 shadow-md backdrop-blur lg:col-span-3 sm:p-8">
            <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles size={14} className="mr-1.5" />
              Secure Checkout
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-4xl">Complete Your Payment</h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Final step to confirm your room booking. Fill details and continue to your gateway.
            </p>

            <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="customerName" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Full Name
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="customerEmail" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </label>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone Number
                </label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="paymentGateway" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment Method
                </label>
                <select
                  id="paymentGateway"
                  name="paymentGateway"
                  value={formData.paymentGateway}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="productName" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product / Service
                </label>
                <input
                  id="productName"
                  name="productName"
                  type="text"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount (NPR)
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                  style={{ backgroundColor: primary }}
                >
                  {isSubmitting ? "Redirecting to gateway..." : "Proceed to Secure Payment"}
                </button>
              </div>
            </form>
          </div>

          <aside className="rounded-3xl border border-green-100 bg-white/90 p-6 shadow-md backdrop-blur lg:col-span-2">
            <h2 className="text-lg font-bold text-black">Summary</h2>
            <p className="mt-1 text-sm text-slate-500">Review before checkout.</p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-green-100 bg-green-50/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Amount</p>
                <p className="mt-1 text-3xl font-bold text-green-800">NPR {finalAmount || 0}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Selected Gateway</p>
                <p className="mt-1 text-base font-semibold text-slate-800 capitalize">{formData.paymentGateway || "esewa"}</p>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <p className="flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-0.5 text-green-800" />
                  Gateway-level encrypted checkout and verification.
                </p>
                <p className="flex items-start gap-2">
                  <Wallet size={16} className="mt-0.5 text-green-800" />
                  Supports eSewa and Khalti direct redirect flow.
                </p>
                <p className="flex items-start gap-2">
                  <CreditCard size={16} className="mt-0.5 text-green-800" />
                  Receipt email sent after successful verification.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <Banknote size={16} />
                  Safe and instant checkout
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
