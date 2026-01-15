"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Hotel {
  id: string;
  name: string;
  stars: number;
  location: string;
  description?: string;
  images: string[];
  prices: Record<string, number>;
  amenities: string[];
  order: number;
}

export default function AdminHotelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    stars: 5,
    location: "",
    description: "",
    images: [] as string[],
    prices: {} as Record<string, number>,
    amenities: [] as string[],
    order: 0,
  });

  // Input helpers
  const [imageInput, setImageInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomPrice, setRoomPrice] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchHotels();
    }
  }, [status]);

  const fetchHotels = async () => {
    try {
      const response = await fetch("/api/hotels");
      const data = await response.json();
      setHotels(data.hotels || []);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      stars: 5,
      location: "",
      description: "",
      images: [],
      prices: {},
      amenities: [],
      order: 0,
    });
    setImageInput("");
    setAmenityInput("");
    setRoomType("");
    setRoomPrice("");
    setEditingHotel(null);
    setShowForm(false);
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      stars: hotel.stars,
      location: hotel.location,
      description: hotel.description || "",
      images: hotel.images,
      prices: hotel.prices,
      amenities: hotel.amenities,
      order: hotel.order,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = "/api/hotels";
      const method = editingHotel ? "PUT" : "POST";
      const body = editingHotel
        ? { ...formData, id: editingHotel.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchHotels();
        resetForm();
        alert(editingHotel ? "Hotel updated successfully!" : "Hotel created successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error submitting hotel:", error);
      alert("Failed to save hotel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const response = await fetch(`/api/hotels?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchHotels();
        alert("Hotel deleted successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting hotel:", error);
      alert("Failed to delete hotel");
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  const addRoomPrice = () => {
    if (roomType.trim() && roomPrice) {
      setFormData({
        ...formData,
        prices: { ...formData.prices, [roomType.trim()]: parseFloat(roomPrice) },
      });
      setRoomType("");
      setRoomPrice("");
    }
  };

  const removeRoomPrice = (key: string) => {
    const newPrices = { ...formData.prices };
    delete newPrices[key];
    setFormData({ ...formData, prices: newPrices });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🏨 Manage Hotels
            </h1>
            <p className="text-blue-100">Add and manage festival partner hotels</p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors"
          >
            ← Back to Admin
          </button>
        </div>

        {/* Add Hotel Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors mb-8"
          >
            ➕ Add New Hotel
          </button>
        )}

        {/* Hotel Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                {editingHotel ? "Edit Hotel" : "Add New Hotel"}
              </h2>
              <button
                onClick={resetForm}
                className="text-white hover:text-red-300 transition-colors"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                    placeholder="e.g., Grand Hotel Athens"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Stars *
                  </label>
                  <select
                    required
                    value={formData.stars}
                    onChange={(e) =>
                      setFormData({ ...formData, stars: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                  >
                    <option value={1}>⭐ 1 Star</option>
                    <option value={2}>⭐⭐ 2 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                  placeholder="e.g., Athens City Center, 2km from venue"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                  placeholder="Brief description of the hotel..."
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                  placeholder="0"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Room Images (URLs)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-white/10 p-3 rounded-lg"
                    >
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <span className="flex-1 text-white text-sm truncate">
                        {img}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="text-red-300 hover:text-red-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Prices */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Room Prices
                </label>
                <div className="grid md:grid-cols-3 gap-2 mb-3">
                  <input
                    type="text"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                    placeholder="Room type (e.g., Single)"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={roomPrice}
                    onChange={(e) => setRoomPrice(e.target.value)}
                    className="px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                    placeholder="Price (€)"
                  />
                  <button
                    type="button"
                    onClick={addRoomPrice}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                  >
                    Add Price
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.prices).map(([type, price]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between bg-white/10 p-3 rounded-lg"
                    >
                      <span className="text-white font-medium">{type}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-300 font-bold">€{price}</span>
                        <button
                          type="button"
                          onClick={() => removeRoomPrice(type)}
                          className="text-red-300 hover:text-red-100"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Amenities
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                    placeholder="e.g., Free WiFi, Pool, Gym"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2"
                    >
                      <span className="text-white">{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(idx)}
                        className="text-red-300 hover:text-red-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingHotel
                    ? "Update Hotel"
                    : "Create Hotel"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-red-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hotels List */}
        <div className="space-y-6">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-4 text-blue-100">
                    <span>{"⭐".repeat(hotel.stars)}</span>
                    <span>📍 {hotel.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(hotel)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hotel.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {hotel.description && (
                <p className="text-blue-100 mb-4">{hotel.description}</p>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-white font-semibold mb-2">
                    Images: {hotel.images.length}
                  </p>
                  <div className="flex gap-2 overflow-x-auto">
                    {hotel.images.slice(0, 3).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${hotel.name} ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold mb-2">
                    Room Types: {Object.keys(hotel.prices).length}
                  </p>
                  <div className="text-blue-100 text-sm">
                    {Object.keys(hotel.prices).join(", ") || "None"}
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold mb-2">
                    Amenities: {hotel.amenities.length}
                  </p>
                  <div className="text-blue-100 text-sm">
                    {hotel.amenities.slice(0, 3).join(", ")}
                    {hotel.amenities.length > 3 && "..."}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hotels.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-white text-xl">No hotels added yet.</p>
            <p className="text-blue-100 mt-2">Click "Add New Hotel" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
