"use client";

import { useState, useEffect, useMemo } from "react";
import Navigation from "../components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Hotel {
  id: string;
  name: string;
  logo?: string;
  stars: number;
  location: string;
  description?: string;
  images: string[];
  prices: Record<string, { price: number; additionalInfo?: string }>;
  roomOrder: string[];
  amenities: string[];
  breakfastIncluded: boolean;
  cityTax?: number;
  order: number;
}

interface BookingFormData {
  hotelId: string;
  hotelName: string;
  roomType: string;
  guestNames: string[];
  email: string;
  countryCode: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  specialRequests: string;
}

export default function HotelPage() {
  const { t } = useLanguage();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState<string | null>(null);
  const [submittingHotels, setSubmittingHotels] = useState<Record<string, boolean>>({});
  const [bookingSuccessHotels, setBookingSuccessHotels] = useState<Record<string, boolean>>({});
  const [bookingError, setBookingError] = useState("");
  
  const [bookingForms, setBookingForms] = useState<Record<string, BookingFormData>>({});

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch("/api/hotels");
      const data = await response.json();
      const fetchedHotels = data.hotels || [];
      setHotels(fetchedHotels);
      
      // Initialize active tab for each hotel
      const initialTabs: Record<string, string> = {};
      fetchedHotels.forEach((hotel: Hotel) => {
        initialTabs[hotel.id] = "gallery";
      });
      setActiveTab(initialTabs);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (count: number) => {
    return "⭐".repeat(count);
  };

  const setHotelTab = (hotelId: string, tab: string) => {
    setActiveTab((prev) => ({ ...prev, [hotelId]: tab }));    
    // If switching to booking tab and form doesn't exist, initialize it
    if (tab === "booking" && !bookingForms[hotelId]) {
      const hotel = hotels.find(h => h.id === hotelId);
      if (hotel) {
        openBookingForm(hotel);
      }
    }  };

  const getAvailableTabs = (hotel: Hotel) => {
    const tabs = ["gallery", "info"];
    if (hotel.amenities && hotel.amenities.length > 0) {
      tabs.push("amenities");
    }
    tabs.push("prices");
    tabs.push("booking");
    return tabs;
  };

  const openBookingForm = (hotel: Hotel, roomType?: string) => {
    const roomTypes = hotel.roomOrder && hotel.roomOrder.length > 0 ? hotel.roomOrder : Object.keys(hotel.prices);
    const selectedRoomType = roomType || "";
    const guestCount = selectedRoomType ? getGuestCount(selectedRoomType) : 1;
    
    setBookingForms(prev => ({
      ...prev,
      [hotel.id]: {
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomType: selectedRoomType,
        guestNames: Array(guestCount).fill(""),
        email: "",
        countryCode: "+30",
        phone: "",
        checkIn: "",
        checkOut: "",
        specialRequests: "",
      }
    }));
    setShowBookingForm(hotel.id);
    // Don't call setHotelTab here - it's already called by the caller
    setBookingSuccessHotels(prev => ({ ...prev, [hotel.id]: false }));
    setBookingError("");
  };

  const getGuestCount = (roomType: string): number => {
    const type = roomType.toLowerCase();
    if (type.includes("single")) return 1;
    if (type.includes("double")) return 2;
    if (type.includes("triple")) return 3;
    if (type.includes("quadruple")) return 4;
    return 1; // default
  };

  const getBookingForm = (hotelId: string): BookingFormData => {
    return bookingForms[hotelId] || {
      hotelId: "",
      hotelName: "",
      roomType: "",
      guestNames: [""],
      email: "",
      countryCode: "+30",
      phone: "",
      checkIn: "",
      checkOut: "",
      specialRequests: "",
    };
  };

  const updateBookingForm = (hotelId: string, updates: Partial<BookingFormData>) => {
    setBookingForms(prev => ({
      ...prev,
      [hotelId]: { ...getBookingForm(hotelId), ...updates }
    }));
  };

  const calculatePrice = (hotel: Hotel, bookingForm: BookingFormData) => {
    if (!bookingForm.roomType || !bookingForm.checkIn || !bookingForm.checkOut) {
      return { nights: 0, roomPrice: 0, totalRoomCost: 0, cityTax: 0, grandTotal: 0 };
    }

    const checkIn = new Date(bookingForm.checkIn);
    const checkOut = new Date(bookingForm.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const roomPrice = hotel.prices[bookingForm.roomType]?.price || 0;
    const totalRoomCost = roomPrice * nights;
    const cityTax = (hotel.cityTax || 0) * nights;
    const grandTotal = totalRoomCost + cityTax;

    return { nights, roomPrice, totalRoomCost, cityTax, grandTotal };
  };

  const handleBookingSubmit = async (e: React.FormEvent, hotelId: string) => {
    e.preventDefault();
    setSubmittingHotels(prev => ({ ...prev, [hotelId]: true }));
    setBookingError("");

    const bookingForm = bookingForms[hotelId];
    if (!bookingForm) {
      setSubmittingHotels(prev => ({ ...prev, [hotelId]: false }));
      setBookingError("Booking form not found");
      return;
    }

    // Client-side validation
    if (!bookingForm.roomType) {
      setSubmittingHotels(prev => ({ ...prev, [hotelId]: false }));
      setBookingError("Please select a room type");
      return;
    }

    if (!bookingForm.guestNames || bookingForm.guestNames.length === 0 || bookingForm.guestNames.some(name => !name || name.trim() === "")) {
      setSubmittingHotels(prev => ({ ...prev, [hotelId]: false }));
      setBookingError("Please fill in all guest names");
      return;
    }

    if (!bookingForm.email) {
      setSubmittingHotels(prev => ({ ...prev, [hotelId]: false }));
      setBookingError("Please enter your email");
      return;
    }

    if (!bookingForm.phone) {
      setSubmittingHotels(prev => ({ ...prev, [hotelId]: false }));
      setBookingError("Please enter your phone number");
      return;
    }

    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      setSubmittingHotels(prev => ({ ...prev, [hotelId]: false }));
      setBookingError("Please select check-in and check-out dates");
      return;
    }

    try {
      // Combine country code with phone number
      const fullPhone = bookingForm.countryCode + bookingForm.phone;
      const submitData = { ...bookingForm, phone: fullPhone };
      delete (submitData as any).countryCode;
      
      console.log("Submitting booking data:", JSON.stringify(submitData, null, 2));
      
      const response = await fetch("/api/hotel-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log("API Response:", { ok: response.ok, status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit booking");
      }

      console.log("Setting bookingSuccess to true for hotel:", hotelId);
      setBookingSuccessHotels(prev => ({ ...prev, [hotelId]: true }));
      console.log("Booking success set, showBookingForm:", showBookingForm);
      // Don't reset the form here - keep it so the success message can reference the hotel
    } catch (error: any) {
      console.error("Booking submission error:", error);
      setBookingError(error.message || "Failed to submit booking");
    } finally {
      setSubmittingHotels(prev => ({ ...prev, [hotelId]: false }));
      console.log("=== BOOKING FORM SUBMIT END ===");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-2xl">Loading hotels...</div>
        </div>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              🏨 {t.hotel.title}
            </h1>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🏨</div>
              <p className="text-2xl text-white font-semibold mb-4">
                {t.hotel.noHotels}
              </p>
              <p className="text-blue-100">
                {t.hotel.noHotelsDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🏨 {t.hotel.title}
          </h1>
          <p className="text-lg text-blue-100">
            {t.hotel.subtitle}
          </p>
        </div>

        {/* Hotel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {hotels.map((hotel) => {
            // Only get booking form if it exists to avoid creating new objects
            const currentBookingForm = bookingForms[hotel.id];
            const isSubmitting = submittingHotels[hotel.id] || false;
            const isSuccess = bookingSuccessHotels[hotel.id] || false;
            
            return (
            <div
              key={hotel.id}
              className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              {/* Hotel Header - Compact */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center gap-3 mb-2">
                  {hotel.logo && (
                    <img
                      src={hotel.logo}
                      alt={`${hotel.name} logo`}
                      className="w-12 h-12 object-contain bg-white/10 rounded-lg p-1"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {hotel.name}
                    </h2>
                    <div className="text-lg">{renderStars(hotel.stars)}</div>
                  </div>
                </div>
                {hotel.description && (
                  <p className="text-blue-100 text-sm line-clamp-2">
                    {hotel.description}
                  </p>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/20 bg-white/5 overflow-x-auto">
                {getAvailableTabs(hotel).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHotelTab(hotel.id, tab)}
                    className={`flex-1 py-3 px-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      activeTab[hotel.id] === tab
                        ? "bg-white/20 text-white border-b-2 border-white"
                        : "text-blue-200 hover:bg-white/10"
                    }`}
                  >
                    {tab === "info" && "📍 Info"}
                    {tab === "gallery" && "🖼️ Gallery"}
                    {tab === "amenities" && "✨ Amenities"}
                    {tab === "prices" && "💰 Prices"}
                    {tab === "booking" && "📅 Book"}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 min-h-[300px]">
                {/* Gallery Tab */}
                {activeTab[hotel.id] === "gallery" && (
                  <div>
                    {hotel.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {hotel.images.map((image, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedImage(image)}
                            className="relative h-32 rounded-lg overflow-hidden group cursor-pointer"
                          >
                            <img
                              src={image}
                              alt={`${hotel.name} - Image ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                              <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-blue-200 text-center py-8">
                        No images available
                      </p>
                    )}
                  </div>
                )}

                {/* Info Tab */}
                {activeTab[hotel.id] === "info" && (
                  <div className="h-full">
                    <h3 className="text-lg font-bold text-white mb-3">
                      📍 Location
                    </h3>
                    {hotel.location && hotel.location.includes('google.com/maps/embed') ? (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={hotel.location}
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                      </div>
                    ) : (
                      <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                        <p className="text-red-100 text-sm mb-2">⚠️ Invalid Google Maps embed URL</p>
                        <p className="text-blue-200 text-xs">The admin needs to update this with a proper Google Maps embed link.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Amenities Tab */}
                {activeTab[hotel.id] === "amenities" && (
                  <div>
                    {hotel.amenities.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {hotel.amenities.map((amenity, idx) => (
                          <div
                            key={idx}
                            className="bg-white/10 rounded-lg p-2 text-center"
                          >
                            <p className="text-white text-sm">{amenity}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-blue-200 text-center py-8">
                        No amenities listed
                      </p>
                    )}
                  </div>
                )}

                {/* Prices Tab */}
                {activeTab[hotel.id] === "prices" && (
                  <div>
                    {hotel.breakfastIncluded && (
                      <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 mb-4">
                        <p className="text-green-100 font-semibold">🍳 Breakfast Included</p>
                      </div>
                    )}
                    
                    {Object.keys(hotel.prices).length > 0 ? (
                      <div className="space-y-3">
                        {(hotel.roomOrder && hotel.roomOrder.length > 0 ? hotel.roomOrder : Object.keys(hotel.prices))
                          .filter(roomType => hotel.prices[roomType])
                          .map((roomType) => {
                          const priceData = hotel.prices[roomType];
                          return (
                            <div
                              key={roomType}
                              className="bg-gradient-to-br from-white/20 to-white/10 rounded-lg p-3 border border-white/30"
                            >
                              <h4 className="text-white font-semibold mb-1">
                                {roomType}
                              </h4>
                              {priceData.additionalInfo && (
                                <p className="text-blue-200 text-sm mb-2">{priceData.additionalInfo}</p>
                              )}
                              <p className="text-2xl font-bold text-yellow-300">
                                €{priceData.price}
                                <span className="text-sm text-blue-100 ml-1">
                                  /night
                                </span>
                              </p>
                              <button
                                onClick={() => {
                                  openBookingForm(hotel, roomType);
                                  setHotelTab(hotel.id, "booking");
                                }}
                                className="mt-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all text-sm"
                              >
                                Book This Room
                              </button>
                            </div>
                          );
                        })}
                        
                        {hotel.cityTax && (
                          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 mt-4">
                            <p className="text-yellow-100 text-sm">
                              <span className="font-semibold">🏦 City Tax:</span> €{hotel.cityTax} per night per room
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-blue-200 text-center py-8">
                        No prices available
                      </p>
                    )}
                  </div>
                )}

                {/* Booking Tab */}
                {activeTab[hotel.id] === "booking" && (
                  <div>
                    {isSuccess && showBookingForm === hotel.id ? (
                      <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-6 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h3 className="text-xl font-bold text-white mb-2">Booking Request Sent!</h3>
                        <p className="text-green-100 mb-4">
                          Booking request sent to your email. We will contact you soon with confirmation details.
                        </p>
                        <button
                          onClick={() => {
                            setBookingSuccessHotels(prev => ({ ...prev, [hotel.id]: false }));
                            setShowBookingForm(null);
                            setHotelTab(hotel.id, "gallery");
                            // Reset form when closing success message
                            setBookingForms(prev => {
                              const newForms = { ...prev };
                              delete newForms[hotel.id];
                              return newForms;
                            });
                          }}
                          className="bg-white text-blue-900 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-all"
                        >
                          Close
                        </button>
                      </div>
                    ) : currentBookingForm ? (
                      <form onSubmit={(e) => handleBookingSubmit(e, hotel.id)} className="space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4">📅 Book Your Stay</h3>
                        
                        {bookingError && (
                          <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 text-red-100 text-sm">
                            ⚠️ {bookingError}
                          </div>
                        )}

                        {/* Room Type Selection */}
                        <div>
                          <label className="block text-white font-semibold mb-2 text-sm">Room Type</label>
                          <select
                            value={currentBookingForm.roomType}
                            onChange={(e) => {
                              const newRoomType = e.target.value;
                              const guestCount = getGuestCount(newRoomType);
                              updateBookingForm(hotel.id, {
                                roomType: newRoomType,
                                guestNames: Array(guestCount).fill("").map((_, i) => currentBookingForm.guestNames[i] || "")
                              });
                            }}
                            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                          >
                            <option value="">Select a room type</option>
                            {(hotel.roomOrder && hotel.roomOrder.length > 0 ? hotel.roomOrder : Object.keys(hotel.prices))
                              .filter(roomType => hotel.prices[roomType])
                              .map((roomType) => (
                              <option key={roomType} value={roomType} className="bg-blue-900">
                                {roomType} - €{hotel.prices[roomType].price}/night
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Guest Names - Dynamic based on room type */}
                        {currentBookingForm.guestNames.map((name, index) => (
                          <div key={index}>
                            <label className="block text-white font-semibold mb-2 text-sm">
                              Guest {index + 1} Full Name
                            </label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => {
                                const newNames = [...currentBookingForm.guestNames];
                                newNames[index] = e.target.value;
                                updateBookingForm(hotel.id, { guestNames: newNames });
                              }}
                              placeholder="Enter full name"
                              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              required
                            />
                          </div>
                        ))}

                        <div>
                          <label className="block text-white font-semibold mb-2 text-sm">Email</label>
                          <input
                            type="email"
                            value={currentBookingForm.email}
                            onChange={(e) => updateBookingForm(hotel.id, { email: e.target.value })}
                            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-white font-semibold mb-2 text-sm">Phone Number</label>
                          <div className="flex gap-2">
                            <select
                              value={currentBookingForm.countryCode}
                              onChange={(e) => updateBookingForm(hotel.id, { countryCode: e.target.value })}
                              className="bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-24"
                              required
                            >
                              <option value="+30" className="bg-blue-900">🇬🇷 +30</option>
                              <option value="+1" className="bg-blue-900">🇺🇸 +1</option>
                              <option value="+44" className="bg-blue-900">🇬🇧 +44</option>
                              <option value="+49" className="bg-blue-900">🇩🇪 +49</option>
                              <option value="+33" className="bg-blue-900">🇫🇷 +33</option>
                              <option value="+39" className="bg-blue-900">🇮🇹 +39</option>
                              <option value="+34" className="bg-blue-900">🇪🇸 +34</option>
                              <option value="+31" className="bg-blue-900">🇳🇱 +31</option>
                              <option value="+41" className="bg-blue-900">🇨🇭 +41</option>
                              <option value="+43" className="bg-blue-900">🇦🇹 +43</option>
                            </select>
                            <input
                              type="tel"
                              value={currentBookingForm.phone}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                updateBookingForm(hotel.id, { phone: value });
                              }}
                              placeholder="6912345678"
                              className="flex-1 bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              required
                            />
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-white font-semibold mb-2 text-sm">Check-in</label>
                            <input
                              type="date"
                              value={currentBookingForm.checkIn}
                              onChange={(e) => updateBookingForm(hotel.id, { checkIn: e.target.value })}
                              onFocus={(e) => {
                                try {
                                  e.target.showPicker?.();
                                } catch (err) {
                                  // Ignore if showPicker is not supported
                                }
                              }}
                              onClick={(e) => {
                                try {
                                  (e.target as HTMLInputElement).showPicker?.();
                                } catch (err) {
                                  // Ignore if showPicker is not supported
                                }
                              }}
                              min="2026-06-10"
                              max="2026-06-17"
                              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-white font-semibold mb-2 text-sm">Check-out</label>
                            <input
                              type="date"
                              value={currentBookingForm.checkOut}
                              onChange={(e) => updateBookingForm(hotel.id, { checkOut: e.target.value })}
                              onFocus={(e) => {
                                try {
                                  e.target.showPicker?.();
                                } catch (err) {
                                  // Ignore if showPicker is not supported
                                }
                              }}
                              onClick={(e) => {
                                try {
                                  (e.target as HTMLInputElement).showPicker?.();
                                } catch (err) {
                                  // Ignore if showPicker is not supported
                                }
                              }}
                              min={currentBookingForm.checkIn || "2026-06-10"}
                              max="2026-06-17"
                              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-white font-semibold mb-2 text-sm">Special Requests (Optional)</label>
                          <textarea
                            value={currentBookingForm.specialRequests}
                            onChange={(e) => updateBookingForm(hotel.id, { specialRequests: e.target.value })}
                            rows={3}
                            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                            placeholder="Any special requirements or preferences..."
                          />
                        </div>

                        {/* Price Calculation */}
                        {(() => {
                          const pricing = calculatePrice(hotel, currentBookingForm);
                          if (pricing.nights > 0) {
                            return (
                              <div className="bg-white/10 border border-white/30 rounded-lg p-4 space-y-2">
                                <h4 className="text-white font-semibold mb-3">💰 Price Summary</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between text-blue-100">
                                    <span>{currentBookingForm.roomType}</span>
                                    <span>€{pricing.roomPrice}/night</span>
                                  </div>
                                  <div className="flex justify-between text-blue-100">
                                    <span>Number of nights</span>
                                    <span>{pricing.nights}</span>
                                  </div>
                                  <div className="flex justify-between text-blue-100 pt-2 border-t border-white/20">
                                    <span>Room Total</span>
                                    <span className="font-semibold">€{pricing.totalRoomCost}</span>
                                  </div>
                                  {pricing.cityTax > 0 && (
                                    <div className="flex justify-between text-blue-100">
                                      <span>City Tax</span>
                                      <span>€{pricing.cityTax.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/20">
                                    <span>Grand Total</span>
                                    <span className="text-yellow-300">€{pricing.grandTotal.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Booking Request
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <div className="text-center text-white p-4">
                        <p>Loading booking form...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
            );
          })}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-6xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300"
              >
                ✕
              </button>
              <img
                src={selectedImage}
                alt="Hotel image"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            💡 Booking Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-blue-100">
            <div>
              <div className="text-3xl mb-2">🎫</div>
              <p className="font-semibold text-white mb-1">Festival Discount</p>
              <p className="text-sm">Mention the festival for special rates</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🚌</div>
              <p className="font-semibold text-white mb-1">Transportation</p>
              <p className="text-sm">Easy access to festival venues</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📅</div>
              <p className="font-semibold text-white mb-1">Book Early</p>
              <p className="text-sm">Rooms fill up fast during festival</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
