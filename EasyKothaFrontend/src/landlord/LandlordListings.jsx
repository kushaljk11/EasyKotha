import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaPlus,
  FaTag,
  FaSearch,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import LandlordLayout from "./LandlordLayout";

const statusStyle = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
};

const isLikelyImageUrl = (value) => /^https?:\/\//i.test(value);

const normalizeImageUrls = (images) => {
  if (!images) return [];

  const rawList = Array.isArray(images) ? images : [images];

  return rawList
    .flatMap((item) => String(item || "").split(/\r?\n|,/))
    .map((item) => item.trim())
    .filter((item) => item && isLikelyImageUrl(item));
};

export default function LandlordListings() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
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
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/posts/landlord");
      setPosts(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch landlord posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return posts;

    return posts.filter((post) => {
      const title = post.title?.toLowerCase() || "";
      const city = post.city?.toLowerCase() || "";
      const district = post.district?.toLowerCase() || "";
      return (
        title.includes(term) || city.includes(term) || district.includes(term)
      );
    });
  }, [posts, search]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this listing? This will remove related bookings too.",
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await axiosInstance.delete(`/deletepost/${id}`);
      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Failed to delete listing:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (post) => {
    setEditError("");
    setEditingPost(post);
    setEditForm({
      title: post.title || "",
      content: post.content || "",
      type: post.type || "room",
      purpose: post.purpose || "rent",
      furnishing: post.furnishing || "semi_furnished",
      tenantType: post.tenantType || "any",
      genderPreference: post.genderPreference || "any",
      price: post.price || "",
      district: post.district || "",
      city: post.city || "",
      address: post.address || "",
      imageUrls: normalizeImageUrls(post.images).length
        ? normalizeImageUrls(post.images)
        : [""],
    });
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingPost(null);
    setEditError("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateImageUrl = (index, value) => {
    setEditForm((prev) => {
      const nextUrls = [...prev.imageUrls];
      nextUrls[index] = value;
      return { ...prev, imageUrls: nextUrls };
    });
  };

  const addImageUrlField = () => {
    setEditForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
  };

  const removeImageUrlField = (index) => {
    setEditForm((prev) => {
      if (prev.imageUrls.length === 1) return { ...prev, imageUrls: [""] };
      return {
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      };
    });
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingPost) return;

    setSavingEdit(true);
    setEditError("");

    try {
      const images = editForm.imageUrls
        .map((item) => item.trim())
        .filter((item) => item && isLikelyImageUrl(item));
      const payload = {
        title: editForm.title,
        content: editForm.content,
        type: editForm.type,
        purpose: editForm.purpose,
        furnishing: editForm.furnishing,
        tenantType: editForm.tenantType,
        genderPreference: editForm.genderPreference,
        price: Number(editForm.price),
        district: editForm.district,
        city: editForm.city,
        address: editForm.address,
        images,
      };

      const res = await axiosInstance.put(
        `/updatepost/${editingPost.id}`,
        payload,
      );
      const updatedPost = res.data?.data;
      setPosts((prev) =>
        prev.map((item) =>
          item.id === editingPost.id
            ? { ...item, ...(updatedPost || payload), id: item.id }
            : item,
        ),
      );
      setEditingPost(null);
    } catch (error) {
      setEditError(
        error.response?.data?.message || "Failed to update listing.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <LandlordLayout searchPlaceholder="Search listings...">
      <div className="mb-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-green-800">
            My Listings
          </h2>
          <p className="mt-1 text-slate-600">
            Manage all listings that belong to your account.
          </p>
        </div>
        <Link
          to="/landlord/add-listing"
          className="inline-flex items-center gap-2 rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-[#154e54]"
        >
          <FaPlus />
          Add New Listing
        </Link>
      </div>

      <div className="relative w-full max-w-sm">
        <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search title, city, district"
          className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {loading && (
          <p className="text-sm text-slate-500">Loading listings...</p>
        )}

        {!loading && filteredPosts.length === 0 && (
          <p className="text-sm text-slate-500">No listings found.</p>
        )}

        {!loading &&
          filteredPosts.map((post) =>
            (() => {
              const imageUrls = normalizeImageUrls(post.images);
              const firstImage = imageUrls[0] || "";

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="aspect-video bg-slate-100">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
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

                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                        {post.title}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[post.status] || "bg-slate-100 text-slate-700"}`}
                      >
                        {post.status || "unknown"}
                      </span>
                    </div>
                    <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <FaMapMarkerAlt className="text-green-800" />
                      {post.city}, {post.district}
                    </p>
                    <p className="inline-flex items-center gap-2 text-lg font-bold text-green-800">
                      <FaTag className="text-base" />
                      NPR {Number(post.price || 0).toLocaleString()}
                    </p>
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {post.content || "No description available."}
                    </p>

                    <div className="flex justify-end">
                      <button
                        onClick={() => openEditModal(post)}
                        className="mr-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50"
                      >
                        <FaTrash />{" "}
                        {deletingId === post.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })(),
          )}
      </div>

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-green-800">Edit Listing</h3>
              <button
                onClick={closeEditModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className={inputClass}
                  placeholder="Title"
                  required
                />
                <input
                  name="price"
                  type="number"
                  value={editForm.price}
                  onChange={handleEditChange}
                  className={inputClass}
                  placeholder="Price"
                  required
                />
                <select
                  name="type"
                  value={editForm.type}
                  onChange={handleEditChange}
                  className={inputClass}
                >
                  <option value="room">Room</option>
                  <option value="flat">Flat</option>
                  <option value="house">House</option>
                  <option value="hostel">Hostel</option>
                  <option value="pg">PG</option>
                  <option value="shared_room">Shared Room</option>
                  <option value="office">Office</option>
                  <option value="others">Others</option>
                </select>
                <select
                  name="purpose"
                  value={editForm.purpose}
                  onChange={handleEditChange}
                  className={inputClass}
                >
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                </select>
                <select
                  name="furnishing"
                  value={editForm.furnishing}
                  onChange={handleEditChange}
                  className={inputClass}
                >
                  <option value="furnished">Furnished</option>
                  <option value="semi_furnished">Semi Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
                <select
                  name="tenantType"
                  value={editForm.tenantType}
                  onChange={handleEditChange}
                  className={inputClass}
                >
                  <option value="any">Any</option>
                  <option value="family">Family</option>
                  <option value="students">Students</option>
                  <option value="bachelor">Bachelor</option>
                  <option value="office">Office</option>
                </select>
                <select
                  name="genderPreference"
                  value={editForm.genderPreference}
                  onChange={handleEditChange}
                  className={inputClass}
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <input
                  name="district"
                  value={editForm.district}
                  onChange={handleEditChange}
                  className={inputClass}
                  placeholder="District"
                  required
                />
                <input
                  name="city"
                  value={editForm.city}
                  onChange={handleEditChange}
                  className={inputClass}
                  placeholder="City"
                  required
                />
                <input
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  className={inputClass}
                  placeholder="Address"
                />
              </div>

              <textarea
                name="content"
                value={editForm.content}
                onChange={handleEditChange}
                rows={4}
                className={inputClass}
                placeholder="Description"
                required
              />

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Image URLs
                </p>
                {editForm.imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(event) =>
                        updateImageUrl(index, event.target.value)
                      }
                      className={inputClass}
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrlField(index)}
                      className="rounded-lg border border-rose-300 px-3 text-rose-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageUrlField}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <FaPlus /> Add Image URL
                </button>
              </div>

              {editError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  disabled={savingEdit}
                  className="rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LandlordLayout>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20";
