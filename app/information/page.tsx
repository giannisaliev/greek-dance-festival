'use client';

import { useState } from 'react';
import Navigation from "../components/Navigation";

export default function InformationPage() {
  const [activeTab, setActiveTab] = useState<'guinness' | 'workshop'>('guinness');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Festival Information
          </h1>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-8 flex gap-4 justify-center">
          <button
            onClick={() => setActiveTab('guinness')}
            className={`flex-1 max-w-xs py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
              activeTab === 'guinness'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl scale-105'
                : 'bg-white/10 text-white border-2 border-white/20 hover:border-white/40'
            }`}
          >
            🏆 Guinness Record
          </button>
          <button
            onClick={() => setActiveTab('workshop')}
            className={`flex-1 max-w-xs py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
              activeTab === 'workshop'
                ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-xl scale-105'
                : 'bg-white/10 text-white border-2 border-white/20 hover:border-white/40'
            }`}
          >
            🎭 Workshops
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Guinness Record Location */}
          <div className={`bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/20 flex flex-col ${
            activeTab === 'guinness' ? 'block' : 'hidden lg:flex'
          }`}>
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full animate-pulse shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 text-center mb-2">
                🏆 Guinness Record Attempt
              </h2>
              <div className="bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-pink-400/20 rounded-xl p-4 border-2 border-yellow-400/50 mb-6">
                <div className="text-center">
                  <p className="text-white font-bold text-2xl mb-2">Sunday, June 14th, 2026</p>
                  <p className="text-yellow-200 font-bold text-3xl">12:00 PM</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <h3 className="text-white font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Location
                </h3>
                <p className="text-blue-100 font-semibold">Aristotelous Square</p>
                <p className="text-blue-200 text-sm">Thessaloniki, Greece</p>
              </div>
            </div>
            
            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 hover:border-yellow-400/50 transition-colors duration-300">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d825.4823985025275!2d22.940773521181264!3d40.6324654401109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a8390885a99cbd%3A0xe39e3d18ec8160ab!2sAristotle%20Square!5e0!3m2!1sen!2sgr!4v1768406943270!5m2!1sen!2sgr"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              ></iframe>
            </div>
            
            <a
              href="https://www.google.com/maps/search/?api=1&query=40.6324654,22.9407735"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-4 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Open in Google Maps
            </a>
          </div>

          {/* Workshop Location */}
          <div className={`bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20 flex flex-col ${
            activeTab === 'workshop' ? 'block' : 'hidden lg:flex'
          }`}>
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-4 rounded-full animate-bounce shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 text-center mb-2">
                🎭 Workshop Location
              </h2>
              <div className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-xl p-4 border-2 border-blue-400/50 mb-6">
                <div className="text-center">
                  <p className="text-white font-bold text-xl mb-1">Friday - Sunday</p>
                  <p className="text-blue-200 font-semibold text-lg">June 12-14, 2026</p>
                  <a href="/#schedule" className="inline-block mt-2 text-yellow-300 hover:text-yellow-200 font-semibold underline transition-colors duration-200">
                    View Full Schedule →
                  </a>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <h3 className="text-white font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Location
                </h3>
                <p className="text-blue-100 font-semibold">YMCA Thessaloniki</p>
                <p className="text-blue-200 text-sm">Thessaloniki, Greece</p>
              </div>
            </div>
            
            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 hover:border-blue-400/50 transition-colors duration-300">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d565.6499229414236!2d22.95216373764882!3d40.62661132017817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a839026870857f%3A0x7ac841aaf16c594d!2sYMCA%20-%20Young%20Men&#39;s%20Christian%20Association!5e0!3m2!1sen!2sgr!4v1768407001042!5m2!1sen!2sgr"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              ></iframe>
            </div>
            
            <a
              href="https://www.google.com/maps/search/?api=1&query=40.6266113,22.9521637"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white text-center py-4 rounded-full font-bold text-lg hover:from-blue-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Open in Google Maps
            </a>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-3xl p-8 border-2 border-white/30">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            📍 Important Notes
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h4 className="font-bold text-white text-lg mb-3 flex items-center">
                <span className="text-2xl mr-2">🚌</span>
                Getting Around
              </h4>
              <p className="text-blue-100 text-sm">
                Both locations are easily accessible by public transportation. Thessaloniki&apos;s bus system covers both areas extensively.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h4 className="font-bold text-white text-lg mb-3 flex items-center">
                <span className="text-2xl mr-2">🅿️</span>
                Parking
              </h4>
              <p className="text-blue-100 text-sm">
                Parking is available near both locations. We recommend arriving early, especially for the Guinness Record event at Aristotelous Square.
              </p>
            </div>
          </div>
        </div>

        {/* Sightseeing Section */}
        <div className="mt-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <span>🏛️</span>
              Explore Thessaloniki
              <span>🌟</span>
            </h2>
            <p className="text-blue-100 text-lg">
              Discover the rich history and vibrant culture of Greece&apos;s second-largest city
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* White Tower */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?w=800&q=80" 
                  alt="White Tower of Thessaloniki"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white">White Tower</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-blue-100 text-sm mb-4">
                  The iconic symbol of Thessaloniki, this 15th-century Ottoman fortification offers panoramic views of the city and the Thermaic Gulf. Now a museum showcasing the city&apos;s history.
                </p>
                <div className="flex items-center text-yellow-300 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  15 min walk from waterfront
                </div>
              </div>
            </div>

            {/* Rotunda */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80" 
                  alt="Rotunda of Thessaloniki"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white">Rotunda</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-blue-100 text-sm mb-4">
                  A UNESCO World Heritage Site dating back to the 4th century. Originally built as a mausoleum, it features stunning Byzantine mosaics and impressive architecture.
                </p>
                <div className="flex items-center text-yellow-300 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  UNESCO World Heritage
                </div>
              </div>
            </div>

            {/* Ano Poli */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1601823984263-b55f31c1c650?w=800&q=80" 
                  alt="Ano Poli Upper Town"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white">Ano Poli (Upper Town)</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-blue-100 text-sm mb-4">
                  Wander through narrow cobblestone streets, traditional houses, and Byzantine walls. This historic neighborhood offers breathtaking views and authentic Greek atmosphere.
                </p>
                <div className="flex items-center text-yellow-300 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Best sunset views
                </div>
              </div>
            </div>

            {/* Archaeological Museum */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1566127444979-b3d2b3c9e9c0?w=800&q=80" 
                  alt="Archaeological Museum"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white">Archaeological Museum</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-blue-100 text-sm mb-4">
                  Home to priceless artifacts from ancient Macedonia, including treasures from the royal tombs of Vergina and stunning gold jewelry from the Hellenistic period.
                </p>
                <div className="flex items-center text-yellow-300 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Ancient Macedonian treasures
                </div>
              </div>
            </div>

            {/* Ladadika District */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" 
                  alt="Ladadika District"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white">Ladadika District</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-blue-100 text-sm mb-4">
                  A vibrant entertainment district filled with colorful restored buildings, tavernas, bars, and restaurants. Perfect for experiencing Thessaloniki&apos;s nightlife and cuisine.
                </p>
                <div className="flex items-center text-yellow-300 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  Nightlife & dining hub
                </div>
              </div>
            </div>

            {/* Waterfront Promenade */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80" 
                  alt="Thessaloniki Waterfront"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white">Waterfront Promenade</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-blue-100 text-sm mb-4">
                  A scenic 3.5km promenade along the Thermaic Gulf. Ideal for walking, cycling, or relaxing at seaside cafes while enjoying views of Mount Olympus on clear days.
                </p>
                <div className="flex items-center text-yellow-300 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                  </svg>
                  Perfect for sunset walks
                </div>
              </div>
            </div>
          </div>

          {/* Travel Tips */}
          <div className="mt-10 bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-3xl p-8 border-2 border-green-400/30">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
              <span>💡</span>
              Travel Tips
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-5 border border-white/20">
                <div className="text-3xl mb-3">🎫</div>
                <h4 className="font-bold text-white text-lg mb-2">City Pass</h4>
                <p className="text-blue-100 text-sm">
                  Consider getting a Thessaloniki City Card for free entry to museums and public transport.
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-5 border border-white/20">
                <div className="text-3xl mb-3">🍽️</div>
                <h4 className="font-bold text-white text-lg mb-2">Local Cuisine</h4>
                <p className="text-blue-100 text-sm">
                  Don&apos;t miss trying bougatsa for breakfast and fresh seafood at the tavernas near the port.
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-5 border border-white/20">
                <div className="text-3xl mb-3">🚶</div>
                <h4 className="font-bold text-white text-lg mb-2">Best Way to Explore</h4>
                <p className="text-blue-100 text-sm">
                  The city center is very walkable. Wear comfortable shoes and explore on foot to discover hidden gems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
