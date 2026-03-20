import { useState } from "react";
import axiosInstance from "../api/axios";
import { FaFileAlt, FaImage, FaMapMarkerAlt, FaPlus, FaTag, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import LandlordLayout from "./LandlordLayout";

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
  district: "",
  city: "",
  address: "",
  imageUrls: [""],
};

export default function AddListing() {
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", text: "" });

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

              <Field label="District" required>
                <input name="district" value={form.district} onChange={handleChange} className={inputClass} placeholder="Kathmandu" />
              </Field>

              <Field label="City" required>
                <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="Kathmandu Metro" />
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