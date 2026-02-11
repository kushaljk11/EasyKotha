import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and Description */}
        <div className="flex flex-col gap-4">
          <div className="h-12 w-12 flex items-center">
            <img src="/EasyKothaUncloured-03.png" alt="EasyKotha Logo" className="h-full w-full object-contain" />
          </div>
          <p className="text-sm text-gray-300">
            Your trusted platform for finding the perfect room. Easy, fast, and reliable.
          </p>
          {/* Social Media Icons */}
          <div className="flex gap-4 text-xl">
            <a href="#" className="hover:text-green-400 transition-colors">
              <FaFacebook />
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-green-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-green-400 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/features" className="hover:text-green-400 transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-green-400 transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* For Tenants */}
        <div>
          <h3 className="text-lg font-semibold mb-4">For Tenants</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/search" className="hover:text-green-400 transition-colors">
                Search Rooms
              </Link>
            </li>
            <li>
              <Link to="/featured" className="hover:text-green-400 transition-colors">
                Featured Listings
              </Link>
            </li>
            <li>
              <Link to="/budget-rooms" className="hover:text-green-400 transition-colors">
                Budget Rooms
              </Link>
            </li>
            <li>
              <Link to="/locations" className="hover:text-green-400 transition-colors">
                Browse Locations
              </Link>
            </li>
          </ul>
        </div>

        {/* For Landlords */}
        <div>
          <h3 className="text-lg font-semibold mb-4">For Landlords</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/list-property" className="hover:text-green-400 transition-colors">
                List Your Property
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-green-400 transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/guidelines" className="hover:text-green-400 transition-colors">
                Listing Guidelines
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-green-400 transition-colors">
                Support
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-green-800 mt-8 pt-6 text-center text-sm text-gray-300">
        <p>&copy; {new Date().getFullYear()} EasyKotha. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link to="/privacy" className="hover:text-green-400 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-green-400 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
