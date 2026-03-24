import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ReceiptText, ShieldCheck, ArrowRight } from "lucide-react";
import axiosInstance from "../../api/axios";
import { base64Decode } from "../../utils/paymentHelper";

const PaymentSuccess = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationError, setVerificationError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = queryParams.get("data");
  const decoded = token ? base64Decode(token) : null;

  const productId = decoded?.transaction_uuid || queryParams.get("purchase_order_id");
  const isKhalti = queryParams.get("pidx") !== null;

  const rawAmount =
    decoded?.total_amount || queryParams.get("total_amount") || queryParams.get("amount") || 0;
  const totalAmount = isKhalti ? Number(rawAmount) / 100 : Number(rawAmount);

  useEffect(() => {
    const verifyPaymentAndUpdateStatus = async () => {
      if (!productId) {
        setIsLoading(false);
        setVerificationError(true);
        return;
      }

      try {
        const response = await axiosInstance.post("/payment/payment-status", {
          product_id: productId,
          pidx: queryParams.get("pidx"),
        });

        if (response.status === 200 && response.data?.status === "COMPLETED") {
          setPaymentStatus("COMPLETED");
        } else {
          navigate(`/payment-failure?purchase_order_id=${productId}`, { replace: true });
          return;
        }
      } catch (error) {
        if (error.response?.status === 400) {
          navigate(`/payment-failure?purchase_order_id=${productId}`, { replace: true });
          return;
        }
        setVerificationError(true);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPaymentAndUpdateStatus();
  }, [navigate, productId, queryParams]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ background: "radial-gradient(circle at 20% 10%, #dcfce7 0%, #f8fafc 45%, #ecfeff 100%)" }}
      >
        <div className="rounded-2xl border border-emerald-100 bg-white/90 px-6 py-4 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur">
          Verifying payment...
        </div>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-8"
        style={{ background: "linear-gradient(165deg, #f8fafc 0%, #ecfeff 100%)" }}
      >
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md">
          <h1 className="text-2xl font-bold text-black">Could not verify payment</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your payment may still be processing. Keep this reference for support.
          </p>
          <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            {productId || "Unknown transaction"}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-full bg-green-800 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => navigate("/tenant/bookings")}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-10"
      style={{ background: "radial-gradient(circle at 20% 5%, #d1fae5 0%, #f0fdf4 18%, #ecfeff 55%, #f8fafc 100%)" }}
    >
      <div className="pointer-events-none absolute -left-20 top-20 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-3xl">
        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg backdrop-blur sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
              <CheckCircle2 size={42} className="text-emerald-700" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Payment Successful</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
              Your transaction is verified and your booking payment has been completed.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Amount Paid</p>
              <p className="mt-1 text-3xl font-bold text-emerald-800">
                NPR {Number.isFinite(totalAmount) ? totalAmount.toLocaleString() : 0}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Method</p>
              <p className="mt-1 text-lg font-bold text-slate-800">{isKhalti ? "Khalti" : "eSewa"}</p>
              <p className="mt-1 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {paymentStatus === "COMPLETED" ? "Completed" : "Processing"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <ReceiptText size={16} />
              Transaction Details
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Transaction ID:</span> {productId}
              </p>
              <p className="inline-flex items-center gap-2 text-slate-600">
                <ShieldCheck size={14} className="text-emerald-700" />
                Secure gateway verification completed successfully.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/tenant/bookings")}
              className="inline-flex items-center rounded-full bg-green-800 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              Go to My Bookings
              <ArrowRight size={16} className="ml-2" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
