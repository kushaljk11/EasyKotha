import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xl">
        <p className="text-sm font-semibold tracking-wide text-green-700">EasyKotha</p>
        <h1 className="mt-2 text-5xl font-bold text-gray-900">404</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-800">Page not found</h2>
        <p className="mt-3 text-sm text-gray-600">
          The page you are trying to access does not exist or may have been moved.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto rounded-xl bg-green-800 px-5 py-2.5 text-white font-medium hover:bg-green-700"
          >
            Go to Home
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto rounded-xl border border-green-700 px-5 py-2.5 text-green-800 font-medium hover:bg-green-50"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
