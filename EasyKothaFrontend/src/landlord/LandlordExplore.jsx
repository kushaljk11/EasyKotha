import { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../api/axios";
import { MapPin, Home, Filter, Clock, Crosshair, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import LandlordLayout from "./LandlordLayout";
import Search from "../components/Search";
import { API_ORIGIN } from "../config/env";
import {
  getAllMunicipalities,
  getDistrictsByProvince,
  getProvinces,
} from "../utils/locationUtils";

const isLikelyImageUrl = (value) => /^https?:\/\//i.test(value);
const isDataImage = (value) => /^data:image\//i.test(value);
const isUploadPath = (value) => /^(\/?uploads[\\/])/i.test(value);

const toAbsoluteUploadUrl = (value) => {
  const normalizedPath = String(value || "")
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");

  if (!normalizedPath) return "";
  return API_ORIGIN ? `${API_ORIGIN}/${normalizedPath}` : `/${normalizedPath}`;
};

const normalizeImageUrls = (images) => {
  if (!images) return [];

  const rawList = Array.isArray(images) ? images : [images];

  const parsedList = rawList.flatMap((item) => {
    if (Array.isArray(item)) return item;

    const value = String(item || "").trim();
    if (!value) return [];

    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }

    return [value];
  });

  return parsedList
    .flatMap((item) => {
      const value = String(item || "").trim();
      if (!value) return [];
      if (isDataImage(value)) return [value];
      if (value.includes("\n") || value.includes("\r")) {
        return value.split(/\r?\n/);
      }
      return value.includes(",") ? value.split(",") : [value];
    })
    .map((item) => item.trim())
    .map((item) => {
      if (isLikelyImageUrl(item) || isDataImage(item)) return item;
      if (/^\/\//.test(item)) return `https:${item}`;
      if (isUploadPath(item)) return toAbsoluteUploadUrl(item);
      return "";
    })
    .filter(Boolean);
};

const LOCATION_SUFFIX_PATTERN =
  /\b(metropolitan city|metropolitan|sub-metropolitan city|sub metropolitan city|municipality|rural municipality|submetropolitan)\b/gi;

const normalizeLocationName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toLocationMatchKey = (value) =>
  normalizeLocationName(value)
    .replace(LOCATION_SUFFIX_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();

const findMatchingLocation = (candidates, options) => {
  const optionRecords = options
    .map((name) => {
      const normalized = normalizeLocationName(name);
      const key = toLocationMatchKey(name);
      return normalized ? { original: name, normalized, key } : null;
    })
    .filter(Boolean);

  for (const candidate of candidates) {
    const candidateNormalized = normalizeLocationName(candidate);
    const candidateKey = toLocationMatchKey(candidate);

    if (!candidateNormalized && !candidateKey) continue;

    const exact = optionRecords.find(
      (record) =>
        (candidateNormalized && record.normalized === candidateNormalized) ||
        (candidateKey && record.key === candidateKey),
    );
    if (exact) return exact.original;

    const partial = optionRecords.find(
      (record) =>
        (candidateKey &&
          (record.key.includes(candidateKey) || candidateKey.includes(record.key))) ||
        (candidateNormalized &&
          (record.normalized.includes(candidateNormalized) ||
            candidateNormalized.includes(record.normalized))),
    );
    if (partial) return partial.original;
  }

  return "";
};

const getPostId = (post) => post?.id ?? post?._id;

export default function LandlordExplore() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationInputRef = useRef(null);
  const geolocationAttemptedRef = useRef(false);
  const [posts, setPosts] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [roomType, setRoomType] = useState("");
  const [sort, setSort] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [locationOptions, setLocationOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [usingDetectedLocation, setUsingDetectedLocation] = useState(false);

  const districtNameSet = useMemo(
    () => new Set(districtOptions.map((item) => normalizeLocationName(item))),
    [districtOptions],
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setDistrict(queryParams.get("city") || queryParams.get("district") || "");
    setRoomType(queryParams.get("type") || "");
    setSort(queryParams.get("sort") || "");
    setSearchQuery(queryParams.get("search") || "");

    const minPrice = queryParams.get("minPrice") || "";
    const maxPrice = queryParams.get("maxPrice") || "";
    if (minPrice || maxPrice) {
      setPriceRange(`${minPrice}-${maxPrice}`);
    } else {
      setPriceRange("");
    }
  }, [location.search]);

  useEffect(() => {
    const closeLocationSuggestions = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", closeLocationSuggestions);
    return () => {
      document.removeEventListener("mousedown", closeLocationSuggestions);
    };
  }, []);

  useEffect(() => {
    const loadNepalLocations = async () => {
      try {
        setLocationsLoading(true);
        const [provinces, municipalities] = await Promise.all([
          getProvinces(),
          getAllMunicipalities(),
        ]);

        const districtChunks = await Promise.all(
          provinces.map((province) => getDistrictsByProvince(province)),
        );

        const allDistricts = districtChunks.flat().filter(Boolean);
        const mergedLocations = [...allDistricts, ...municipalities]
          .map((item) => String(item || "").trim())
          .filter(Boolean);

        const uniqueLocations = [...new Set(mergedLocations)].sort((a, b) =>
          a.localeCompare(b),
        );
        const uniqueDistricts = [...new Set(allDistricts)].sort((a, b) => a.localeCompare(b));

        setLocationOptions(uniqueLocations);
        setDistrictOptions(uniqueDistricts);
      } catch (error) {
        console.error("Failed to load Nepal locations:", error);
      } finally {
        setLocationsLoading(false);
      }
    };

    loadNepalLocations();
  }, []);

  const detectAndApplyNearestLocation = async () => {
    if (typeof window === "undefined" || !window.navigator?.geolocation) {
      return;
    }

    if (!locationOptions.length || locatingUser) {
      return;
    }

    setLocatingUser(true);
    try {
      const position = await new Promise((resolve, reject) => {
        window.navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 5 * 60 * 1000,
        });
      });

      const latitude = position?.coords?.latitude;
      const longitude = position?.coords?.longitude;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return;
      }

      const reverseUrl =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}` +
        "&zoom=10&addressdetails=1&accept-language=en&countrycodes=np";
      const reverseResponse = await fetch(reverseUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!reverseResponse.ok) {
        return;
      }

      const reversePayload = await reverseResponse.json();
      const address = reversePayload?.address || {};
      const locationCandidates = [
        address.city,
        address.town,
        address.municipality,
        address.district,
        address.county,
        address.state_district,
        address.village,
      ].filter(Boolean);

      const matchedLocation = findMatchingLocation(locationCandidates, locationOptions);
      if (!matchedLocation) {
        return;
      }

      setDistrict(matchedLocation);
      const queryParams = new URLSearchParams(location.search);
      const normalizedMatch = normalizeLocationName(matchedLocation);

      if (districtNameSet.has(normalizedMatch)) {
        queryParams.set("district", matchedLocation);
        queryParams.delete("city");
      } else {
        queryParams.set("city", matchedLocation);
        queryParams.delete("district");
      }

      navigate(
        {
          pathname: location.pathname,
          search: queryParams.toString(),
        },
        { replace: true },
      );
      setUsingDetectedLocation(true);
    } catch (error) {
      console.warn("Location detection skipped:", error?.message || error);
    } finally {
      setLocatingUser(false);
    }
  };

  const disableDetectedLocation = () => {
    setUsingDetectedLocation(false);
    setDistrict("");
    setShowLocationSuggestions(false);

    const queryParams = new URLSearchParams(location.search);
    queryParams.delete("district");
    queryParams.delete("city");

    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString(),
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (!locationOptions.length || district || geolocationAttemptedRef.current) {
      return;
    }

    geolocationAttemptedRef.current = true;
    detectAndApplyNearestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationOptions, district]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await axiosInstance.get("/posts/types");
        if (response.data.success) {
          setRoomTypes(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch room types:", error);
      }
    };

    fetchRoomTypes();
  }, []);

  useEffect(() => {
    const fetchApprovedPosts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(location.search);
        const search = queryParams.get("search") || "";
        const minPrice = queryParams.get("minPrice") || "";
        const maxPrice = queryParams.get("maxPrice") || "";
        const normalizedSelectedLocation = normalizeLocationName(district);
        const isDistrictFilter = districtNameSet.has(normalizedSelectedLocation);

        const res = await axiosInstance.get("/posts", {
          params: {
            page,
            limit: 10,
            status: "approved",
            ...(search && { search }),
            ...(district && isDistrictFilter && { district }),
            ...(district && !isDistrictFilter && { city: district }),
            ...(roomType && { type: roomType }),
            ...(sort && { sort }),
            ...(minPrice && { minPrice }),
            ...(maxPrice && { maxPrice }),
          },
        });
        setPosts(res.data?.data || []);
        setTotalPages(res.data?.pages || 1);
      } catch (error) {
        console.error("Failed to fetch explore listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [district, districtNameSet, roomType, sort, page, location.search]);

  const filteredPosts = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return posts;

    return posts.filter((post) => {
      const title = post.title?.toLowerCase() || "";
      const district = post.district?.toLowerCase() || "";
      const city = post.city?.toLowerCase() || "";
      return title.includes(term) || district.includes(term) || city.includes(term);
    });
  }, [posts, searchQuery]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setPage(1);

    const queryParams = new URLSearchParams(location.search);
    if (district) {
      const normalizedSelectedLocation = normalizeLocationName(district);
      if (districtNameSet.has(normalizedSelectedLocation)) {
        queryParams.set("district", district);
        queryParams.delete("city");
      } else {
        queryParams.set("city", district);
        queryParams.delete("district");
      }
    } else {
      queryParams.delete("district");
      queryParams.delete("city");
    }

    if (roomType) queryParams.set("type", roomType);
    else queryParams.delete("type");

    if (sort) queryParams.set("sort", sort);
    else queryParams.delete("sort");

    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (min) queryParams.set("minPrice", min);
      else queryParams.delete("minPrice");

      if (max) queryParams.set("maxPrice", max);
      else queryParams.delete("maxPrice");
    } else {
      queryParams.delete("minPrice");
      queryParams.delete("maxPrice");
    }

    if (searchQuery) queryParams.set("search", searchQuery);
    else queryParams.delete("search");

    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString(),
      },
      { replace: true },
    );
  };

  const filteredLocations = district.trim()
    ? locationOptions.filter((item) =>
        normalizeLocationName(item).includes(normalizeLocationName(district)),
      )
    : locationOptions;

  const locationSuggestions = filteredLocations.slice(0, 12);

  return (
    <LandlordLayout searchPlaceholder="Search available listings...">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-3">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              Search Property
            </label>
            <Search
              placeholder="Find your next home..."
              className="w-[calc(100%+3px)] max-w-none"
              value={searchQuery}
              onChange={setSearchQuery}
              district={district}
              type={roomType}
              basePath="/landlord/explore"
              onSuggestionClick={(item) => {
                const selectedQuery = item.title || "";
                setSearchQuery(selectedQuery);
                const queryParams = new URLSearchParams(location.search);
                if (selectedQuery) queryParams.set("search", selectedQuery);
                else queryParams.delete("search");
                navigate(
                  {
                    pathname: location.pathname,
                    search: queryParams.toString(),
                  },
                  { replace: true },
                );
              }}
            />
          </div>

          <div ref={locationInputRef} className="relative md:col-span-3">
            <label className="mb-3 flex flex-col gap-2 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <MapPin size={12} /> City/District
              </span>
              <button
                type="button"
                onClick={() => {
                  if (usingDetectedLocation) {
                    disableDetectedLocation();
                    return;
                  }
                  detectAndApplyNearestLocation();
                }}
                disabled={locationsLoading || locatingUser}
                className={`inline-flex w-fit self-start items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:self-auto ${
                  usingDetectedLocation
                    ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 focus-visible:ring-red-500/30"
                    : "border border-green-200 bg-green-50 text-green-800 hover:bg-green-100 hover:text-green-900 focus-visible:ring-green-800/30"
                }`}
              >
                {locatingUser ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-green-300 border-t-green-800" />
                ) : usingDetectedLocation ? (
                  <X size={12} className="shrink-0" />
                ) : (
                  <Crosshair size={12} className="shrink-0" />
                )}
                <span className="whitespace-nowrap">
                  {locatingUser
                    ? "Detecting..."
                    : usingDetectedLocation
                      ? "Disable my location"
                      : "Use my location"}
                </span>
              </button>
            </label>

            <input
              type="text"
              autoComplete="off"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
              value={district}
              onChange={(event) => {
                setUsingDetectedLocation(false);
                setDistrict(event.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              placeholder={locationsLoading ? "Loading Nepal locations..." : "Search city/district in Nepal"}
              disabled={locationsLoading}
            />

            {showLocationSuggestions && !locationsLoading && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setUsingDetectedLocation(false);
                    setDistrict("");
                    setShowLocationSuggestions(false);
                  }}
                  className="w-full border-b border-gray-100 px-4 py-2.5 text-left text-sm font-semibold text-green-800 transition hover:bg-green-50"
                >
                  All Locations
                </button>

                {locationSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setUsingDetectedLocation(false);
                      setDistrict(item);
                      setShowLocationSuggestions(false);
                    }}
                    className="w-full border-b border-gray-100 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-green-800/5 hover:text-green-800 last:border-b-0"
                  >
                    {item}
                  </button>
                ))}

                {!locationSuggestions.length && (
                  <p className="px-4 py-3 text-sm text-slate-500">
                    No matching Nepal city/district found.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Home size={12} /> Property Type
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium capitalize outline-none transition-all focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
              value={roomType}
              onChange={(event) => setRoomType(event.target.value)}
            >
              <option value="">Any Type</option>
              {roomTypes.map((item) => (
                <option key={item} value={item}>
                  {item.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Filter size={12} /> Price
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
              value={priceRange || sort}
              onChange={(event) => {
                const value = event.target.value;

                if (value.includes("-")) {
                  setPriceRange(value);
                  setSort("");
                  return;
                }

                setSort(value);
                setPriceRange("");
              }}
            >
              <option value="">Any Price</option>
              <option value="1000-2000">NPR 1000 - 2000</option>
              <option value="2000-3000">NPR 2000 - 3000</option>
              <option value="3000-4000">NPR 3000 - 4000</option>
              <option value="priceLowToHigh">Price: Low</option>
              <option value="priceHighToLow">Price: High</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <motion.button
              type="submit"
              className="w-full rounded-xl bg-green-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-900"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              Apply Filters
            </motion.button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="mt-1 text-4xl font-bold text-green-800">All Rooms</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Found {filteredPosts.length} properties matching your criteria
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {loading && <p className="text-sm text-slate-500">Loading listings...</p>}

        {!loading && filteredPosts.length === 0 && (
          <div className="col-span-full rounded-3xl border-2 border-dashed border-gray-200 py-20 text-center">
            <h3 className="text-2xl font-semibold text-black">No properties found</h3>
            <p className="mt-2 text-slate-500">Try adjusting your filters to find more results.</p>
          </div>
        )}

        {!loading &&
          filteredPosts.map((post) => {
            const postId = getPostId(post);
            const imageUrls = normalizeImageUrls(post.images);
            const firstImage = imageUrls[0] || "";

            return (
              <motion.article
                key={postId || `${post.title}-${post.createdAt}`}
                className="cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md flex flex-col"
                onClick={() => postId && navigate(`/posts/${postId}`)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                whileHover={{ y: -3 }}
              >
                <div className="relative h-44 sm:h-48 bg-slate-100 shrink-0 overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={post.title}
                      className="block h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      No image
                    </div>
                  )}
                </div>

                <div className="relative z-10 flex flex-1 flex-col space-y-3 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-lg font-semibold text-black">{post.title}</h3>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {post.status || "approved"}
                    </span>
                  </div>

                  <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-green-800" />
                    {post.city}, {post.district}
                  </p>

                  <p className="inline-flex items-center gap-2 text-lg font-bold text-green-800">
                    <Clock size={14} className="text-green-800" />
                    NPR {Number(post.price || 0).toLocaleString()}
                  </p>

                  <p className="line-clamp-2 text-sm text-slate-600">
                    {post.content || "No description available."}
                  </p>

                  <p className="text-xs font-medium text-slate-500">
                    Posted by: {post.author?.name || "Unknown landlord"}
                  </p>
                </div>
              </motion.article>
            );
          })}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setPage(index + 1)}
              className={`h-10 w-10 rounded-xl text-xs font-semibold transition-all ${
                page === index + 1
                  ? "bg-green-800 text-white"
                  : "border border-gray-200 bg-white text-slate-500 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {index + 1}
            </motion.button>
          ))}
        </div>
      )}
    </LandlordLayout>
  );
}
