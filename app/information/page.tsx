import Navigation from "../components/Navigation";

export default function InformationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Festival Information
          </h1>
          <p className="text-xl text-blue-100">
            Everything you need to know about locations and timings
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Guinness Record Location */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/20">
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3027.8665389565893!2d22.9396!3d40.6344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a838f41428e0ed%3A0x9bae715b8d574a9!2sAristotelous%20Square!5e0!3m2!1sen!2sgr!4v1234567890"
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
              href="https://www.google.com/maps/place/Aristotelous+Square,+Thessaloniki,+Greece"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-4 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Open in Google Maps
            </a>
          </div>

          {/* Workshop Location */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20">
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3027.526!2d22.9445!3d40.6398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a838f9e422f5e7%3A0x8b9e3c0e8d9e3c0e!2sYMCA%20Thessaloniki!5e0!3m2!1sen!2sgr!4v1234567890"
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
              href="https://www.google.com/maps/place/YMCA+Thessaloniki"
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
      </div>
    </div>
  );
}
