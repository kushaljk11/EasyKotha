import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-green-800 text-white py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and Description */}
        <div className="flex flex-col gap-4">
          <div className="h-12 w-12 flex items-center">
            <img src="/logo.png" alt="EasyKotha Logo" className="h-full w-full object-contain" />
          </div>
          <p className="text-sm text-gray-300">
            {t("footer.description")}
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
          <h3 className="text-lg font-semibold mb-4">{t("footer.quickLinks")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-green-400 transition-colors">
                {t("footer.home")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-green-400 transition-colors">
                {t("footer.aboutUs")}
              </Link>
            </li>
            <li>
              <Link to="/features" className="hover:text-green-400 transition-colors">
                {t("footer.features")}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-green-400 transition-colors">
                {t("footer.contact")}
              </Link>
            </li>
          </ul>
        </div>

        {/* For Tenants */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t("footer.forTenants")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/search" className="hover:text-green-400 transition-colors">
                {t("footer.searchRooms")}
              </Link>
            </li>
            <li>
              <Link to="/featured" className="hover:text-green-400 transition-colors">
                {t("footer.featuredListings")}
              </Link>
            </li>
            <li>
              <Link to="/budget-rooms" className="hover:text-green-400 transition-colors">
                {t("footer.budgetRooms")}
              </Link>
            </li>
            <li>
              <Link to="/locations" className="hover:text-green-400 transition-colors">
                {t("footer.browseLocations")}
              </Link>
            </li>
          </ul>
        </div>

        {/* For Landlords */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t("footer.forLandlords")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/list-property" className="hover:text-green-400 transition-colors">
                {t("footer.listProperty")}
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-green-400 transition-colors">
                {t("footer.pricing")}
              </Link>
            </li>
            <li>
              <Link to="/guidelines" className="hover:text-green-400 transition-colors">
                {t("footer.listingGuidelines")}
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-green-400 transition-colors">
                {t("footer.support")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-green-800 mt-8 pt-6 text-center text-sm text-gray-300">
        <p>&copy; {new Date().getFullYear()} EasyKotha. {t("footer.copyright")}</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link to="/privacy" className="hover:text-green-400 transition-colors">
            {t("footer.privacyPolicy")}
          </Link>
          <Link to="/terms" className="hover:text-green-400 transition-colors">
            {t("footer.termsOfService")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
