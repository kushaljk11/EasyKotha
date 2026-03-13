import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { FaCamera, FaCity, FaEnvelope, FaLock, FaMapMarkedAlt, FaSave, FaUser } from "react-icons/fa";
import LandlordLayout from "./LandlordLayout";

export default function Profile() {
  const { authUser, updateProfile } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", district: "", city: "", password: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!authUser) return;
    setForm({
      name: authUser.name || "",
      email: authUser.email || "",
      district: authUser.district || "",
      city: authUser.city || "",
      password: "",
    });
    setPreviewImage(authUser.profileImage || "");
  }, [authUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback({ type: "", text: "" });

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("district", form.district);
      payload.append("city", form.city);
      if (form.password.trim()) payload.append("password", form.password.trim());
      if (profileImage) payload.append("profileImage", profileImage);

      await updateProfile(payload);
      setFeedback({ type: "success", text: "Profile updated successfully." });
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <LandlordLayout searchPlaceholder="Search profile settings...">
      <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-green-800">
        <FaUser />
        My Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-slate-100 ring-2 ring-green-800/20">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-semibold text-green-800">
                    {(authUser?.name || "L").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  <FaCamera className="text-green-800" />
                  Update Profile Photo
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2 block text-sm" />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name" icon={FaUser}>
                <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
              </Field>
              <Field label="Email" icon={FaEnvelope}>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
              </Field>
              <Field label="District" icon={FaMapMarkedAlt}>
                <input name="district" value={form.district} onChange={handleChange} className={inputClass} />
              </Field>
              <Field label="City" icon={FaCity}>
                <input name="city" value={form.city} onChange={handleChange} className={inputClass} />
              </Field>
              <Field label="New Password (optional)" icon={FaLock}>
                <input type="password" name="password" value={form.password} onChange={handleChange} className={inputClass} />
              </Field>
            </div>

            {feedback.text && (
              <div className={`rounded-lg px-4 py-3 text-sm font-medium ${feedback.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {feedback.text}
              </div>
            )}

            <div className="flex justify-end">
              <button
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#154e54] disabled:opacity-60"
              >
                <FaSave />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
      </form>
    </LandlordLayout>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {Icon && <Icon className="text-green-800" />}
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20";