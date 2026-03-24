import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import axios from "../api/axios";

const statusStyles = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-rose-100 text-rose-700",
  REFUNDED: "bg-slate-200 text-slate-700",
};

export default function AdminPayment() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/payment/admin/transactions");
      setTransactions(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching admin payments:", error);
      toast.error("Failed to load payment transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totals = useMemo(() => {
    const count = transactions.length;
    const released = transactions.filter((transaction) => transaction.adminReleaseApproved).length;
    const unreleased = count - released;
    const amount = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return { count, released, unreleased, amount };
  }, [transactions]);

  const handleReleaseToggle = async (transaction) => {
    const nextValue = !transaction.adminReleaseApproved;
    setUpdatingId(transaction.id);

    try {
      const response = await axios.patch(`/payment/admin/transactions/${transaction.id}/release`, {
        adminReleaseApproved: nextValue,
      });

      setTransactions((prev) =>
        prev.map((item) =>
          item.id === transaction.id
            ? {
                ...item,
                adminReleaseApproved: response.data?.data?.adminReleaseApproved ?? nextValue,
                adminReleaseAt: response.data?.data?.adminReleaseAt || null,
                adminReleasedBy: response.data?.data?.adminReleasedBy || null,
              }
            : item
        )
      );

      toast.success(nextValue ? "Admin release set to Yes" : "Admin release set to No");
    } catch (error) {
      console.error("Failed to update admin release:", error);
      toast.error(error.response?.data?.message || "Failed to update release flag");
    } finally {
      setUpdatingId(null);
    }
  };

  const openProfile = (user, label) => {
    if (!user?.id) {
      toast.error(`${label} profile is unavailable for this record`);
      return;
    }

    navigate(`/profile/${user.id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />

        <div className="space-y-5 p-3 sm:p-4 md:space-y-6 md:p-8">
          <div className="text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
              Payment Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review completed tenant payments and control admin fund release.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Completed Payments" value={totals.count} />
            <StatCard label="Released" value={totals.released} tone="text-emerald-700" />
            <StatCard label="Not Released" value={totals.unreleased} tone="text-amber-700" />
            <StatCard
              label="Total Amount"
              value={`NPR ${totals.amount.toLocaleString()}`}
              tone="text-green-800"
            />
          </div>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="-mx-3 overflow-x-auto px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
              <table className="min-w-[820px] text-left md:min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-3 py-3 md:px-6 md:py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400">To</th>
                    <th className="px-3 py-3 md:px-6 md:py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400">By</th>
                    <th className="px-3 py-3 md:px-6 md:py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Date</th>
                    <th className="px-3 py-3 md:px-6 md:py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Amount</th>
                    <th className="px-3 py-3 md:px-6 md:py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Tenant Paid</th>
                    <th className="px-3 py-3 md:px-6 md:py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Admin Release</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-3 py-10 md:px-6 md:py-12 text-center text-sm text-slate-500">
                        Loading payment records...
                      </td>
                    </tr>
                  )}

                  {!loading && transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-10 md:px-6 md:py-12 text-center text-sm text-slate-500">
                        No completed payment records found.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="align-top hover:bg-gray-50/40">
                        <td className="px-3 py-3 md:px-6 md:py-4">
                          <button
                            type="button"
                            onClick={() => openProfile(transaction.landlord, "Landlord")}
                            className="text-left max-w-[180px] md:max-w-none"
                          >
                            <div className="text-sm font-semibold text-green-800 hover:underline truncate">
                              {transaction.landlord?.name || "Unknown landlord"}
                            </div>
                            <div className="text-xs text-slate-500 hover:underline truncate">
                              {transaction.landlord?.email || "No email"}
                            </div>
                          </button>
                        </td>

                        <td className="px-3 py-3 md:px-6 md:py-4">
                          <button
                            type="button"
                            onClick={() => openProfile(transaction.tenant, "Tenant")}
                            className="text-left max-w-[180px] md:max-w-none"
                          >
                            <div className="text-sm font-semibold text-blue-700 hover:underline truncate">
                              {transaction.tenant?.name || "Unknown tenant"}
                            </div>
                            <div className="text-xs text-slate-500 hover:underline truncate">
                              {transaction.tenant?.email || "No email"}
                            </div>
                          </button>
                        </td>

                        <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-slate-700 whitespace-nowrap">
                          {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleString()
                            : "N/A"}
                        </td>

                        <td className="px-3 py-3 md:px-6 md:py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                          NPR {Number(transaction.amount || 0).toLocaleString()}
                        </td>

                        <td className="px-3 py-3 md:px-6 md:py-4 text-sm whitespace-nowrap">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[transaction.status] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>

                        <td className="px-3 py-3 md:px-6 md:py-4 text-sm whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleReleaseToggle(transaction)}
                            disabled={updatingId === transaction.id}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                              transaction.adminReleaseApproved
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            } ${updatingId === transaction.id ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            {updatingId === transaction.id
                              ? "Updating..."
                              : transaction.adminReleaseApproved
                              ? "Yes"
                              : "No"}
                          </button>
                          {transaction.adminReleaseAt && (
                            <div className="mt-1 text-[10px] text-slate-400">
                              {new Date(transaction.adminReleaseAt).toLocaleString()}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "text-black" }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 text-xl md:text-2xl font-bold ${tone}`}>{value}</p>
    </article>
  );
}
