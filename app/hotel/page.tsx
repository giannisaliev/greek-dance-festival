"use client";

import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";

interface Hotel {
  id: string;
  name: string;
  logo?: string;
  stars: number;
  location: string;
  description?: string;
  images: string[];
  prices: Record<string, number>;
  amenities: string[];
  order: number;
}

export default function HotelPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        initialTabs[hotel.id] = "info";
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
  };

  const getAvailableTabs = (hotel: Hotel) => {
    const tabs = ["info", "gallery"];
    if (hotel.amenities && hotel.amenities.length > 0) {
      tabs.push("amenities");
    }
    tabs.push("prices");
    return tabs;
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
              🏨 Festival Hotels
            </h1>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🏨</div>
              <p className="text-2xl text-white font-semibold mb-4">
                Hotel information will be here soon!
              </p>
              <p className="text-blue-100">
                We're working on bringing you the best accommodation options for the festival. Check back soon for updates!
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
            🏨 Festival Hotels
          </h1>
          <p className="text-lg text-blue-100">
            Book your stay at our recommended partner hotels
          </p>
        </div>

        {/* Hotel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {hotels.map((hotel) => (
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
              <div className="flex border-b border-white/20 bg-white/5">
                {getAvailableTabs(hotel).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHotelTab(hotel.id, tab)}
                    className={`flex-1 py-3 px-2 text-sm font-semibold transition-all ${
                      activeTab[hotel.id] === tab
                        ? "bg-white/20 text-white border-b-2 border-white"
                        : "text-blue-200 hover:bg-white/10"
                    }`}
                  >
                    {tab === "info" && "📍 Info"}
                    {tab === "gallery" && "🖼️ Gallery"}
                    {tab === "amenities" && "✨ Amenities"}
                    {tab === "prices" && "💰 Prices"}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 min-h-[300px]">
                {/* Info Tab */}
                {activeTab[hotel.id] === "info" && (
                  <div className="h-full">
                    <h3 className="text-lg font-bold text-white mb-3">
                      📍 Location
                    </h3>
                    {hotel.location && hotel.location.includes('google.com/maps/embed') ? (
                      <div className="w-full h-64 rounded-lg overflow-hidden mb-4">
                        <iframe
                          src={hotel.location}
                          width="100%"
                          height="100%"
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
                    {Object.keys(hotel.prices).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(hotel.prices).map(
                          ([roomType, price]) => (
                            <div
                              key={roomType}
                              className="bg-gradient-to-br from-white/20 to-white/10 rounded-lg p-3 border border-white/30"
                            >
                              <h4 className="text-white font-semibold mb-1">
                                {roomType}
                              </h4>
                              <p className="text-2xl font-bold text-yellow-300">
                                €{price}
                                <span className="text-sm text-blue-100 ml-1">
                                  /night
                                </span>
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-blue-200 text-center py-8">
                        No prices available
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Booking Footer - Compact */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 border-t border-white/20">
                <h3 className="text-lg font-bold text-white mb-2 text-center">
                  Ready to Book?
                </h3>
                <a
                  href="mailto:hotel@greekdancefestival.gr"
                  className="block bg-white text-blue-900 px-4 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors text-center text-sm"
                >
                  ✉️ hotel@greekdancefestival.gr
                </a>
              </div>
            </div>
          ))}
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
