import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axios";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  MapPin,
  Wifi,
  Droplets,
  Home,
  Pocket,
  Wind,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ChevronRight,
  UtilityPole,
  BedDouble,
  Bath,
  ArrowRight,
  Phone,
  Store,
} from "lucide-react";
import Topbar from "./Topbar";
import TenantLayout from "../tenants/TenantLayout";
import LandlordLayout from "../landlord/LandlordLayout";

const Detailpage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const { setSelectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const [visitDate, setVisitDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const routeId = typeof id === "string" ? id.trim() : "";
  const fallbackId =
    location.state?.postId ||
    location.state?.post?._id ||
    location.state?.post?.id ||
    "";
  const postId =
    routeId && routeId !== "undefined" && routeId !== "null"
      ? routeId
      : fallbackId;
  const normalizedRole = String(authUser?.role || "")
    .trim()
    .toUpperCase();
  const isTenantView = normalizedRole === "TENANT";
  const isLandlordView = normalizedRole === "LANDLORD";
  const isDashboardView = isTenantView || isLandlordView;
  const homePath = isLandlordView
    ? "/landlord/dashboard"
    : isTenantView
      ? "/tenant/dashboard"
      : "/";
  const explorePath = isLandlordView ? "/landlord/explore" : "/tenant/explore";
  const currentUserId = authUser?.id ?? authUser?._id ?? null;
  const hostUserId =
    post?.author?.id ?? post?.author?._id ?? post?.authorId ?? null;

  const renderWithinRoleLayout = (content) => {
    if (isTenantView) {
      return <TenantLayout>{content}</TenantLayout>;
    }

    if (isLandlordView) {
      return <LandlordLayout>{content}</LandlordLayout>;
    }

    return content;
  };

  // Icon mapping for amenities
  const amenityIcons = {
    WIFI: Wifi,
    WiFi: Wifi,
    Water: Droplets,
    Kitchen: Home,
    Balcony: Pocket,
    "Washing Machine": UtilityPole,
    AC: Wind,
    Parking: Store,
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        toast.error("Invalid property link");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/posts/${postId}`);
        if (response.data.success) {
          setPost(response.data.data);
        } else {
          toast.error(
            response.data.message || "Failed to fetch property details",
          );
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Error loading property details");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    const fetchRecommendations = async () => {
      if (!postId) return;

      try {
        const res = await axiosInstance.get(`/posts/${postId}/recommendations`);
        setRecommendations(res.data.data || []);
      } catch (err) {
        console.error("Recommendation error:", err);
      }
    };

    fetchRecommendations();
  }, [postId]);

  const handleBooking = async () => {
    if (!authUser) {
      toast.error("Please login to request a visit");
      navigate("/login");
      return;
    }

    if (!visitDate) {
      toast.error("Please select a visit date");
      return;
    }

    setBookingLoading(true);
    try {
      if (!postId) {
        toast.error("Invalid property link");
        setBookingLoading(false);
        return;
      }

      const response = await axiosInstance.post("/bookings", {
        postId,
        startDate: visitDate,
        endDate: visitDate, // Controller will handle same-day logic or we can add 1 day
      });

      if (response.data.success) {
        toast.success("Visit request sent successfully!");
        setVisitDate("");
      } else {
        toast.error(response.data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error.response?.data?.message || "Error sending visit request",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePayNow = () => {
    if (!authUser) {
      toast.error("Please login to continue payment");
      navigate("/login");
      return;
    }

    const params = new URLSearchParams({
      amount: String(post?.price || ""),
      gateway: "esewa",
      productName: `Booking - ${post?.title || "Property"}`,
      landlordId: String(
        post?.author?.id || post?.author?._id || post?.authorId || "",
      ),
      landlordName: post?.author?.name || "",
      landlordEmail: post?.author?.email || "",
      tenantName: authUser?.name || "",
      tenantEmail: authUser?.email || "",
    });

    navigate(`/payment?${params.toString()}`);
  };

  const handleChat = () => {
    if (!authUser) {
      toast.error("Please login to chat with landlord");
      navigate("/login");
      return;
    }

    if (!hostUserId) {
      toast.error("Host information not available");
      return;
    }

    if (
      currentUserId !== null &&
      String(currentUserId) === String(hostUserId)
    ) {
      toast.error("You cannot chat with yourself");
      return;
    }

    setSelectedUser({
      ...(post.author || {}),
      id: hostUserId,
      _id: hostUserId,
      name: post.author?.name || "Landlord",
      email: post.author?.email || "",
    });
    navigate("/chat");
  };

  if (loading) {
    return renderWithinRoleLayout(
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#19545c]"></div>
      </div>,
    );
  }

  if (!post) {
    return renderWithinRoleLayout(
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Property Not Found
        </h2>
        <Link
          to={explorePath}
          className="text-blue-600 font-bold hover:underline"
        >
          Back to Explore
        </Link>
      </div>,
    );
  }

  return renderWithinRoleLayout(
    <div
      className={`${isDashboardView ? "text-[#1a1a1a]" : "min-h-screen bg-white text-[#1a1a1a]"}`}
    >
      {!isDashboardView && <Topbar />}

      <div className="w-full px-4 md:px-6 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6">
          <Link to={homePath} className="hover:text-[#19545c]">
            Nepal
          </Link>
          <ChevronRight size={12} />
          <Link to={explorePath} className="hover:text-[#19545c]">
            {post.district || "Location"}
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-bold">{post.city}</span>
        </nav>

        {/* Gallery Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-112.5 mb-10 rounded-3xl overflow-hidden">
          {/* Main Large Image */}
          <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer">
            <img
              src={
                post.images?.[0] ||
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2000&auto=format&fit=crop"
              }
              className="w-full h-full object-cover hover:brightness-110 transition-all duration-300"
              alt="Main Property"
            />
            <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {post.type?.replace("_", " ")}
            </div>
          </div>

          {/* Side Grid */}
          <div className="md:col-span-2 grid grid-cols-2 gap-2 h-full">
            {(post.images?.length > 1
              ? post.images.slice(1, 5)
              : [1, 2, 3, 4]
            ).map((img, idx) => (
              <div
                key={idx}
                className="relative group overflow-hidden cursor-pointer bg-gray-50"
              >
                <img
                  src={
                    typeof img === "string"
                      ? img
                      : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop"
                  }
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  alt={`View ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Property Details (8 cols) */}
          <div className="lg:col-span-8">
            {/* Header Tags */}
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded uppercase">
                {post.purpose === "rent" ? "For Rent" : "For Sale"}
              </span>
              {post.status === "approved" && (
                <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2
                    size={12}
                    className="fill-green-600 text-white"
                  />{" "}
                  Verified Listing
                </span>
              )}
            </div>

            {/* Title & Address */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 ">
              {post.title}
            </h1>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-8">
              <MapPin size={16} className="text-gray-400" />
              {post.address}, {post.city}, {post.district}
            </div>

            {/* Horizontal Stats Row */}
            <div className="flex flex-wrap gap-4 border-t border-b border-gray-100 py-6 mb-8">
              <div className="flex items-center gap-3 pr-6 border-r border-gray-100 last:border-0">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                  <BedDouble size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {post.beds || 0} Beds
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {post.furnishing || "Unfurnished"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pr-6 border-r border-gray-100 last:border-0">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                  <Bath size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {post.baths || 0} Baths
                  </p>
                  <p className="text-xs text-gray-400">Available</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pr-6 border-r border-gray-100 last:border-0">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                  <UtilityPole size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {post.floor || "Ground"} Floor
                  </p>
                  <p className="text-xs text-gray-400">Position</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pr-6 border-r border-gray-100 last:border-0">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                  <Store size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {post.parking || "None"} Parking
                  </p>
                  <p className="text-xs text-gray-400">Available</p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                About this Property
              </h2>
              <p className="text-gray-600 text-sm leading-7 mb-4 ">
                {post.content}
              </p>
            </div>

            {/* Amenities Grid */}
            {post.amenities?.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6">
                  {post.amenities.map((item, idx) => {
                    const Icon = amenityIcons[item] || Home;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Icon size={18} className="text-[#19545c]" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location Map Placeholder */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Location</h2>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${post.address}, ${post.city}, ${post.district}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#19545c] text-xs font-bold hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
              <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83"
                  className="w-full h-full object-cover opacity-80"
                  alt="Map Placeholder"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-[#19545c] p-3 rounded-full text-white shadow-lg">
                    <MapPin size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6 h-fit sticky top-24">
            {/* Price & Booking Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              {/* Price Header */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Rent Price
                </p>
                <div className="flex items-end gap-1 mb-3">
                  <h3 className="text-2xl font-bold text-[#19545c]">
                    NPR {post.price?.toLocaleString() || "0"}
                  </h3>
                  <span className="text-gray-400 text-sm mb-1">/ Mo</span>
                </div>
                <div className="flex gap-2">
                  <span className="bg-green-800 text-white text-[10px] font-semibold px-2 py-1 rounded">
                    {post.isAvailable ? "Available Now" : "Occupied"}
                  </span>
                  <span className="bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded">
                    No Broker Fee
                  </span>
                </div>
              </div>

              <hr className="border-gray-100 mb-6" />

              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Choose a start date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      onFocus={(e) => (e.target.type = "date")}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#19545c] transition-colors"
                    />
                    <Calendar
                      className="absolute right-4 top-3 text-gray-400 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="w-full bg-green-800 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold uppercase tracking-widest py-4 rounded-xl text-[11px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#19545c]/20"
                  >
                    {bookingLoading ? "Processing..." : "Confirm Booking"}{" "}
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={handlePayNow}
                    className="w-full bg-white border border-[#19545c]/30 text-[#19545c] hover:bg-[#19545c]/5 font-semibold uppercase tracking-widest py-3.5 rounded-xl text-[10px] flex items-center justify-center gap-2 transition-all"
                  >
                    Pay Booking Amount
                  </button>
                </div>

                {/* Host Profile Card */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                        {post.author?.name?.charAt(0) || "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                        <CheckCircle2
                          size={12}
                          className="text-green-500 fill-white"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        Hosted by {post.author?.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-37.5">
                        {post.author?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleChat}
                    className="text-gray-400 hover:text-[#19545c]"
                  >
                    <MessageSquare size={20} />
                  </button>
                </div>

                {/* <div className="flex gap-2">
                  <a 
                    href={post.author?.phone ? `tel:${post.author.phone}` : "#"}
                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone size={16} /> Call Landlord
                  </a>
                  <button 
                    onClick={handleChat}
                    className="bg-[#19545c]/10 text-[#19545c] w-12 rounded-xl flex items-center justify-center hover:bg-[#19545c]/20 transition-all"
                    title="Send Message"
                  >
                    <MessageSquare size={20} />
                  </button>
                </div> */}

                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 mt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    How it works
                  </p>
                  <ul className="space-y-2">
                    <li className="flex gap-2 items-start text-[11px] text-slate-500">
                      <div className="w-4 h-4 rounded-full bg-[#19545c] text-white flex items-center justify-center text-[8px] mt-0.5 shrink-0">
                        1
                      </div>
                      <span>Select your move-in or visit date.</span>
                    </li>
                    <li className="flex gap-2 items-start text-[11px] text-slate-500">
                      <div className="w-4 h-4 rounded-full bg-[#19545c] text-white flex items-center justify-center text-[8px] mt-0.5 shrink-0">
                        2
                      </div>
                      <span>Landlord receives your request instantly.</span>
                    </li>
                    <li className="flex gap-2 items-start text-[11px] text-slate-500">
                      <div className="w-4 h-4 rounded-full bg-[#19545c] text-white flex items-center justify-center text-[8px] mt-0.5 shrink-0">
                        3
                      </div>
                      <span>Once approved, you'll receive a notification!</span>
                    </li>
                    <li className="flex gap-2 items-start text-[11px] text-slate-500">
                      <div className="w-4 h-4 rounded-full bg-[#19545c] text-white flex items-center justify-center text-[8px] mt-0.5 shrink-0">
                        4
                      </div>
                      <span>Click on chat icon to chat landlord</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 RECOMMENDATIONS SECTION */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6">Similar Properties</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Link key={rec.id} to={`/posts/${rec.id}`}>
                  <div className="border rounded-xl p-4 hover:shadow-lg transition">
                    <img
                      src={rec.images?.[0]}
                      className="h-40 w-full object-cover rounded-lg mb-3"
                      alt={rec.title}
                    />
                    <h3 className="font-semibold">{rec.title}</h3>
                    <p className="text-sm text-gray-500">
                      {rec.city}, {rec.district}
                    </p>
                    <p className="text-[#19545c] font-bold">NPR {rec.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
  );
};

export default Detailpage;
