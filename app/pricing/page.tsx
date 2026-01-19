"use client";

import Link from "next/link";
import Navigation from "../components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PricingPage() {
  const { t } = useLanguage();
  
  const packages = [
  {
    name: t.pricing.guinnessOnly,
    price: "€30",
    description: t.pricing.guinnessOnlyDesc,
    features: [
      t.pricing.features.guinnessRecord,
      t.pricing.features.merchandise,
      t.pricing.features.certificate,
      t.pricing.features.bePartOfHistory
    ],
    popular: false,
    category: "standalone"
  },
  {
    name: t.pricing.greekNightOnly,
    price: "€40",
    description: t.pricing.greekNightOnlyDesc,
    features: [
      t.pricing.features.greekNight,
      t.pricing.features.traditionalFood,
      t.pricing.features.unforgettable
    ],
    popular: false,
    category: "standalone"
  },
  {
    name: t.pricing.starterPass,
    price: "€70",
    description: t.pricing.starterPassDesc,
    features: [
      t.pricing.features.accessToClasses.replace('{count}', '2'),
      t.pricing.features.festivalProgram,
      t.pricing.features.certificate
    ],
    popular: false,
    category: "classes"
  },
  {
    name: t.pricing.explorerPass,
    price: "€100",
    description: t.pricing.explorerPassDesc,
    features: [
      t.pricing.features.accessToClasses.replace('{count}', '4'),
      t.pricing.features.festivalProgram,
      t.pricing.features.certificate
    ],
    popular: false,
    category: "classes"
  },
  {
    name: t.pricing.enthusiastPass,
    price: "€160",
    description: t.pricing.enthusiastPassDesc,
    features: [
      t.pricing.features.accessToClasses.replace('{count}', '8'),
      t.pricing.features.festivalProgram,
      t.pricing.features.prioritySelection,
      t.pricing.features.certificate
    ],
    popular: false,
    category: "classes"
  },
  {
    name: t.pricing.fullPass,
    price: "€260",
    description: t.pricing.fullPassDesc,
    features: [
      t.pricing.features.unlimitedClasses,
      t.pricing.features.unlimitedParticipation,
      "🍷 " + t.pricing.features.greekNight,
      "🏆 " + t.pricing.features.guinnessRecord,
      t.pricing.features.festivalProgram,
      t.pricing.features.premiumMerchandise,
      t.pricing.features.prioritySelection,
      t.pricing.features.certificate
    ],
    popular: true,
    category: "classes"
  }
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            {t.pricing.title}
          </h1>
          <p className="text-lg text-blue-100">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* Standalone Events */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            🎉 {t.pricing.standaloneEvents}
          </h2>
          <p className="text-blue-100 text-center mb-6 text-sm">
            {t.pricing.standaloneEventsDesc}
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {packages.filter(pkg => pkg.category === "standalone").map((pkg) => (
              <div
                key={pkg.name}
                className="bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-400/20 backdrop-blur-md rounded-xl p-5 border-2 border-yellow-400/50 shadow-xl hover:scale-105 transition-transform"
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-blue-100 text-xs mb-3">
                    {pkg.description}
                  </p>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 mb-1">
                    {pkg.price}
                  </div>
                  <p className="text-blue-100 text-xs">{t.pricing.perPerson}</p>
                </div>

                <ul className="space-y-2 mb-4">
                  {pkg.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-start text-white text-sm"
                    >
                      <span className="text-green-400 mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?package=${encodeURIComponent(pkg.name)}`}
                  className="block w-full text-center py-2 rounded-full font-semibold transition-colors bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 hover:from-yellow-300 hover:to-orange-300 text-sm"
                >
                  {t.pricing.selectPackage}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Class Packages */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            💃 {t.pricing.classPackagesTitle}
          </h2>
          <p className="text-blue-100 text-center mb-6 text-sm">
            {t.pricing.classPackagesDesc}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.filter(pkg => pkg.category === "classes").map((pkg) => (
              <div
                key={pkg.name}
                className={`bg-white/10 backdrop-blur-md rounded-xl p-5 border-2 ${
                  pkg.popular
                    ? "border-yellow-400 relative"
                    : "border-white/20"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-blue-900 px-3 py-0.5 rounded-full font-bold text-xs">
                    {t.pricing.popular}
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-blue-100 text-xs mb-3">
                    {pkg.description}
                  </p>
                  <div className="text-4xl font-bold text-white mb-1">
                    {pkg.price}
                  </div>
                <p className="text-blue-100 text-xs">per person</p>
              </div>

              <ul className="space-y-2 mb-4">
                {pkg.features.map((feature, index) => {
                  const isSpecial = feature.includes('🍷') || feature.includes('🏆');
                  return (
                    <li 
                      key={index} 
                      className={`flex items-start text-sm ${isSpecial ? 'text-white font-bold bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-pink-400/30 p-2 rounded-lg border border-yellow-400/60' : 'text-blue-100'}`}
                    >
                      <span className="text-green-400 mr-2">✓</span>
                      <span className={isSpecial ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300' : ''}>{feature}</span>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={`/register?package=${encodeURIComponent(pkg.name)}`}
                className={`block w-full text-center py-2 rounded-full font-semibold transition-colors text-sm ${
                  pkg.popular
                    ? "bg-yellow-400 text-blue-900 hover:bg-yellow-300"
                    : "bg-white text-blue-900 hover:bg-blue-50"
                }`}
              >
                {t.pricing.selectPackage}
              </Link>
            </div>
          ))}
        </div>
        </div>

        {/* Optional Add-ons Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 border-2 border-blue-400/50">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            💡 {t.pricing.addEventsTitle}
          </h3>
          <p className="text-blue-100 text-center mb-8">
            {t.pricing.addEventsDesc}
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3 text-center">🏆</div>
              <h4 className="font-bold text-white text-xl mb-2 text-center">{t.pricing.guinnessAddTitle}</h4>
              <p className="text-green-400 font-bold text-2xl mb-3 text-center">+€30</p>
              <p className="text-blue-100 text-sm text-center">
                {t.pricing.guinnessAddDesc}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3 text-center">🍷</div>
              <h4 className="font-bold text-white text-xl mb-2 text-center">{t.pricing.greekNightAddTitle}</h4>
              <p className="text-green-400 font-bold text-2xl mb-3 text-center">+€40</p>
              <p className="text-blue-100 text-sm text-center">
                {t.pricing.greekNightAddDesc}
              </p>
            </div>
          </div>
          <p className="text-center text-blue-100 text-sm mt-6">
            💡 {t.pricing.addEventsNote}
          </p>
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {t.pricing.packageInfo}
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-blue-100">
            <div>
              <h4 className="font-bold text-white mb-2">{t.pricing.cancellationPolicy}</h4>
              <p>{t.pricing.cancellationText}</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">{t.pricing.needHelp}</h4>
              <p>{t.pricing.needHelpText}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-block bg-white text-blue-900 px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            {t.nav.register}
          </Link>
        </div>
      </div>
    </div>
  );
}
