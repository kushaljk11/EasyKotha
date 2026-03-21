import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { FaFileAlt, FaImage, FaMapMarkerAlt, FaPlus, FaTag, FaTrash } from "react-icons/fa";
import { ChevronDown, X } from "lucide-react";
import toast from "react-hot-toast";
import LandlordLayout from "./LandlordLayout";
import {
  getProvinces,
  getDistrictsByProvince,
  getMunicipalitySuggestions,
  isValidProvince,
  isValidDistrict,
  isValidMunicipality,
} from "../utils/locationUtils";

const allowedImageExtensions = ["jpg", "jpeg", "png", "webp", "svg"];

const defaultForm = {
  title: "",
  content: "",
  type: "room",
  purpose: "rent",
  furnishing: "semi_furnished",
  tenantType: "any",
  genderPreference: "any",
  price: "",
  province: "",
  district: "",
  city: "",
  address: "",
  imageUrls: [""],
};

export default function AddListing() {
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  
  // Location state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLocationsLoading(true);
        setLocationError("");
        const provinceList = await getProvinces();
        setProvinces(provinceList);
      } catch (error) {
        setLocationError(`Failed to load provinces: ${error.message}`);
        console.error("Error loading provinces:", error);
        toast.error("Failed to load location data. Please try again.");
      } finally {
        setLocationsLoading(false);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!form.province) {
        setDistricts([]);
        setForm(prev => ({ ...prev, district: "", city: "" }));
        setCitySuggestions([]);
        return;
      }

      try {
        setLocationsLoading(true);
        setLocationError("");
        const isValid = await isValidProvince(form.province);
        
        if (!isValid) {
          setLocationError("Selected province is invalid");
          setDistricts([]);
          return;
        }

        const districtList = await getDistrictsByProvince(form.province);
        setDistricts(districtList);
        // Reset dependent fields
        setForm(prev => ({ ...prev, district: "", city: "" }));
        setCitySuggestions([]);
      } catch (error) {
        setLocationError(`Failed to load districts: ${error.message}`);
        console.error("Error loading districts:", error);
      } finally {
        setLocationsLoading(false);
      }
    };

    loadDistricts();
  }, [form.province]);

  // Load city suggestions when district changes
  useEffect(() => {
    const loadCitySuggestions = async () => {
      if (!form.district) {
        setCitySuggestions([]);
        setForm(prev => ({ ...prev, city: "" }));
        return;
      }

      try {
        const isValid = await isValidDistrict(form.province, form.district);
        
        if (!isValid) {
          setLocationError("Selected district is invalid for this province");
          setCitySuggestions([]);
          return;
        }

        const suggestions = await getMunicipalitySuggestions(form.district, "", 15);
        setCitySuggestions(suggestions);
        // Reset city when district changes
        setForm(prev => ({ ...prev, city: "" }));
      } catch (error) {
        console.error("Error loading city suggestions:", error);
        setCitySuggestions([]);
      }
    };

    loadCitySuggestions();
  }, [form.district, form.province]);

  // Filter city suggestions when city input changes
  useEffect(() => {
    const filterCities = async () => {
      if (!form.city || !form.district) {
        return;
      }

      try {
        const filtered = await getMunicipalitySuggestions(form.district, form.city, 15);
        setCitySuggestions(filtered);
      } catch (error) {
        console.error("Error filtering city suggestions:", error);
      }
    };

    const debounceTimer = setTimeout(filterCities, 300);
    return () => clearTimeout(debounceTimer);
  }, [form.city, form.district]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCitySelect = (city) => {
    setForm(prev => ({ ...prev, city }));
    setShowCitySuggestions(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", text: "" });

    // Validate required location fields
    if (!form.province || !form.district || !form.city) {
      setFeedback({
        type: "error",
        text: "Province, District, and City are required.",
      });
      return;
    }

    // Validate locations against data
    try {
      const isValidProv = await isValidProvince(form.province);
      const isValidDist = await isValidDistrict(form.province, form.district);
      const isValidMun = await isValidMunicipality(form.district, form.city);

      if (!isValidProv) {
        setFeedback({ type: "error", text: "Selected province is invalid." });
        return;
      }

      if (!isValidDist) {
        setFeedback({ type: "error", text: "Selected district is not valid for this province." });
        return;
      }

      if (!isValidMun) {
        setFeedback({ type: "error", text: "Selected city/municipality is not valid for this district." });
        return;
      }
    } catch (error) {
      setFeedback({ type: "error", text: "Failed to validate location data." });
      console.error("Location validation error:", error);
      return;
    }

    setSubmitting(true);

    try {
      const images = form.imageUrls
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        title: form.title,
        content: form.content,
        type: form.type,
        purpose: form.purpose,
        furnishing: form.furnishing,
        tenantType: form.tenantType,
        genderPreference: form.genderPreference,
        price: Number(form.price),
        district: form.district,
        city: form.city,
        address: form.address,
        images,
      };

      await axiosInstance.post("/createpost", payload);
      setFeedback({ type: "success", text: "Listing submitted successfully and is now pending approval." });
      setForm(defaultForm);

      // User requested refresh after successful submission.
      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.response?.data?.message || "Failed to create listing. Please check your input.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateImageUrl = (index, value) => {
    setForm((prev) => {
      const nextUrls = [...prev.imageUrls];
      nextUrls[index] = value;
      return { ...prev, imageUrls: nextUrls };
    });
  };

  const addImageUrlField = () => {
    setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
  };

  const handleDeviceImagesChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const validFiles = [];

    selectedFiles.forEach((file) => {
      const extension = (file.name.split(".").pop() || "").toLowerCase();
      if (!allowedImageExtensions.includes(extension)) {
        toast.error("Image extension not supported");
        return;
      }
      validFiles.push(file);
    });

    if (!validFiles.length) {
      event.target.value = "";
      return;
    }

    try {
      const imageDataUrls = await Promise.all(
        validFiles.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ""));
              reader.onerror = () => reject(new Error("Failed to read image file"));
              reader.readAsDataURL(file);
            }),
        ),
      );

      setForm((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...imageDataUrls].filter(Boolean),
      }));
    } catch (error) {
      console.error("Failed to process device images:", error);
      toast.error("Failed to process selected images");
    } finally {
      event.target.value = "";
    }
  };

  const removeImageUrlField = (index) => {
    setForm((prev) => {
      if (prev.imageUrls.length === 1) return { ...prev, imageUrls: [""] };
      return {
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      };
    });
  };

  return (
    <LandlordLayout searchPlaceholder="Search listing templates...">
      <div className="mb-1">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-green-800">
          Create New Listing
        </h2>
        <p className="mt-1 text-slate-600">This form submits directly to your backend endpoint `/createpost`.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Feedback Messages */}
        {feedback.text && (
          <div
            className={`rounded-2xl p-4 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-green-50 text-green-800 border border-green-100"
                : "bg-red-50 text-red-800 border border-red-100"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {locationError && (
          <div className="rounded-2xl p-4 text-sm font-medium bg-orange-50 text-orange-800 border border-orange-100">
            {locationError}
          </div>
        )}

        {/* Selected Location Display (for debugging/clarity) */}
        {(form.province || form.district || form.city) && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs font-semibold text-blue-900 mb-2">Selected Location:</p>
            <div className="flex flex-wrap gap-2">
              {form.province && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  Province: {form.province}
                </span>
              )}
              {form.district && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  District: {form.district}
                </span>
              )}
              {form.city && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  City: {form.city}
                </span>
              )}
            </div>
          </div>
        )}
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title" required>
                <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Spacious 2BHK near bus park" />
              </Field>

              <Field label="Price (NPR)" required>
                <input name="price" type="number" value={form.price} onChange={handleChange} className={inputClass} placeholder="25000" />
              </Field>

              <Field label="Type" required>
                <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                  <option value="room">Room</option>
                  <option value="flat">Flat</option>
                  <option value="house">House</option>
                  <option value="hostel">Hostel</option>
                  <option value="pg">PG</option>
                  <option value="shared_room">Shared Room</option>
                  <option value="office">Office</option>
                  <option value="others">Others</option>
                </select>
              </Field>

              <Field label="Purpose" required>
                <select name="purpose" value={form.purpose} onChange={handleChange} className={inputClass}>
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                </select>
              </Field>

              <Field label="Furnishing">
                <select name="furnishing" value={form.furnishing} onChange={handleChange} className={inputClass}>
                  <option value="furnished">Furnished</option>
                  <option value="semi_furnished">Semi Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </Field>

              <Field label="Tenant Type">
                <select name="tenantType" value={form.tenantType} onChange={handleChange} className={inputClass}>
                  <option value="any">Any</option>
                  <option value="family">Family</option>
                  <option value="students">Students</option>
                  <option value="bachelor">Bachelor</option>
                  <option value="office">Office</option>
                </select>
              </Field>

              <Field label="Gender Preference">
                <select name="genderPreference" value={form.genderPreference} onChange={handleChange} className={inputClass}>
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>

              <Field label="Province" required>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  disabled={locationsLoading}
                  className={`${inputClass} ${form.province ? "bg-white" : "bg-gray-50"}`}
                >
                  <option value="">Select a Province</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="District" required>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  disabled={!form.province || locationsLoading}
                  className={`${inputClass} ${form.district ? "bg-white" : "bg-gray-50"}`}
                >
                  <option value="">
                    {!form.province ? "Select a Province first" : "Select a District"}
                  </option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="City / Municipality" required>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    onFocus={() => form.district && setShowCitySuggestions(true)}
                    disabled={!form.district || locationsLoading}
                    placeholder={!form.district ? "Select a District first" : "Type to search or select..."}
                    className={`${inputClass} ${
                      !form.district ? "cursor-not-allowed bg-gray-50" : ""
                    }`}
                  />
                  
                  {showCitySuggestions && form.district && citySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {citySuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCitySelect(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-green-50 border-b border-gray-100 last:border-b-0 text-sm font-medium text-gray-700 hover:text-green-800 transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {showCitySuggestions && form.district && form.city && citySuggestions.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                      <p className="text-sm text-gray-500 text-center">No matching cities found</p>
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Address" required>
                <div className="relative">
                  <FaMapMarkerAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="address" value={form.address} onChange={handleChange} className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20" placeholder="Street / Tole / Landmark" />
                </div>
              </Field>
            </div>

            <Field label="Description" required icon={FaTag}>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={5}
                className={inputClass}
                placeholder="Mention room size, parking, water, internet, and nearby facilities."
              />
            </Field>

            <Field label="Image URLs" icon={FaImage}>
              <div className="space-y-3">
                <div className="rounded-lg border border-dashed border-green-800/25 bg-green-50/40 p-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-green-800 px-3 py-2 text-sm font-semibold text-white hover:bg-[#154e54]">
                    <FaImage /> Upload From Device
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.svg"
                      multiple
                      onChange={handleDeviceImagesChange}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-xs text-slate-600">
                    Supported: jpg, jpeg, png, webp, svg.
                  </p>
                </div>

                {form.imageUrls.map((url, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        className={inputClass}
                        placeholder={`https://example.com/image-${index + 1}.jpg`}
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrlField(index)}
                        className="rounded-lg border border-rose-200 px-3 text-rose-700 hover:bg-rose-50"
                        title="Remove URL"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {url.trim() && (
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-28 w-full rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addImageUrlField}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-800/20 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-800/10"
                >
                  <FaPlus /> Add Another Image URL
                </button>

                <p className="text-xs text-slate-500">
                  Add direct image links or upload from your device. Empty fields are ignored on submit.
                </p>
              </div>
            </Field>

            {feedback.text && (
              <div className={`rounded-lg px-4 py-3 text-sm font-medium ${feedback.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {feedback.text}
              </div>
            )}

            <div className="flex justify-end">
              <button
                disabled={submitting}
                className="rounded-lg bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#154e54] disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Listing"}
              </button>
            </div>
      </form>
    </LandlordLayout>
  );
}

function Field({ label, required, children, icon: Icon }) {
  return (
    <label className="block space-y-1.5">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {Icon && <Icon className="text-green-800" />}
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20";