import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, LogIn, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg p-8"
      >
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold text-green-700 tracking-wide">
            EasyKotha
          </p>

          <h1 className="mt-3 text-5xl font-bold text-gray-900">404</h1>

          <h2 className="mt-2 text-xl font-semibold text-gray-800">
            Page not found
          </h2>

          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            The page you are trying to access does not exist, may have been removed,
            or the URL might be incorrect. Please check the link or navigate using
            the options below.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-800 px-5 py-2.5 text-white font-medium hover:bg-green-700 transition"
          >
            <Home size={18} />
            Go to Homepage
          </Link>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-300 px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            <LogIn size={18} />
            Go to Login
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-300 px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Help Section */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help or think this is a mistake?
          </p>
          <p className="text-sm font-medium text-green-700 mt-1 cursor-pointer hover:underline">
            Contact Support
          </p>
        </div>

      </motion.div>
    </div>
  );
}