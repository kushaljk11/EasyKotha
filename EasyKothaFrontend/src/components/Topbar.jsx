import { Link } from "react-router-dom";

export default function Topbar() {
  return (
    <div className="topbar flex items-center justify-between p-3 shadow-md border border-green-200 sticky top-0 bg-white z-50">
      <div className="h-12 w-12 flex items-center">
        <img className="" src="/EasyKothaColoured-02.png" alt="Logo" />
      </div>
      <div className="flex items-center gap-6 font-medium">
        <Link className="text-black" to="/">
          Features
        </Link>
        <Link className="text-black" to="/contact">
          Contact Us
        </Link>
        <Link className="text-black" to="/about">
          About Us
        </Link>
        <Link
          className="bg-green-800 text-white px-6 py-2 rounded-2xl hover:bg-green-700"
          to="/login"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
