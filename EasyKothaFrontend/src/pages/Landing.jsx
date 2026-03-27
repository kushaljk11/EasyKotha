import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaUserFriends,
  FaTabletAlt,
  FaCheckCircle,
  FaHeadset,
  FaMapMarkerAlt,
  FaWallet,
  FaSearch,
  FaUserCheck,
  FaLock,
  FaDownload,
  FaRegEdit,
  FaArrowRight,
} from "react-icons/fa";
import axiosInstance from "../api/axios";
import Footer from "../components/Footer";
import Topbar from "../components/Topbar";
import { useAuthStore } from "../store/useAuthStore";
import {
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
  getProvinces,
} from "../utils/locationUtils";

function LocationCard({ imageSrc, locationName, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="LocationCard group w-full rounded-xl border border-green-100 bg-white p-2 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <img
        className="w-full rounded-lg object-cover transition-transform duration-200 group-hover:scale-[1.03] aspect-4/3"
        src={imageSrc}
        alt={locationName}
      />
      <h3 className="pt-2 text-center text-sm font-semibold text-green-800 group-hover:text-green-700 sm:text-base">
        {locationName}
      </h3>
    </button>
  );
}

function WhyEasyKothaCard({ icon, title, description }) {
  return (
    <div className="WhyEasyKothaCard flex flex-col items-center text-center gap-3 p-4 border border-green-500 rounded-lg shadow-xl hover:shadow-xl transition-shadow duration-200">
      <div className="h-12 w-12 text-green-800">{icon}</div>
      <h3 className="text-green-800 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function FeaturedListingCard({
  imageSrc,
  title,
  location,
  postedDate,
  onClick,
  featuredTag,
  pricePerMonthLabel,
  viewDetailsLabel,
  viewDetailsAria,
}) {
  return (
    <article className="FeaturedListingCard flex h-full flex-col overflow-hidden rounded-2xl border border-green-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <button type="button" onClick={onClick} className="relative h-36 w-full overflow-hidden bg-gray-100 sm:h-52">
        <img className="h-full! w-full object-cover" src={imageSrc} alt={title} />
        <span className="absolute left-3 top-3 rounded-full bg-green-800 px-3 py-1 text-xs font-semibold text-white">
          {featuredTag}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-green-800">
          {pricePerMonthLabel}
        </span>
      </button>
      <div className="flex flex-1 flex-col p-4">
        <button type="button" onClick={onClick} className="text-left">
          <h3 className="line-clamp-2 min-h-14 text-xl font-semibold text-green-800 sm:min-h-18 sm:text-xl">{title}</h3>
        </button>
        <p className="mt-1 line-clamp-1 text-sm text-gray-600">{location}</p>

        <div className="mt-auto flex items-center justify-between border-t border-green-100 pt-3">
          <p className="text-xs font-medium text-gray-500">{postedDate}</p>
          <button
            type="button"
            onClick={onClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-800 text-white transition-colors hover:bg-pink-800 sm:w-36 sm:px-4 sm:py-1.5 sm:text-sm sm:font-semibold"
            aria-label={viewDetailsAria}
            title={viewDetailsLabel}
          >
            <FaArrowRight className="text-sm sm:hidden" />
            <span className="hidden sm:inline">{viewDetailsLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function RecentRoomCard({ room, onDetailsClick, labels, locale }) {
  const title = room?.title || labels.availableRoom;
  const location = getDisplayLocation(room?.city, room?.district, labels.unknownLocation);
  const previewImage = getPostPreviewImage(room?.images);
  const priceLabel = Number(room?.price || 0).toLocaleString(locale);
  const postedDate = room?.createdAt
    ? new Date(room.createdAt).toLocaleDateString(locale)
    : labels.recentlyPosted;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-36 w-full overflow-hidden bg-gray-100 sm:h-52">
        <img
          src={previewImage}
          alt={title}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = "/abouthero.webp";
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-green-800 px-3 py-1 text-xs font-semibold text-white">
          {labels.recentTag}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-green-800">
          {labels.pricePerMonth(priceLabel)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-14 text-xl font-semibold text-green-800 sm:min-h-18 sm:text-xl">{title}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-gray-600">{location}</p>

        <div className="mt-auto flex items-center justify-between border-t border-green-100 pt-3">
          <p className="text-xs font-medium text-gray-500">{postedDate}</p>
          <button
            type="button"
            onClick={() => onDetailsClick(room?.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-800 text-white transition-colors hover:bg-pink-800 sm:w-36 sm:px-4 sm:py-1.5 sm:text-sm sm:font-semibold"
            aria-label={labels.viewDetailsAria}
            title={labels.viewDetailsLabel}
          >
            <FaArrowRight className="text-sm sm:hidden" />
            <span className="hidden sm:inline">{labels.viewDetailsLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function HowEasyKothaWorksCard({
  title,
  description,
  description2,
  stepPrefix,
  number,
  delayMs = 0,
  isVisible = false,
}) {
  return (
    <div
      className={`HowEasyKothaWorksCard ek-step-card flex flex-col items-center text-center gap-2 border border-green-200 bg-white p-5 rounded-lg shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        isVisible ? "is-active" : ""
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <div className={`ek-step-number h-12 w-12 bg-green-800 text-white flex items-center justify-center rounded-full ${isVisible ? "is-active" : ""}`}>
        {number}
      </div>
      <h3 className="text-green-800 text-lg font-semibold">{stepPrefix} {title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-sm text-gray-600">{description2}</p>
    </div>
  );
}

function RoomByBudgetCard({ budgetRange, description, to = "/login", button }) {
  return (
    <Link
      to={to}
      className="RoomByBudgetCard flex flex-col items-center gap-2 p-4 border border-green-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200"
    >
      <h3 className="text-green-800 text-lg font-semibold">{budgetRange}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
      <button className="bg-green-800 text-white px-3 py-2 mt-1 rounded-xl hover:bg-green-700">
        {button}
      </button>
    </Link>
  );
}

function getPostPreviewImage(images) {
  if (Array.isArray(images) && images.length > 0) {
    return images[0];
  }

  if (typeof images === "string" && images.trim()) {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    } catch {
      return images;
    }
  }

  return "/abouthero.webp";
}

function getDisplayLocation(city, district, fallback = "Unknown location") {
  const normalizedCity = typeof city === "string" ? city.trim() : "";
  const normalizedDistrict = typeof district === "string" ? district.trim() : "";

  if (normalizedCity && normalizedDistrict) {
    if (normalizedCity.toLowerCase() === normalizedDistrict.toLowerCase()) {
      return normalizedCity;
    }

    return `${normalizedCity}, ${normalizedDistrict}`;
  }

  return normalizedCity || normalizedDistrict || fallback;
}

export default function Landing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isInstallPromptAvailable, setIsInstallPromptAvailable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedBudgetRange, setSelectedBudgetRange] = useState("");
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [isLoadingFeaturedRooms, setIsLoadingFeaturedRooms] = useState(true);
  const suggestionBoxRef = useRef(null);
  const howItWorksRef = useRef(null);
  const [isHowItWorksVisible, setIsHowItWorksVisible] = useState(false);
  const locale = i18n.language === "ne" ? "ne-NP" : "en-US";

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      setIsLoadingFeaturedRooms(true);
      try {
        const response = await axiosInstance.get("/posts", {
          params: {
            status: "approved",
            page: 1,
            limit: 4,
            sort: "latest",
          },
        });

        if (response.data?.success) {
          setFeaturedRooms(Array.isArray(response.data.data) ? response.data.data : []);
        } else {
          setFeaturedRooms([]);
        }
      } catch (error) {
        console.error("Failed to fetch featured rooms:", error);
        setFeaturedRooms([]);
      } finally {
        setIsLoadingFeaturedRooms(false);
      }
    };

    fetchFeaturedRooms();
  }, []);

  useEffect(() => {
    const loadLocationOptions = async () => {
      try {
        const provinces = await getProvinces();
        const districtChunks = await Promise.all(
          provinces.map((province) => getDistrictsByProvince(province))
        );

        const allDistricts = districtChunks
          .flat()
          .filter(Boolean)

        const municipalityChunks = await Promise.all(
          allDistricts.map((district) => getMunicipalitiesByDistrict(district))
        );

        const allCities = municipalityChunks
          .flat()
          .filter(Boolean)
          .map((city) => city.trim())
          .filter(Boolean);

        const uniqueCities = [...new Set(allCities)].sort((a, b) =>
          a.localeCompare(b)
        );

        setLocationOptions(uniqueCities);
      } catch (error) {
        console.error("Failed to load location options:", error);
        setLocationOptions([]);
      }
    };

    loadLocationOptions();
  }, []);

  useEffect(() => {
    const closeSuggestionsOnOutsideClick = (event) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", closeSuggestionsOnOutsideClick);
    return () => {
      document.removeEventListener("mousedown", closeSuggestionsOnOutsideClick);
    };
  }, []);

  useEffect(() => {
    const keyword = searchTerm.trim();

    if (keyword.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await axiosInstance.get("/posts", {
          params: {
            search: keyword,
            status: "approved",
            page: 1,
            limit: 6,
          },
        });

        if (response.data?.success) {
          setSuggestions(response.data.data || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Failed to search posts:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (!howItWorksRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHowItWorksVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(howItWorksRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
      setIsInstallPromptAvailable(true);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setIsInstallPromptAvailable(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const navigateWithAuthCheck = (path) => {
    if (authUser) {
      navigate(path);
      return;
    }

    navigate("/login");
  };

  const getExploreBasePath = () => {
    if (!authUser) return null;
    if (authUser.role === "LANDLORD") return "/landlord/explore";
    if (authUser.role === "TENANT") return "/tenant/explore";
    return "/admin/dashboard";
  };

  const buildExplorePath = ({ keyword = "", city = "", budgetRange = "" }) => {
    const basePath = getExploreBasePath();
    if (!basePath) return "/login";
    if (basePath === "/admin/dashboard") return basePath;

    const params = new URLSearchParams();
    const normalizedKeyword = keyword.trim();

    if (normalizedKeyword) {
      params.set("search", normalizedKeyword);
    }

    if (city) {
      if (authUser?.role === "TENANT") {
        params.set("city", city);
      }

      if (!normalizedKeyword) {
        params.set("search", city);
      }
    }

    if (budgetRange) {
      const [minPrice, maxPrice] = budgetRange.split("-");
      if (minPrice) {
        params.set("minPrice", minPrice);
      }

      if (maxPrice) {
        params.set("maxPrice", maxPrice);
      }
    }

    return params.toString() ? `${basePath}?${params.toString()}` : basePath;
  };

  const handleLocationClick = (city) => {
    const target = buildExplorePath({ city });
    navigateWithAuthCheck(target);
  };

  const handleFeaturedRoomClick = (room) => {
    if (!authUser) {
      navigate("/register");
      return;
    }

    const roomCity = room?.city || room?.district || "";
    const roomTitle = room?.title || "";
    const target = buildExplorePath({ keyword: roomTitle, city: roomCity });
    navigate(target);
  };

  const handleSearchSubmit = () => {
    const target = buildExplorePath({
      keyword: searchTerm,
      city: selectedLocation,
      budgetRange: selectedBudgetRange,
    });

    navigateWithAuthCheck(target);
  };

  const handleSuggestionClick = (postId) => {
    if (!postId) return;
    setShowSuggestions(false);
    navigateWithAuthCheck(`/posts/${postId}`);
  };

  const handleRecentRoomDetailsClick = (postId) => {
    if (!postId) return;
    navigateWithAuthCheck(`/posts/${postId}`);
  };

  const handleSearchInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleFindRoomCtaClick = () => {
    navigate("/register");
  };

  const handleListRoomCtaClick = () => {
    navigateWithAuthCheck("/landlord/add-listing");
  };

  const handleRequestPropertyClick = () => {
    if (!authUser) {
      navigate("/register");
      return;
    }

    navigate("/explore");
  };

  const handleInstallAppClick = async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();
    const choiceResult = await deferredInstallPrompt.userChoice;

    if (choiceResult.outcome !== "accepted") {
      return;
    }

    setDeferredInstallPrompt(null);
    setIsInstallPromptAvailable(false);
  };

  const listingLabels = {
    availableRoom: t("landing.cards.availableRoom"),
    unknownLocation: t("landing.cards.unknownLocation"),
    recentlyPosted: t("landing.cards.recentlyPosted"),
    recentTag: t("landing.cards.recentTag"),
    viewDetailsAria: t("landing.cards.viewDetailsAria"),
    viewDetailsLabel: t("landing.cards.viewDetails"),
    pricePerMonth: (price) => t("landing.cards.pricePerMonth", { price }),
  };

  return (
    <>
      <Topbar />
      {/* Landing page hero section */}
      <div
        className="HeroSection relative flex w-full flex-col items-center justify-start bg-cover bg-center py-7 sm:py-10 md:min-h-[82vh] md:justify-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 100%), url('/abouthero.webp')",
        }}
      >
        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center px-4 text-center sm:px-8">
          <h1 className="text-white text-[1.9rem] font-semibold leading-snug sm:text-5xl sm:leading-tight lg:text-6xl">
            {t("landing.hero.titlePrefix")}{" "}
            <span className="text-green-300 font-bold">{t("landing.hero.titleHighlight")}</span>
          </h1>
          <p className="text-white/90 mt-3 max-w-3xl text-sm sm:mt-4 sm:text-base lg:text-lg">
            {t("landing.hero.subtitle")}
          </p>

          <div className="mt-6 w-full max-w-5xl sm:mt-8">
            <div className="bg-white rounded-2xl shadow-2xl p-3.5 sm:p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div
                  ref={suggestionBoxRef}
                  className="relative flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 md:col-span-4 lg:col-span-5"
                >
                  <FaSearch className="text-green-800 text-lg" />
                  <input
                    className="w-full bg-transparent text-sm md:text-base focus:outline-none"
                    placeholder={t("landing.hero.searchPlaceholder")}
                    type="text"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleSearchInputKeyDown}
                  />

                  {showSuggestions && searchTerm.trim().length >= 2 && (
                    <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl">
                      {isSearching ? (
                        <p className="px-4 py-3 text-sm text-gray-500">{t("landing.hero.searching")}</p>
                      ) : suggestions.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto p-2">
                          {suggestions.map((post) => (
                            <li
                              key={post.id}
                              className="mb-2 last:mb-0"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                handleSuggestionClick(post.id);
                              }}
                            >
                              <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 p-2 text-left transition-colors hover:bg-green-50">
                                <img
                                  src={getPostPreviewImage(post.images)}
                                  alt={post.title || t("landing.cards.availableRoom")}
                                  className="h-12 w-14 rounded-md object-cover"
                                  onError={(event) => {
                                    event.currentTarget.src = "/abouthero.webp";
                                  }}
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-gray-800">
                                    {post.title}
                                  </p>
                                  <p className="truncate text-xs text-gray-500">
                                    {post.city || ""}
                                    {post.city && post.district ? ", " : ""}
                                    {post.district || ""}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-500">
                          {t("landing.hero.noMatchingListings")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 md:col-span-3 lg:col-span-2">
                  <FaMapMarkerAlt className="text-green-800 text-lg" />
                  <select
                    className="w-full bg-transparent text-sm md:text-base focus:outline-none"
                    value={selectedLocation}
                    onChange={(event) => setSelectedLocation(event.target.value)}
                  >
                    <option value="">{t("landing.hero.city")}</option>
                    {locationOptions.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 md:col-span-3 lg:col-span-2">
                  <FaWallet className="text-green-800 text-lg" />
                  <select
                    className="w-full bg-transparent text-sm md:text-base focus:outline-none"
                    value={selectedBudgetRange}
                    onChange={(event) => setSelectedBudgetRange(event.target.value)}
                  >
                    <option value="">{t("landing.hero.budgetRange")}</option>
                    <option value="1000-2000">{t("landing.hero.budgetOption1")}</option>
                    <option value="2000-3000">{t("landing.hero.budgetOption2")}</option>
                    <option value="3000-4000">{t("landing.hero.budgetOption3")}</option>
                  </select>
                </div>
                <button
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-800 text-white font-semibold py-3 px-4 hover:bg-[#154f52] transition-colors shadow-lg md:col-span-2 lg:col-span-3"
                  onClick={handleSearchSubmit}
                >
                  <FaSearch />
                  {t("landing.hero.search")}
                </button>
              </div>

              <div className="flex flex-col justify-center gap-2.5 text-xs font-semibold text-green-800 sm:flex-row sm:gap-6 sm:text-sm">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow">
                  <FaUserCheck className="text-green-800" />
                  {t("landing.hero.verifiedLandlords")}
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow">
                  <FaLock className="text-green-800" />
                  {t("landing.hero.securePayments")}
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow">
                  <FaHeadset className="text-green-800" />
                  {t("landing.hero.support247")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular searches (bridges hero and next section) */}
      <div className="PopularCategories w-[94%] sm:w-[92%] md:w-[95%] max-w-6xl mx-auto bg-gray-100 text-black px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-5 shadow-2xl border border-gray-200 mt-4 md:-mt-10 relative z-20">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-5">
          <h2 className="text-center md:text-left text-base sm:text-lg md:text-2xl font-semibold text-red-600 leading-tight whitespace-nowrap">
            {t("landing.popular.title")}
          </h2>
          <div className="flex flex-wrap md:flex-nowrap items-center cursor-pointer justify-center md:justify-start gap-0 text-xs sm:text-sm md:text-[20px] font-medium text-gray-800 whitespace-nowrap">
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "furnished room" }))}>{t("landing.popular.furnishedRoom")}</button>
            <span className="text-gray-400">|</span>
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "shared room" }))}>{t("landing.popular.sharedRoom")}</button>
            <span className="text-gray-400">|</span>
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "single room" }))}>{t("landing.popular.singleRoom")}</button>
            <span className="text-gray-400">|</span>
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "pet friendly" }))}>{t("landing.popular.petFriendly")}</button>
            <span className="text-gray-400">|</span>
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "budget rooms" }))}>{t("landing.popular.budgetRooms")}</button>
            <span className="text-gray-400">|</span>
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "nearby location" }))}>{t("landing.popular.nearbyLocations")}</button>
          </div>
        </div>
      </div>

      {/* why easykotha section */}
      <div className="WhyEasyKothaSection flex flex-col items-center mt-16 gap-6 px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-center">
          {t("landing.why.titlePrefix")} <span className="text-green-800 font-semibold">{t("landing.why.brand")}</span>?
        </h2>
        <div className="WhyEasyKothaGrid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          <WhyEasyKothaCard
            icon={FaUserFriends({ size: 48 })}
            title={t("landing.why.card1Title")}
            description={t("landing.why.card1Desc")}
          />
          <WhyEasyKothaCard
            icon={FaTabletAlt({ size: 48 })}
            title={t("landing.why.card2Title")}
            description={t("landing.why.card2Desc")}
          />
          <WhyEasyKothaCard
            icon={FaCheckCircle({ size: 48 })}
            title={t("landing.why.card3Title")}
            description={t("landing.why.card3Desc")}
          />
          <WhyEasyKothaCard
            icon={FaHeadset({ size: 48 })}
            title={t("landing.why.card4Title")}
            description={t("landing.why.card4Desc")}
          />
        </div>
      </div>

      {/* Location */}
      <div className="LocationsSection flex flex-col items-center mt-20 bg-gray-100 gap-8 px-4 py-10 md:p-10">
        <h2 className="text-3xl md:text-3xl font-semibold text-center">
          <span className="text-green-800 font-semibold">{t("landing.locations.titlePrefix")} </span>{t("landing.locations.titleSuffix")}
        </h2>
        <div className="LocationsGrid grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 md:gap-6">
          <LocationCard
            imageSrc="https://imgs.search.brave.com/GAIYvtELr_GBXvpe7yW6Cz4yl7g-lidMwk8wj79C1-4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/ZWFydGh0cmVra2Vy/cy5jb20vd3AtY29u/dGVudC91cGxvYWRz/LzIwMTYvMDIvS2F0/aG1hbmR1LWZyb20t/SGlnaC5qcGcub3B0/aW1hbC5qcGc"
            locationName={t("landing.locations.kathmandu")}
            onClick={() => handleLocationClick("Kathmandu")}
          />
          <LocationCard
            imageSrc="https://imgs.search.brave.com/ze4G9XolbChWJjIwSpDNaU624HhLigRyqZ48tHsCk2Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZi5i/c3RhdGljLmNvbS94/ZGF0YS9pbWFnZXMv/aG90ZWwvc3F1YXJl/NjAwLzU1NDc3MjAz/OS53ZWJwP2s9ZDRl/NDU4OGNjZjM2MWZl/YTUzY2ZhMzYwODY1/YTczNzg3NzZkN2Ey/MGIyYTU0ZmI5MDM4/ODk5ZjA1ZmZmNGQ3/OCZvPQ"
            locationName={t("landing.locations.itahari")}
            onClick={() => handleLocationClick("Itahari")}
          />
          <LocationCard
            imageSrc="https://imgs.search.brave.com/mUqepwjm1-jjqQvKZdF1-Qxx0jT7o9FKXdXDfFuH5Po/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dHJla2tpbmdhZHZp/c29yLmNvbS9pbWFn/ZS8xMDI0L3RyZWtf/bWVkaWEvcGxhY2Vz/L2RoYXJhbi9EaGFy/YW4uanBn"
            locationName={t("landing.locations.dharan")}
            onClick={() => handleLocationClick("Dharan")}
          />
          <LocationCard
            imageSrc="https://imgs.search.brave.com/GkiPcAl6KnRuamx0dISXq-QBYRXy-c9NlVuHmI1cfDA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cGlnZW9udHJhdmVs/cy5jb20vd3AtY29u/dGVudC91cGxvYWRz/LzIwMTgvMTEvYmly/YXRuYWdhci1nYXRl/LTIzMDYyMDE3MDgy/NjI3LTEwMDB4MC5q/cGc"
            locationName={t("landing.locations.biratnagar")}
            onClick={() => handleLocationClick("Biratnagar")}
          />
          <LocationCard
            imageSrc="https://imgs.search.brave.com/9yMX6V_cbbmggXZ1OiW5rQ2cxHqJl7rPDzSFQuZt5-o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9lbmds/aXNoLm5lcGFsbmV3/cy5jb20vd3AtY29u/dGVudC91cGxvYWRz/LzIwMjUvMDIvMzM0/OTg4Mjk5XzExMzk0/NzI3ODY3NDk3Nzdf/ODgyNzE5NjcyMjE1/Mjc3MTI3Ml9uLmpw/Zw"
            locationName={t("landing.locations.damak")}
            onClick={() => handleLocationClick("Damak")}
          />
          <LocationCard
            imageSrc="https://imgs.search.brave.com/yGv11ms-TJXfycSLDgs7vuj3iw52lyIXV9bGT8PtSi0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9uZXBh/bC1kb21hay1jaXR5/LWpoYXBhLWJpc2hh/bC1tYXJnLXJvYWQt/ZGlzdHJpY3QtY2xv/c2VzdC10by1yYWRo/YS1rcmlzaG5hLXRl/bXBsZS1qdW5jdGlv/bi0xOTIzNjg3MDYu/anBn"
            locationName={t("landing.locations.kerkha")}
            onClick={() => handleLocationClick("Kerkha")}
          />
        </div>
      </div>

      {/* Featured listing post */}

      <div className="FeaturedListingsSection flex flex-col items-center mt-20 gap-8 mb-16 px-4">
        <h2 className="text-4xl md:text-4xl font-semibold text-center">
          <span className="text-green-800 font-semibold">{t("landing.featured.titlePrefix")} </span>{t("landing.featured.titleSuffix")}
        </h2>
        <div className="FeaturedListingsGrid grid w-full max-w-7xl grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4 md:gap-6">
          {isLoadingFeaturedRooms && (
            <p className="col-span-full text-center text-sm font-medium text-slate-500">{t("landing.featured.loading")}</p>
          )}

          {!isLoadingFeaturedRooms && featuredRooms.length === 0 && (
            <p className="col-span-full text-center text-sm font-medium text-slate-500">{t("landing.featured.empty")}</p>
          )}

          {!isLoadingFeaturedRooms &&
            featuredRooms.map((room) => (
              <FeaturedListingCard
                key={room.id || room._id || `${room.title}-${room.createdAt}`}
                imageSrc={getPostPreviewImage(room.images)}
                title={room.title || t("landing.cards.availableRoom")}
                location={getDisplayLocation(room.city, room.district, t("landing.cards.unknownLocation"))}
                featuredTag={t("landing.cards.featuredTag")}
                pricePerMonthLabel={t("landing.cards.pricePerMonth", { price: Number(room.price || 0).toLocaleString(locale) })}
                postedDate={
                  room.createdAt
                    ? new Date(room.createdAt).toLocaleDateString(locale)
                    : t("landing.cards.recentlyPosted")
                }
                viewDetailsAria={t("landing.cards.viewDetailsAria")}
                viewDetailsLabel={t("landing.cards.viewDetails")}
                onClick={() => handleFeaturedRoomClick(room)}
              />
            ))}
        </div>
      </div>

      {/* Recent Rooms */}
      <div className="RecentRoomsSection flex flex-col items-center mb-16 gap-8 px-4">
        <h2 className="text-4xl md:text-4xl font-semibold text-center">
          <span className="text-green-800 font-semibold">{t("landing.recent.titlePrefix")} </span>{t("landing.recent.titleSuffix")}
        </h2>

        <div className="RecentRoomsGrid grid w-full max-w-7xl grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4 md:gap-6">
          {!isLoadingFeaturedRooms &&
            featuredRooms.slice(0, 4).map((room) => (
              <RecentRoomCard
                key={`recent-${room.id || room._id || room.createdAt}`}
                room={room}
                onDetailsClick={handleRecentRoomDetailsClick}
                labels={listingLabels}
                locale={locale}
              />
            ))}
        </div>
      </div>

      {/* how easykotha works */}
      <div
        ref={howItWorksRef}
        className="HowEasyKothaWorksSection flex flex-col items-center mt-20 mb-16 gap-8 bg-gray-50 px-4 py-10 md:p-10"
      >
        <h2 className="text-3xl md:text-4xl font-semibold text-center">
          {t("landing.how.titlePrefix")} <span className="text-green-800 font-semibold">EasyKotha</span> {t("landing.how.titleSuffix")}
        </h2>
        <div className="relative w-full max-w-6xl">
          <div className="pointer-events-none absolute left-16 right-16 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className={`ek-process-track ${isHowItWorksVisible ? "is-active" : ""}`}>
              <div className="ek-process-base" />
              <div className="ek-process-progress" />
              <div className="ek-process-signal" />

              <div
                className="ek-process-node"
                style={{ left: "12.5%", transitionDelay: "120ms", "--node-delay": "0ms" }}
              />
              <div
                className="ek-process-node"
                style={{ left: "37.5%", transitionDelay: "260ms", "--node-delay": "350ms" }}
              />
              <div
                className="ek-process-node"
                style={{ left: "62.5%", transitionDelay: "400ms", "--node-delay": "700ms" }}
              />
              <div
                className="ek-process-node"
                style={{ left: "87.5%", transitionDelay: "540ms", "--node-delay": "1050ms" }}
              />
            </div>
          </div>

          <div className="HowEasyKothaWorksGrid relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
            <HowEasyKothaWorksCard
              delayMs={0}
              isVisible={isHowItWorksVisible}
              number={1}
              stepPrefix={t("landing.cards.stepPrefix")}
              title={t("landing.how.step1Title")}
              description={t("landing.how.step1Desc1")}
              description2={t("landing.how.step1Desc2")}
            />
            <HowEasyKothaWorksCard
              delayMs={140}
              isVisible={isHowItWorksVisible}
              number={2}
              stepPrefix={t("landing.cards.stepPrefix")}
              title={t("landing.how.step2Title")}
              description={t("landing.how.step2Desc1")}
              description2={t("landing.how.step2Desc2")}
            />
            <HowEasyKothaWorksCard
              delayMs={280}
              isVisible={isHowItWorksVisible}
              number={3}
              stepPrefix={t("landing.cards.stepPrefix")}
              title={t("landing.how.step3Title")}
              description={t("landing.how.step3Desc1")}
              description2={t("landing.how.step3Desc2")}
            />
            <HowEasyKothaWorksCard
              delayMs={420}
              isVisible={isHowItWorksVisible}
              number={4}
              stepPrefix={t("landing.cards.stepPrefix")}
              title={t("landing.how.step4Title")}
              description={t("landing.how.step4Desc1")}
              description2={t("landing.how.step4Desc2")}
            />
          </div>
        </div>
      </div>

      {/* Room by budget */}
      <div className="RoomByBudgetSection flex flex-col items-center mt-20 mb-16 gap-8 px-4">
        <h2 className="text-3xl md:text-3xl font-semibold text-center">
          <span className="text-green-800 font-semibold">{t("landing.budget.titlePrefix")} </span>{t("landing.budget.titleSuffix")}
        </h2>
        <div className="RoomByBudgetGrid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
          <RoomByBudgetCard
            budgetRange={t("landing.budget.card1Title")}
            description={t("landing.budget.card1Desc")}
            to={buildExplorePath({ budgetRange: "0-10000" })}
            button={t("landing.budget.browseRooms")}
          />
          <RoomByBudgetCard
            budgetRange={t("landing.budget.card2Title")}
            description={t("landing.budget.card2Desc")}
            to={buildExplorePath({ budgetRange: "10000-20000" })}
            button={t("landing.budget.browseRooms")}
          />
          <RoomByBudgetCard
            budgetRange={t("landing.budget.card3Title")}
            description={t("landing.budget.card3Desc")}
            to={buildExplorePath({ budgetRange: "20000-30000" })}
            button={t("landing.budget.browseRooms")}
          />
        </div>
      </div>

      {/* looking for a room section */}
      <div className="LookingForARoomSection flex flex-col lg:flex-row justify-between gap-4 items-stretch text-white p-4 sm:p-6 md:p-10 mb-10 rounded-lg mx-4 sm:mx-8 lg:mx-24">
        <div className="bg-green-800 p-6 md:p-10 rounded-lg flex-1 flex flex-col items-center">
          <h1 className="text-2xl font-semibold text-center mt-3">
            {t("landing.cta.findRoomTitle")}
          </h1>
          <p className="text-center">
            {t("landing.cta.findRoomDesc")}
          </p>
          <p className="text-center">{t("landing.cta.findRoomSubDesc")}</p>
          <button
            type="button"
            onClick={handleFindRoomCtaClick}
            className="text-green-800 bg-white px-4 py-2 mt-4 rounded-xl"
          >
            {t("landing.cta.findRoomButton")}
          </button>
        </div>

        <div className="bg-gray-100 p-6 md:p-10 border border-green-200 rounded-lg flex-1 flex flex-col items-center">
          <h1 className="text-2xl text-green-800 font-semibold text-center mt-3">
            {t("landing.cta.listRoomTitle")}
          </h1>
          <p className="text-center text-green-800">
            {t("landing.cta.listRoomDesc")}
          </p>
          <button
            type="button"
            onClick={handleListRoomCtaClick}
            className="text-white bg-green-800 px-4 py-2 mt-4 rounded-xl"
          >
            {t("landing.cta.listRoomButton")}
          </button>
        </div>
      </div>

      {/* Mobile app */}
      <div className="mobile relative overflow-hidden bg-linear-to-r from-[#08132b] via-[#0d1e42] to-[#16284c] px-4 py-9 md:py-13">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[380px] w-[380px] rounded-full border border-emerald-500/25 motion-safe:animate-pulse md:h-[480px] md:w-[480px]" />
          <div className="absolute h-[520px] w-[520px] rounded-full border border-cyan-400/10 md:h-[660px] md:w-[660px]" />
        </div>

        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          

          <h2 className="text-balance text-2xl font-bold text-white sm:text-4xl md:text-5xl">
            {t("landing.mobile.title")}
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
            {t("landing.mobile.desc")}
            <span className="font-semibold text-white"> {t("landing.mobile.install")}</span> {t("landing.mobile.whenPrompted")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-300">
              {t("landing.mobile.offlineReady")}
            </span>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-300">
              {t("landing.mobile.instantLoad")}
            </span>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-300">
              {t("landing.mobile.noAppStore")}
            </span>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-300">
              {t("landing.mobile.autoUpdates")}
            </span>
          </div>

          <button
            type="button"
            onClick={handleInstallAppClick}
            disabled={!isInstallPromptAvailable}
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-green-600 px-9 py-4 text-xl font-bold text-white shadow-[0_12px_40px_rgba(16,185,129,0.45)] transition-all hover:scale-[1.02] hover:bg-pink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-green-600"
          >
            <FaDownload />
            {t("landing.mobile.installApp")}
          </button>
        </div>
      </div>

      {/* request property section */}
      <div className="mx-4 mb-10 mt-10 sm:mx-8 lg:mx-24">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-green-100 px-5 py-6 sm:px-8 lg:px-12">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold leading-tight text-green-800 sm:text-2xl lg:text-[40px] lg:leading-[1.1]">
                {t("landing.request.title")}
              </h2>
              <br />
              <p className="mt-2 text-sm text-black sm:text-base lg:text-[20px] lg:leading-[1.2]">
                {t("landing.request.desc")}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRequestPropertyClick}
              className="inline-flex items-center gap-3 whitespace-nowrap rounded-md bg-green-800 text-white px-6 py-3 text-sm font-semibold shadow-sm transition-colors hover:bg-[#1c7fbe] sm:px-10 sm:py-4 sm:text-base lg:px-12"
            >
              <FaRegEdit className="text-lg" />
              {t("landing.request.button")}
            </button>

            <div className="w-full max-w-60 shrink-0 sm:max-w-[280px] lg:max-w-[300px]">
              <img
                src="/confused.webp"
                alt={t("landing.request.imageAlt")}
                className="h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* footer */}
      <Footer logo="logo.png" />
    </>
  );
}
