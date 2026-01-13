import Link from "next/link";
import Navigation from "../components/Navigation";

const packages = [
  {
    name: "Starter Pass",
    price: "€70",
    description: "Get a taste of the festival",
    features: [
      "Access to 2 classes",
      "Festival program",
      "Certificate of participation"
    ],
    popular: false
  },
  {
    name: "Explorer Pass",
    price: "€100",
    description: "Explore more Greek dance styles",
    features: [
      "Access to 4 classes",
      "Festival program",
      "Festival merchandise",
      "Certificate of participation"
    ],
    popular: false
  },
  {
    name: "Enthusiast Pass",
    price: "€200",
    description: "For serious dance enthusiasts",
    features: [
      "Access to 8 classes",
      "Festival program",
      "Festival merchandise",
      "Priority class selection",
      "Certificate of participation"
    ],
    popular: false
  },
  {
    name: "Full Pass",
    price: "€290",
    description: "The ultimate festival experience",
    features: [
      "Access to all 24 classes",
      "Unlimited class participation",
      "🍷 Greek Night",
      "🏆 Guinness Record",
      "Festival program",
      "Premium merchandise",
      "Priority class selection",
      "Certificate of participation"
    ],
    popular: true
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Festival Packages
          </h1>
          <p className="text-xl text-blue-100">
            Choose the package that best fits your festival experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 ${
                pkg.popular
                  ? "border-yellow-400 relative"
                  : "border-white/20"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full font-bold text-sm">
                  MOST POPULAR
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {pkg.name}
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  {pkg.description}
                </p>
                <div className="text-5xl font-bold text-white mb-2">
                  {pkg.price}
                </div>
                <p className="text-blue-100 text-sm">per person</p>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, index) => {
                  const isSpecial = feature.includes('🍷') || feature.includes('🏆');
                  return (
                    <li 
                      key={index} 
                      className={`flex items-start ${isSpecial ? 'text-white font-bold bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-pink-400/30 p-3 rounded-lg border-2 border-yellow-400/60 animate-pulse shadow-lg' : 'text-blue-100'}`}
                    >
                      <span className="text-green-400 mr-2 mt-1">✓</span>
                      <span className={isSpecial ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300' : ''}>{feature}</span>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={`/register?package=${encodeURIComponent(pkg.name)}`}
                className={`block w-full text-center py-3 rounded-full font-semibold transition-colors ${
                  pkg.popular
                    ? "bg-yellow-400 text-blue-900 hover:bg-yellow-300"
                    : "bg-white text-blue-900 hover:bg-blue-50"
                }`}
              >
                Select {pkg.name}
              </Link>
            </div>
          ))}
        </div>

        {/* Optional Add-ons Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 border-2 border-blue-400/50">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            🎉 Optional Add-ons
          </h3>
          <p className="text-blue-100 text-center mb-8">
            Enhance your festival experience with these exclusive additions
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3 text-center">🏆</div>
              <h4 className="font-bold text-white text-xl mb-2 text-center">Guinness Record Attempt</h4>
              <p className="text-green-400 font-bold text-2xl mb-3 text-center">+€30</p>
              <p className="text-blue-100 text-sm text-center">
                Be part of history! Join our attempt to break the world record for the largest Greek dance performance. Certificate included!
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3 text-center">🍷</div>
              <h4 className="font-bold text-white text-xl mb-2 text-center">Greek Night</h4>
              <p className="text-green-400 font-bold text-2xl mb-3 text-center">+€40</p>
              <p className="text-blue-100 text-sm text-center">
                Enjoy an authentic Greek evening with traditional food, drinks, live music, and dancing under the stars. Unforgettable!
              </p>
            </div>
          </div>
          <p className="text-center text-blue-100 text-sm mt-6">
            💡 Add-ons can be selected during registration
          </p>
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Package Information
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-blue-100">
            <div>
              <h4 className="font-bold text-white mb-2">Group Discounts</h4>
              <p>Groups of 10 or more receive a 15% discount on all packages. Contact us for group registration.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Cancellation Policy</h4>
              <p>Full refund available up to 30 days before the event. 50% refund up to 14 days before.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">What&apos;s Included</h4>
              <p>All packages include access to performances, workshops, and cultural activities throughout the festival.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Need Help?</h4>
              <p>Contact us at info@greekdancefestival.com or call +30 210 123 4567 for assistance.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-block bg-white text-blue-900 px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
