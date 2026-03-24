import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function FeaturedListingCard({ imageSrc, title, location, pricePerMonth, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="FeaturedListingCard w-full overflow-hidden rounded-xl border border-green-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <img className="h-32 w-full object-cover sm:h-40" src={imageSrc} alt={title} />
      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-green-800 sm:text-lg">{title}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-gray-600 sm:text-sm">{location}</p>
        <p className="mt-2 text-base font-bold text-green-900 sm:text-xl">
          Rs. {pricePerMonth} / month
        </p>
      </div>
    </button>
  );
}

function HowEasyKothaWorksCard({ title, description, description2, number }) {
  return (
    <div className="HowEasyKothaWorksCard flex flex-col items-center text-center gap-2 p-4 border border-green-200 rounded-lg shadow-xl hover:shadow-xl transition-shadow duration-200">
      <div className="h-12 w-12 bg-green-800 text-white flex items-center justify-center rounded-full">
        {number}
      </div>
      <h3 className="text-green-800 text-lg font-semibold">Step {title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-sm text-gray-600">{description2}</p>
    </div>
  );
}

function RoomByBudgetCard({ budgetRange, description, to, button }) {
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

export default function Landing() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [isLoadingFeaturedRooms, setIsLoadingFeaturedRooms] = useState(true);
  const suggestionBoxRef = useRef(null);

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

  const buildExplorePath = ({ keyword = "", city = "" }) => {
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
    });

    navigateWithAuthCheck(target);
  };

  const handleSuggestionClick = (postId) => {
    if (!postId) return;
    setShowSuggestions(false);
    navigateWithAuthCheck(`/posts/${postId}`);
  };

  const handleSearchInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
    }
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
            Find your perfect space in{" "}
            <span className="text-green-300 font-bold">Nepal.</span>
          </h1>
          <p className="text-white/90 mt-3 max-w-3xl text-sm sm:mt-4 sm:text-base lg:text-lg">
            From sunny flats in Baneshwor to cozy rooms in Lakeside, trust
            EasyKotha for your next move.
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
                    placeholder="Search rooms"
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
                        <p className="px-4 py-3 text-sm text-gray-500">Searching...</p>
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
                                  alt={post.title || "Room"}
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
                          No matching active listings found.
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
                    <option value="">City</option>
                    {locationOptions.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 md:col-span-3 lg:col-span-2">
                  <FaWallet className="text-green-800 text-lg" />
                  <select className="w-full bg-transparent text-sm md:text-base focus:outline-none">
                    <option>Budget Range</option>
                    <option>Under Rs. 10,000</option>
                    <option>Rs. 10,000 - Rs. 20,000</option>
                    <option>Rs. 20,000 - Rs. 30,000</option>
                    <option>Rs. 30,000+</option>
                  </select>
                </div>
                <button
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-800 text-white font-semibold py-3 px-4 hover:bg-[#154f52] transition-colors shadow-lg md:col-span-2 lg:col-span-3"
                  onClick={handleSearchSubmit}
                >
                  <FaSearch />
                  Search
                </button>
              </div>

              <div className="flex flex-col justify-center gap-2.5 text-xs font-semibold text-green-800 sm:flex-row sm:gap-6 sm:text-sm">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow">
                  <FaUserCheck className="text-green-800" />
                  Verified Landlords
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow">
                  <FaLock className="text-green-800" />
                  Secure Payments
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow">
                  <FaHeadset className="text-green-800" />
                  24/7 Support
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
            Popular Searches
          </h2>
          <div className="flex flex-wrap md:flex-nowrap items-center cursor-pointer justify-center md:justify-start gap-0 text-xs sm:text-sm md:text-[20px] font-medium text-gray-800 whitespace-nowrap">
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "furnished room" }))}>Furnished Room</button>
            <span className="text-gray-400">|</span>
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "shared room" }))}>Shared Room</button>
            <span className="text-gray-400">|</span>
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "single room" }))}>Single Room</button>
            <span className="text-gray-400">|</span>
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "pet friendly" }))}>Pet-Friendly</button>
            <span className="text-gray-400">|</span>
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "budget rooms" }))}>Budget Rooms</button>
            <span className="text-gray-400">|</span>
            <button className="px-1.5 py-0.5 cursor-pointer hover:underline" onClick={() => navigateWithAuthCheck(buildExplorePath({ keyword: "nearby location" }))}>Nearby Locations</button>
          </div>
        </div>
      </div>

      {/* why easykotha section */}
      <div className="WhyEasyKothaSection flex flex-col items-center mt-16 gap-6 px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-center">
          Why <span className="text-green-800 font-semibold">EasyKotha</span>?
        </h2>
        <div className="WhyEasyKothaGrid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          <WhyEasyKothaCard
            icon={FaUserFriends({ size: 48 })}
            title="No Middle Man"
            description="Direct Contact with Room Owners"
          />
          <WhyEasyKothaCard
            icon={FaTabletAlt({ size: 48 })}
            title="User-Friendly Interface"
            description="Easily navigate and find Room."
          />
          <WhyEasyKothaCard
            icon={FaCheckCircle({ size: 48 })}
            title="Trusted Listings"
            description="All listings are verified."
          />
          <WhyEasyKothaCard
            icon={FaHeadset({ size: 48 })}
            title="24/7 Customer Support"
            description="Our support team is always available."
          />
        </div>
      </div>

      {/* Location */}
      <div className="LocationsSection flex flex-col items-center mt-20 bg-gray-100 gap-8 px-4 py-10 md:p-10">
        <h2 className="text-3xl md:text-3xl font-semibold text-center">
          <span className="text-green-800 font-semibold">Explore </span>by Location
        </h2>
        <div className="LocationsGrid grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 md:gap-6">
          <LocationCard
            imageSrc="https://imgs.search.brave.com/GAIYvtELr_GBXvpe7yW6Cz4yl7g-lidMwk8wj79C1-4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/ZWFydGh0cmVra2Vy/cy5jb20vd3AtY29u/dGVudC91cGxvYWRz/LzIwMTYvMDIvS2F0/aG1hbmR1LWZyb20t/SGlnaC5qcGcub3B0/aW1hbC5qcGc"
            locationName="Kathmandu"
            onClick={() => handleLocationClick("Kathmandu")}
          />
          <LocationCard
            imageSrc="https://imgs.search.brave.com/ze4G9XolbChWJjIwSpDNaU624HhLigRyqZ48tHsCk2Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZi5i/c3RhdGljLmNvbS94/ZGF0YS9pbWFnZXMv/aG90ZWwvc3F1YXJl/NjAwLzU1NDc3MjAz/OS53ZWJwP2s9ZDRl/NDU4OGNjZjM2MWZl/YTUzY2ZhMzYwODY1/YTczNzg3NzZkN2Ey/MGIyYTU0ZmI5MDM4/ODk5ZjA1ZmZmNGQ3/OCZvPQ"
            locationName="Itahari"
            onClick={() => handleLocationClick("Itahari")}
          />
          <LocationCard
            imageSrc="https://imgs.search.brave.com/mUqepwjm1-jjqQvKZdF1-Qxx0jT7o9FKXdXDfFuH5Po/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dHJla2tpbmdhZHZp/c29yLmNvbS9pbWFn/ZS8xMDI0L3RyZWtf/bWVkaWEvcGxhY2Vz/L2RoYXJhbi9EaGFy/YW4uanBn"
            locationName="Dharan"
            onClick={() => handleLocationClick("Dharan")}
          />
          <LocationCard
            imageSrc="https://imgs.search.brave.com/GkiPcAl6KnRuamx0dISXq-QBYRXy-c9NlVuHmI1cfDA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cGlnZW9udHJhdmVs/cy5jb20vd3AtY29u/dGVudC91cGxvYWRz/LzIwMTgvMTEvYmly/YXRuYWdhci1nYXRl/LTIzMDYyMDE3MDgy/NjI3LTEwMDB4MC5q/cGc"
            locationName="Biratnagar"
            onClick={() => handleLocationClick("Biratnagar")}
          />
          <LocationCard
            imageSrc="https://imgs.search.brave.com/9yMX6V_cbbmggXZ1OiW5rQ2cxHqJl7rPDzSFQuZt5-o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9lbmds/aXNoLm5lcGFsbmV3/cy5jb20vd3AtY29u/dGVudC91cGxvYWRz/LzIwMjUvMDIvMzM0/OTg4Mjk5XzExMzk0/NzI3ODY3NDk3Nzdf/ODgyNzE5NjcyMjE1/Mjc3MTI3Ml9uLmpw/Zw"
            locationName="Damak"
            onClick={() => handleLocationClick("Damak")}
          />
          <LocationCard
            imageSrc="https://imgs.search.brave.com/yGv11ms-TJXfycSLDgs7vuj3iw52lyIXV9bGT8PtSi0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9uZXBh/bC1kb21hay1jaXR5/LWpoYXBhLWJpc2hh/bC1tYXJnLXJvYWQt/ZGlzdHJpY3QtY2xv/c2VzdC10by1yYWRo/YS1rcmlzaG5hLXRl/bXBsZS1qdW5jdGlv/bi0xOTIzNjg3MDYu/anBn"
            locationName="Kerkha"
            onClick={() => handleLocationClick("Kerkha")}
          />
        </div>
      </div>

      {/* Featured listing post */}

      <div className="FeaturedListingsSection flex flex-col items-center mt-20 gap-8 mb-16 px-4">
        <h2 className="text-3xl md:text-3xl font-semibold text-center">
          <span className="text-green-800 font-semibold">Featured </span>Listings
        </h2>
        <div className="FeaturedListingsGrid grid w-full max-w-7xl grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4 md:gap-6">
          {isLoadingFeaturedRooms && (
            <p className="col-span-full text-center text-sm font-medium text-slate-500">Loading available rooms...</p>
          )}

          {!isLoadingFeaturedRooms && featuredRooms.length === 0 && (
            <p className="col-span-full text-center text-sm font-medium text-slate-500">No rooms available at the moment.</p>
          )}

          {!isLoadingFeaturedRooms &&
            featuredRooms.map((room) => (
              <FeaturedListingCard
                key={room.id || room._id || `${room.title}-${room.createdAt}`}
                imageSrc={getPostPreviewImage(room.images)}
                title={room.title || "Available Room"}
                location={`${room.city || "Unknown city"}, ${room.district || "Unknown district"}`}
                pricePerMonth={Number(room.price || 0).toLocaleString()}
                onClick={() => handleFeaturedRoomClick(room)}
              />
            ))}
        </div>
      </div>

      {/* how easykotha works */}
      <div className="HowEasyKothaWorksSection flex flex-col items-center mt-20 mb-16 gap-8 bg-gray-50 px-4 py-10 md:p-10">
        <h2 className="text-3xl md:text-4xl font-semibold text-center">
          How <span className="text-green-800 font-semibold">EasyKotha</span> Works
        </h2>
        <div className="HowEasyKothaWorksGrid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-6xl">
          <HowEasyKothaWorksCard
            number={1}
            title="Search Rooms"
            description="Enter your location and preferences to"
            description2="findsuitable rooms."
          />
          <HowEasyKothaWorksCard
            number={2}
            title="Browse Listings"
            description="View detailed photos and room"
            description2="Information."
          />
          <HowEasyKothaWorksCard
            number={3}
            title="Contact Owners"
            description="Directly communicate with the"
            description2="room owners."
          />
          <HowEasyKothaWorksCard
            number={4}
            title="Book for Visit"
            description="Schedule a visit or book your"
            description2="perfect room."
          />
        </div>
      </div>

      {/* Room by budget */}
      <div className="RoomByBudgetSection flex flex-col items-center mt-20 mb-16 gap-8 px-4">
        <h2 className="text-3xl md:text-3xl font-semibold text-center">
          <span className="text-green-800 font-semibold">Rooms </span>by Budget
        </h2>
        <div className="RoomByBudgetGrid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
          <RoomByBudgetCard
            budgetRange="Under Rs. 10,000"
            description="Affordable rooms for budget-conscious renters."
            button="Browse Rooms"
          />
          <RoomByBudgetCard
            budgetRange="Rs. 10,000 - Rs. 20,000"
            description="Comfortable rooms with great amenities."
            button="Browse Rooms"
          />
          <RoomByBudgetCard
            budgetRange="Rs. 20,000 - Rs. 30,000"
            description="Spacious rooms in prime locations."
            button="Browse Rooms"
          />
        </div>
      </div>

      {/* looking for a room section */}
      <div className="LookingForARoomSection flex flex-col lg:flex-row justify-between gap-4 items-stretch text-white p-4 sm:p-6 md:p-10 mb-10 rounded-lg mx-4 sm:mx-8 lg:mx-24">
        <div className="bg-green-800 p-6 md:p-10 rounded-lg flex-1 flex flex-col items-center">
          <h1 className="text-2xl font-semibold text-center mt-3">
            Looking for a Room?
          </h1>
          <p className="text-center">
            Start your search and find your perfect room today.
          </p>
          <p className="text-center">It's fast, easy, and free</p>
          <button className="text-green-800 bg-white px-4 py-2 mt-4 rounded-xl">
            Find Room
          </button>
        </div>

        <div className="bg-gray-100 p-6 md:p-10 border border-green-200 rounded-lg flex-1 flex flex-col items-center">
          <h1 className="text-2xl text-green-800 font-semibold text-center mt-3">
            Have a Room to Rent?
          </h1>
          <p className="text-center text-green-800">
            List your property for free and connect with thousand of potential
            tenants
          </p>
          <button className="text-white bg-green-800 px-4 py-2 mt-4 rounded-xl">
            List Room
          </button>
        </div>
      </div>

      {/* Mobile app */}
      <div className="mobile bg-gray-50 py-10 md:py-16 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6 lg:gap-8">
          {/* Left: Phone Images */}
          <div className="image shrink-0 w-full md:w-2/5 flex justify-center relative">
            <div className="absolute w-56 sm:w-64 md:w-96 h-48 sm:h-56 md:h-80 bg-white rounded-3xl -z-10 top-1 sm:top-2 md:top-4 left-0"></div>

            <div className="relative w-48 sm:w-56 md:w-80 h-56 sm:h-64 md:h-96 bg-gray-100 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden">
              {/* Phone mockup with image */}
              <img
                src="/mobile.png"
                alt="Mobile App Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Content Section */}
          <div className="content w-full md:w-3/5">
            <span className="bg-green-800 text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-1 md:py-2 rounded-full inline-block mb-2 md:mb-4">
              Coming Soon
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 md:mb-3">
              Join Our App
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg mb-4 md:mb-6">
              Be the first person to know when we launch our mobile app!
            </p>
            {/* Features List */}
            <div className="features space-y-3 md:space-y-4 mb-6 md:mb-8">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="bg-green-800 text-white rounded-lg p-1.5 md:p-2 shrink-0 mt-0.5">
                  <svg
                    className="w-4 md:w-5 h-4 md:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 text-sm md:text-base">
                    Real-time notification
                  </h3>
                  <p className="text-xs md:text-sm text-green-800">
                    Stay updated with instant notifications
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 md:gap-3">
                <div className="bg-green-800 text-white rounded-lg p-1.5 md:p-2 shrink-0 mt-0.5">
                  <svg
                    className="w-4 md:w-5 h-4 md:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 text-sm md:text-base">
                    Location-based service
                  </h3>
                  <p className="text-xs md:text-sm text-green-800">
                    Find what's nearby with smart location
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 md:gap-3">
                <div className="bg-green-800 text-white rounded-lg p-1.5 md:p-2 shrink-0 mt-0.5">
                  <svg
                    className="w-4 md:w-5 h-4 md:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 text-sm md:text-base">
                    Direct messaging
                  </h3>
                  <p className="text-xs md:text-sm text-green-800">
                    Connect directly with users
                  </p>
                </div>
              </div>
            </div>
            Email Subscription
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-green-800 focus:outline-none focus:ring-2 focus:ring-green-800 text-gray-800 text-sm md:text-base"
              />
              <button className="bg-green-800 hover:bg-blue-900 text-white font-semibold py-2 md:py-3 px-4 md:px-8 rounded-full flex items-center justify-center gap-2 transition-colors whitespace-nowrap text-xs md:text-sm">
                <svg
                  className="w-4 md:w-5 h-4 md:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* browse listings section */}
      <div className="bg-gray-100 px-4 py-8 md:p-8 flex flex-col items-center gap-2">
        <h1 className="text-2xl md:text-4xl text-green-800 font-bold text-center">
          Ready to find the Perfect Rent?
        </h1>

        <p className="text-base md:text-lg font-normal text-green-800 text-center">
          Explore our listings and find your ideal rentals today.
        </p>

        <button className="bg-green-800 hover:bg-green-700 cursor-pointer text-white hover:text-white py-2 md:py-3 px-6 rounded-lg">
          Browse Listings
        </button>
      </div>

      {/* footer */}
      <Footer logo="logo.png" />
    </>
  );
}
