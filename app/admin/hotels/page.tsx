"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Hotel {
  id: string;
  name: string;
  logo?: string;
  stars: number;
  location: string;
  description?: string;
  images: string[];
  prices: Record<string, { price: number; additionalInfo?: string }>;
  amenities: string[];
  breakfastIncluded: boolean;
  cityTax?: number;
  order: number;
}

interface HotelBooking {
  id: string;
  hotelId: string;
  hotelName: string;
  roomType: string;
  guestNames: string[];
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  specialRequests?: string;
  status: string;
  createdAt: string;
}

export default function AdminHotelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeView, setActiveView] = useState<"hotels" | "bookings">("hotels");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    stars: 5,
    location: "",
    description: "",
    images: [] as string[],
    prices: {} as Record<string, { price: number; additionalInfo?: string }>,
    amenities: [] as string[],
    breakfastIncluded: false,
    cityTax: undefined as number | undefined,
    order: 0,
  });

  // Input helpers
  const [imageInput, setImageInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomPrice, setRoomPrice] = useState("");
  const [roomAdditionalInfo, setRoomAdditionalInfo] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchHotels();
      fetchBookings();
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

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/hotel-bookings");
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/hotel-bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });

      if (response.ok) {
        await fetchBookings();
        alert("Booking status updated!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking status");
    }
  };

  const sendConfirmationEmail = async (bookingId: string) => {
    if (!confirm("Send confirmation email to the guest?")) return;

    try {
      const response = await fetch(`/api/hotel-bookings/${bookingId}/confirm`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchBookings();
        alert("Confirmation email sent successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error sending confirmation:", error);
      alert("Failed to send confirmation email");
    }
  };

  const handleDeleteBooking = async (bookingId: string, guestName: string, hotelName: string) => {
    // First confirmation
    if (!confirm(`Are you sure you want to delete the booking for ${guestName} at ${hotelName}?\n\nThis action cannot be undone!`)) {
      return;
    }

    // Second confirmation
    if (!confirm(`⚠️ FINAL CONFIRMATION ⚠️\n\nYou are about to permanently delete this booking request.\n\nThis will remove all booking data. Are you absolutely sure?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/hotel-bookings?id=${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Booking deleted successfully");
        await fetchBookings();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to delete booking"}`);
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      stars: 5,
      location: "",
      description: "",
      images: [],
      prices: {},
      amenities: [],
      breakfastIncluded: false,
      cityTax: undefined,
      order: 0,
    });
    setImageInput("");
    setAmenityInput("");
    setRoomType("");
    setRoomPrice("");
    setRoomAdditionalInfo("");
    setEditingHotel(null);
    setShowForm(false);
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      logo: hotel.logo || "",
      stars: hotel.stars,
      location: hotel.location,
      description: hotel.description || "",
      images: hotel.images,
      prices: hotel.prices,
      amenities: hotel.amenities,
      breakfastIncluded: hotel.breakfastIncluded || false,
      cityTax: hotel.cityTax,
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

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.urls?.[0] || data.url;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleFilesUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.urls || [];
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleFileUpload(file);
      if (url) {
        setFormData({ ...formData, logo: url });
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const urls = await handleMultipleFilesUpload(files);
      if (urls.length > 0) {
        setFormData({
          ...formData,
          images: [...formData.images, ...urls],
        });
      }
    }
    // Reset the input
    e.target.value = '';
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
        prices: { 
          ...formData.prices, 
          [roomType.trim()]: { 
            price: parseFloat(roomPrice),
            additionalInfo: roomAdditionalInfo.trim() || undefined
          }
        },
      });
      setRoomType("");
      setRoomPrice("");
      setRoomAdditionalInfo("");
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
              🏨 Manage Hotels & Bookings
            </h1>
            <p className="text-blue-100">Add and manage festival partner hotels and booking requests</p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors"
          >
            ← Back to Admin
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveView("hotels")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeView === "hotels"
                ? "bg-white text-blue-900"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            🏨 Hotels ({hotels.length})
          </button>
          <button
            onClick={() => setActiveView("bookings")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeView === "bookings"
                ? "bg-white text-blue-900"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            📅 Booking Requests ({bookings.length})
          </button>
        </div>

        {/* Hotels View */}
        {activeView === "hotels" && (
          <>
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
              {/* Hotel Logo */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Hotel Logo
                </label>
                <div className="flex items-center gap-4">
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Hotel logo"
                      className="w-20 h-20 object-contain rounded bg-white/10 p-2"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    />
                    {uploading && <p className="text-blue-200 text-sm mt-2">Uploading...</p>}
                  </div>
                </div>
              </div>

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
                  Location (Google Maps Embed URL) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mt-2">
                  <p className="text-yellow-100 text-sm font-semibold mb-1">⚠️ Important: Use Embed URL, not regular Google Maps link!</p>
                  <p className="text-blue-200 text-sm">
                    1. Go to <a href="https://www.google.com/maps" target="_blank" className="underline">Google Maps</a><br/>
                    2. Search for the hotel location<br/>
                    3. Click <strong>Share</strong> → <strong>Embed a map</strong><br/>
                    4. Copy the <strong>src</strong> URL from the iframe code<br/>
                    5. Should start with: https://www.google.com/maps/embed?pb=...
                  </p>
                </div>
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
                  Room Images
                </label>
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600"
                  />
                  <p className="text-blue-200 text-sm mt-2">
                    💡 You can select multiple images at once
                  </p>
                  {uploading && <p className="text-yellow-200 text-sm mt-2 animate-pulse">Uploading images...</p>}
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
                <div className="space-y-2 mb-3">
                  <div className="grid md:grid-cols-3 gap-2">
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                    >
                      <option value="" className="bg-blue-900">Select room type</option>
                      <option value="Single Room" className="bg-blue-900">Single Room</option>
                      <option value="Double Room" className="bg-blue-900">Double Room</option>
                      <option value="Triple Room" className="bg-blue-900">Triple Room</option>
                      <option value="Quadruple Room" className="bg-blue-900">Quadruple Room</option>
                    </select>
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
                  <input
                    type="text"
                    value={roomAdditionalInfo}
                    onChange={(e) => setRoomAdditionalInfo(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                    placeholder="Additional info (optional, e.g., 'with balcony', 'city view')"
                  />
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.prices).map(([type, priceData]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between bg-white/10 p-3 rounded-lg"
                    >
                      <div>
                        <span className="text-white font-medium">{type}</span>
                        {priceData.additionalInfo && (
                          <p className="text-blue-200 text-sm">{priceData.additionalInfo}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-300 font-bold">€{priceData.price}</span>
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

              {/* Breakfast Included */}
              <div>
                <label className="flex items-center gap-3 text-white font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.breakfastIncluded}
                    onChange={(e) =>
                      setFormData({ ...formData, breakfastIncluded: e.target.checked })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span>🍳 Breakfast Included in Room Price</span>
                </label>
              </div>

              {/* City Tax */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  City Tax (per night per room)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cityTax || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cityTax: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                  placeholder="e.g., 3.50"
                />
                <p className="text-blue-200 text-sm mt-2">
                  💡 Optional: City tax charged separately per night per room
                </p>
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
          </>
        )}

        {/* Bookings View */}
        {activeView === "bookings" && (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-white/10 rounded-2xl border border-white/20">
                <p className="text-white text-xl">No booking requests yet.</p>
                <p className="text-blue-100 mt-2">Bookings will appear here when guests submit requests.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {booking.hotelName}
                      </h3>
                      <p className="text-blue-100">{booking.roomType}</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-500 text-white"
                            : booking.status === "cancelled"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-white"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {booking.status === "pending" && (
                        <button
                          onClick={() => sendConfirmationEmail(booking.id)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          📧 Send Confirmation
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBooking(
                          booking.id,
                          booking.guestNames[0] || "Guest",
                          booking.hotelName
                        )}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-blue-200 text-sm mb-1">Guest{booking.guestNames.length > 1 ? 's' : ''}</p>
                      {booking.guestNames.map((name, idx) => (
                        <p key={idx} className="text-white font-semibold">
                          {booking.guestNames.length > 1 && `${idx + 1}. `}{name}
                        </p>
                      ))}
                      <p className="text-blue-100 text-sm mt-2">
                        <a href={`mailto:${booking.email}`} className="hover:underline">
                          📧 {booking.email}
                        </a>
                      </p>
                      <p className="text-blue-100 text-sm">
                        <a href={`tel:${booking.phone}`} className="hover:underline">
                          📞 {booking.phone}
                        </a>
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-blue-200 text-sm mb-1">Stay Details</p>
                      <p className="text-white font-semibold">
                        {new Date(booking.checkIn).toLocaleDateString()} →{" "}
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                      <p className="text-blue-100 text-sm mt-2">
                        {Math.ceil(
                          (new Date(booking.checkOut).getTime() -
                            new Date(booking.checkIn).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        nights
                      </p>
                      <p className="text-blue-100 text-sm">
                        {booking.guestNames.length} guest{booking.guestNames.length > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-blue-200 text-sm mb-1">Booking Info</p>
                      <p className="text-white text-sm">
                        Submitted: {new Date(booking.createdAt).toLocaleString()}
                      </p>
                      <p className="text-blue-100 text-sm mt-2">
                        ID: {booking.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-blue-200 text-sm mb-2">Special Requests:</p>
                      <p className="text-white text-sm">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
