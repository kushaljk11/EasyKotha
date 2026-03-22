import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import axios from "../api/axios";
import { 
  FaUser, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaCity, 
  FaLock, 
  FaCamera, 
  FaEdit, 
  FaTimes, 
  FaCheck, 
  FaComments,
  FaArrowLeft
} from "react-icons/fa";

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser, updateProfile } = useAuthStore();
  const { setSelectedUser } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profileImage, setProfileImage] = useState("/sadmin.png");
  const [imageFile, setImageFile] = useState(null);
  const [displayedUser, setDisplayedUser] = useState(null);
  
  const isOwnProfile = !id || id === authUser?._id || id === authUser?.id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    district: "",
    city: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isOwnProfile) {
      if (authUser) {
        setDisplayedUser(authUser);
        setFormData({
          name: authUser.name || "",
          email: authUser.email || "",
          district: authUser.district || "",
          city: authUser.city || "",
          password: "",
          confirmPassword: "",
        });
        if (authUser.profileImage) {
          setProfileImage(authUser.profileImage);
        }
      }
    } else {
      // Fetch other user's profile
      const fetchUserProfile = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`/auth/users/${id}`);
          const userData = res.data.user;
          setDisplayedUser(userData);
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            district: userData.district || "",
            city: userData.city || "",
            password: "",
            confirmPassword: "",
          });
          if (userData.profileImage) {
            setProfileImage(userData.profileImage);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setMessage({ type: "error", text: "Failed to load profile" });
        } finally {
          setLoading(false);
        }
      };
      fetchUserProfile();
    }
  }, [id, authUser, isOwnProfile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validate passwords match if changing password
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }

    setLoading(true);

    try {
      // Use FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("district", formData.district || "");
      formDataToSend.append("city", formData.city || "");

      // Only include password if it's being changed
      if (formData.password) {
        formDataToSend.append("password", formData.password);
      }

      // Add image file if selected
      if (imageFile) {
        formDataToSend.append("profileImage", imageFile);
      }

      // Use updateProfile from useAuthStore
      await updateProfile(formDataToSend);

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      setImageFile(null);
      
      // Clear password fields
      setFormData({
        ...formData,
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

   
  const handleCancel = () => {
    setIsEditing(false);
    setMessage({ type: "", text: "" });
    if (authUser) {
      setFormData({
        name: authUser.name || "",
        email: authUser.email || "",
        district: authUser.district || "",
        city: authUser.city || "",
        password: "",
        confirmPassword: "",
      });
      setImageFile(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMessageUser = () => {
    if (!displayedUser) return;

    setSelectedUser({
      id: displayedUser.id ?? displayedUser._id,
      name: displayedUser.name,
      email: displayedUser.email,
      profileImage: displayedUser.profileImage,
    });

    navigate("/chat");
  };

  if (!authUser || (loading && !displayedUser)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-green-800 text-lg animate-pulse flex items-center gap-2 font-bold">
          <div className="w-3 h-3 bg-green-800 rounded-full"></div>
           Loading Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl font-semibold text-slate-900  flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              >
                <FaArrowLeft className="w-4 h-4" />
              </button>
              {isOwnProfile ? "My Profile" : `${displayedUser?.name || "User"}'s Profile`}
            </h1>
            <p className="text-slate-500 text-sm ml-12">
              {isOwnProfile ? "Your private account information and settings" : "Public profile details of this user"}
            </p>
          </div>

          <div className="flex gap-3">
          {isOwnProfile && !isEditing ? (
            <>
              <button
                onClick={() => navigate("/chat")}
                className="p-3 bg-green-800/5 text-green-800 rounded-xl hover:bg-green-800/10 transition-all shadow-sm border border-green-800/10"
                title="Messages"
              >
                <FaComments className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-green-800 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-green-700 transition-all shadow-lg shadow-green-800/20"
              >
                Edit Profile
              </button>
            </>
          ) : isEditing ? (
            <button
               onClick={handleCancel}
               className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={handleMessageUser}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-800 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all"
            >
              <FaComments /> Message User
            </button>
          )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left">
          <div className="p-6 md:p-10 space-y-10">
            {/* Profile Header section with Avatar */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-slate-100 ring-1 ring-slate-100">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isOwnProfile && isEditing && (
                  <label
                    htmlFor="profile-upload"
                    className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-xl border border-slate-100 cursor-pointer shadow-lg hover:bg-slate-50 transition-all text-green-800"
                  >
                    <FaCamera className="w-4 h-4" />
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="space-y-2 text-center md:text-left pt-2">
                <h2 className="text-3xl font-semibold text-slate-800">
                  {displayedUser?.name}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                    <FaUser className="text-green-800" /> {displayedUser?.role}
                  </span>
                  <span className="flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                    <FaMapMarkerAlt className="text-green-800" /> {displayedUser?.city || "Nepal"}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Alert */}
            {message.text && (
              <div
                className={`p-4 rounded-xl border ${
                  message.type === "success"
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "bg-red-50 border-red-200 text-red-600"
                } animate-in fade-in duration-300`}
              >
                <div className="flex items-center gap-3 text-sm font-bold">
                  {message.type === "success" ? (
                    <FaCheck className="w-4 h-4" />
                  ) : (
                    <FaTimes className="w-4 h-4" />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {/* Information Grid */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-green-800 uppercase tracking-widest pl-1">Full Name</label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-800/5 transition-all font-medium disabled:bg-slate-50 disabled:text-slate-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-green-800 uppercase tracking-widest pl-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing || isOwnProfile} // Can't edit email easily for security
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 outline-none font-medium disabled:cursor-not-allowed"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                {/* District */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-green-800 uppercase tracking-widest pl-1">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-800/5 transition-all font-medium disabled:bg-slate-50"
                    placeholder="e.g. Kathmandu"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-green-800 uppercase tracking-widest pl-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-800/5 transition-all font-medium disabled:bg-slate-50"
                    placeholder="e.g. Thamel"
                  />
                </div>

              <div className="md:col-span-2 pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-800/20 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all ml-auto"
                >
                  Reset Form
                </button>
              </div>
            </div>

            {/* Account Meta Information */}
          <div className="pt-10 border-t border-slate-100 space-y-6">
            <h3 className="text-xs font-semibold text-green-800 uppercase tracking-[0.2em]">Account Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-green-800/5 p-5 rounded-2xl border border-green-800/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Member Strategy</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{displayedUser?.status || "Active"}</span>
                </div>
              </div>

              <div className="bg-green-800/5 p-5 rounded-2xl border border-green-800/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Member Priority</p>
                <span className="text-sm font-bold text-slate-700 tracking-tight">
                  {displayedUser?.createdAt ? new Date(displayedUser.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Jan 18, 2026"}
                </span>
              </div>

              <div className="bg-green-800/5 p-5 rounded-2xl border border-green-800/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Platform Rank</p>
                <span className="px-3 py-1 bg-green-800 text-white rounded-lg text-[10px] font-semibold uppercase tracking-wider inline-block">
                  {displayedUser?.role || "Tenant"}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
);
};
