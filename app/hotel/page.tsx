"use client";

import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Image from "next/image";

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
  const [selectedHotel, setSelectedHotel] = useState<number>(0);

  useEffect(() => {
    fetchHotels();
  }, []);

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

  const renderStars = (count: number) => {
    return "⭐".repeat(count);
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
              Festival Hotels
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              No hotels available at the moment. Check back soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            🏨 Festival Hotels
          </h1>
          <p className="text-xl text-blue-100">
            Book your stay at our recommended partner hotels
          </p>
        </div>

        {/* Hotel Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {hotels.map((hotel, index) => (
            <button
              key={hotel.id}
              onClick={() => setSelectedHotel(index)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedHotel === index
                  ? "bg-white text-blue-900 shadow-lg scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {hotel.name}
            </button>
          ))}
        </div>

        {/* Selected Hotel Details */}
        {hotels[selectedHotel] && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
            {/* Hotel Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {hotels[selectedHotel].logo && (
                    <img
                      src={hotels[selectedHotel].logo}
                      alt={`${hotels[selectedHotel].name} logo`}
                      className="w-20 h-20 object-contain bg-white/10 rounded-lg p-2"
                    />
                  )}
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2">
                      {hotels[selectedHotel].name}
                    </h2>
                    <div className="flex items-center gap-4 text-white">
                      <span className="text-2xl">
                        {renderStars(hotels[selectedHotel].stars)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {hotels[selectedHotel].description && (
                <p className="text-blue-100 mt-4 text-lg">
                  {hotels[selectedHotel].description}
                </p>
              )}
            </div>

            {/* Google Maps */}
            {hotels[selectedHotel].location && (
              <div className="p-8 bg-white/5">
                <h3 className="text-2xl font-bold text-white mb-6">
                  📍 Location
                </h3>
                <div className="w-full h-96 rounded-xl overflow-hidden">
                  <iframe
                    src={hotels[selectedHotel].location}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            )}

            {/* Hotel Images Gallery */}
            {hotels[selectedHotel].images.length > 0 && (
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  🖼️ Hotel Gallery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotels[selectedHotel].images.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative h-64 rounded-xl overflow-hidden group cursor-pointer"
                    >
                      <img
                        src={image}
                        alt={`${hotels[selectedHotel].name} - Image ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {hotels[selectedHotel].amenities.length > 0 && (
              <div className="px-8 pb-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  ✨ Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hotels[selectedHotel].amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 rounded-lg p-4 text-center"
                    >
                      <p className="text-white font-medium">{amenity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Prices */}
            {Object.keys(hotels[selectedHotel].prices).length > 0 && (
              <div className="px-8 pb-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  💰 Room Prices
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(hotels[selectedHotel].prices).map(
                    ([roomType, price]) => (
                      <div
                        key={roomType}
                        className="bg-gradient-to-br from-white/20 to-white/10 rounded-xl p-6 border border-white/30"
                      >
                        <h4 className="text-xl font-bold text-white mb-2">
                          {roomType}
                        </h4>
                        <p className="text-3xl font-bold text-yellow-300">
                          €{price}
                        </p>
                        <p className="text-blue-100 text-sm mt-1">per night</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Booking Info */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-8 border-t-2 border-white/20">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Book?
                </h3>
                <p className="text-blue-100 mb-6">
                  Contact the hotel directly or mention the Greek Dance Festival for special rates
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href={`tel:${hotels[selectedHotel].location}`}
                    className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors"
                  >
                    📞 Call Hotel
                  </a>
                  <a
                    href="mailto:info@greekdancefestival.gr"
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors"
                  >
                    ✉️ Email Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            💡 Booking Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-blue-100">
            <div>
              <div className="text-4xl mb-2">🎫</div>
              <p className="font-semibold text-white mb-2">Festival Discount</p>
              <p className="text-sm">Mention the festival when booking for special rates</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🚌</div>
              <p className="font-semibold text-white mb-2">Transportation</p>
              <p className="text-sm">All hotels offer easy access to festival venues</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📅</div>
              <p className="font-semibold text-white mb-2">Book Early</p>
              <p className="text-sm">Rooms fill up fast during festival season</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
