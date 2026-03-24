import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, LifeBuoy } from "lucide-react";
import axiosInstance from "../../api/axios";
import { base64Decode } from "../../utils/paymentHelper";

const PaymentFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const token = queryParams.get("data");
  const decoded = token ? base64Decode(token) : null;
  const productId =
    decoded?.transaction_uuid ||
    queryParams.get("purchase_order_id") ||
    sessionStorage.getItem("current_transaction_id");

  useEffect(() => {
    const markPaymentAsFailed = async () => {
      if (!productId) return;

      try {
        await axiosInstance.post("/payment/payment-status", {
          product_id: productId,
          status: "FAILED",
        });
      } catch (error) {
        console.error("Error updating payment status:", error);
      }
    };

    markPaymentAsFailed();
  }, [productId]);

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-10"
      style={{ background: "radial-gradient(circle at 15% 5%, #fee2e2 0%, #fff1f2 18%, #f8fafc 55%, #eef2ff 100%)" }}
    >
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl border border-rose-100 bg-white/90 p-8 text-center shadow-lg backdrop-blur">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 ring-8 ring-rose-50">
            <XCircle size={42} className="text-rose-600" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-black">Payment Failed</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Your payment could not be completed this time. You can retry now or return later.
          </p>

          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50/50 p-5 text-left">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Transaction ID:</span> {productId || "Not available"}
            </p>
            <p className="mt-2 inline-flex items-start gap-2 text-xs text-slate-600">
              <LifeBuoy size={14} className="mt-0.5 text-rose-600" />
              If money was deducted, refund is generally auto-processed by the payment provider.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} className="mr-2" />
              Try Again
            </button>
            <button
              onClick={() => navigate("/tenant/bookings")}
              className="rounded-full bg-green-800 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              Back to Bookings
            </button>
            <button
              onClick={() => navigate("/")}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
