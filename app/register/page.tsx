"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Package {
  name: string;
  price: string;
  priceValue: number;
  description: string;
  features: string[];
  popular: boolean;
  icon: string;
}

export default function RegisterPage() {
  const { t } = useLanguage();
  
  const packages: Package[] = [
  {
    name: t.pricing.guinnessOnly,
    price: "€30",
    priceValue: 30,
    description: t.pricing.guinnessOnlyDesc,
    features: [
      t.pricing.features.guinnessRecord,
      t.pricing.features.merchandise,
      t.pricing.features.certificate,
      t.pricing.features.bePartOfHistory
    ],
    popular: false,
    icon: "🏆"
  },
  {
    name: t.pricing.greekNightOnly,
    price: "€40",
    priceValue: 40,
    description: t.pricing.greekNightOnlyDesc,
    features: [
      t.pricing.features.greekNight,
      t.pricing.features.traditionalFood,
      t.pricing.features.unforgettable
    ],
    popular: false,
    icon: "🍷"
  },
  {
    name: t.pricing.starterPass,
    price: "€70",
    priceValue: 70,
    description: t.pricing.starterPassDesc,
    features: [
      t.pricing.features.accessToClasses.replace('{count}', '2'),
      t.pricing.features.festivalProgram,
      t.pricing.features.certificate
    ],
    popular: false,
    icon: "🌟"
  },
  {
    name: t.pricing.explorerPass,
    price: "€100",
    priceValue: 100,
    description: t.pricing.explorerPassDesc,
    features: [
      t.pricing.features.accessToClasses.replace('{count}', '4'),
      t.pricing.features.festivalProgram,
      t.pricing.features.certificate
    ],
    popular: false,
    icon: "🎭"
  },
  {
    name: t.pricing.enthusiastPass,
    price: "€160",
    priceValue: 160,
    description: t.pricing.enthusiastPassDesc,
    features: [
      t.pricing.features.accessToClasses.replace('{count}', '8'),
      t.pricing.features.festivalProgram,
      t.pricing.features.prioritySelection,
      t.pricing.features.certificate
    ],
    popular: false,
    icon: "⭐"
  },
  {
    name: t.pricing.fullPass,
    price: "€260",
    priceValue: 260,
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
    icon: "👑"
  }
];
  
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [closedMessage, setClosedMessage] = useState("");
  const [registrationType, setRegistrationType] = useState<"individual" | "bulk" | null>(null);
  const [step, setStep] = useState(0); // 0 = choose type, 1 = package selection, 2 = details, 3 = confirm
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [user, setUser] = useState<{firstName: string; lastName: string; email: string; isAdmin?: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    firstName: "",
    lastName: "",
    guinnessRecordAttempt: false,
    greekNight: false,
  });

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;
    let total = selectedPackage.priceValue;
    
    // Full Pass already includes everything
    if (selectedPackage.name === "Full Pass") {
      return total;
    }
    
    // For Guinness Record Only, add Greek Night if selected
    if (selectedPackage.name === "Guinness Record Only") {
      if (formData.greekNight) total += 40;
      return total;
    }
    
    // For Greek Night Only, add Guinness Record if selected
    if (selectedPackage.name === "Greek Night Only") {
      if (formData.guinnessRecordAttempt) total += 30;
      return total;
    }
    
    // For class passes, add both addons if selected
    if (formData.guinnessRecordAttempt) total += 30;
    if (formData.greekNight) total += 40;
    
    return total;
  };

  useEffect(() => {
    // Check registration status and user auth on initial load only
    const checkStatus = async () => {
      try {
        const [settingsRes, userRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/auth/me")
        ]);
        
        const settingsData = await settingsRes.json();
        setIsOpen(settingsData.registrationOpen);
        setClosedMessage(settingsData.registrationMessage || "Registration opens on March 1st, 2026");
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,
            firstName: userData.user.firstName || "",
            lastName: userData.user.lastName || "",
          }));
        }
      } catch (err) {
        console.error("Error checking status:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !user) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Determine what's included based on package type
      let includesGreekNight = false;
      let includesGuinness = false;

      if (selectedPackage.name === "Full Pass") {
        includesGreekNight = true;
        includesGuinness = true;
      } else if (selectedPackage.name === "Greek Night Only") {
        includesGreekNight = true;
      } else if (selectedPackage.name === "Guinness Record Only") {
        includesGuinness = true;
      } else {
        // Class passes - check add-ons
        includesGreekNight = formData.greekNight;
        includesGuinness = formData.guinnessRecordAttempt;
      }
      
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formData.phone,
          registrantFirstName: formData.firstName,
          registrantLastName: formData.lastName,
          packageType: selectedPackage.name,
          guinnessRecordAttempt: includesGuinness,
          greekNight: includesGreekNight,
          totalPrice: calculateTotalPrice(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading || isOpen === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl">{t.common.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  // Registration closed state (but admins can still register)
  if (!isOpen && !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl"></div>
            
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-white/20 shadow-2xl">
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-full p-6 shadow-lg">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
                {t.register.registrationOpensSoon}
              </h2>

              <p className="text-xl md:text-2xl text-blue-100 text-center mb-8">
                {t.register.markYourCalendars}
              </p>

              <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl p-8 border border-white/30 mb-8">
                <p className="text-center text-white font-bold text-2xl md:text-3xl">
                  {t.register.registrationOpensOn}
                </p>
              </div>

              <p className="text-center text-blue-100 text-lg mb-10 leading-relaxed">
                {t.register.getReadyMessage}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="bg-white text-blue-900 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 text-center shadow-lg"
                >
                  {t.register.backToHome}
                </Link>
                <Link
                  href="/pricing"
                  className="bg-blue-700/50 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-600/50 transition-all transform hover:scale-105 border-2 border-white/30 text-center backdrop-blur-sm"
                >
                  {t.register.viewPackages}
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-white/20">
                <div className="grid md:grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-white font-semibold mb-1">{t.register.festivalDates}</p>
                    <p className="text-blue-100 text-sm">{t.register.festivalDatesText}</p>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">🎭</div>
                    <p className="text-white font-semibold mb-1">{t.register.danceWorkshops}</p>
                    <p className="text-blue-100 text-sm">{t.register.allSkillLevels}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl"></div>
            
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-4xl font-bold text-white mb-4">{t.register.registrationComplete}</h2>
              <p className="text-xl text-blue-100 mb-8">
                {t.register.welcomeMessage}, {user?.firstName}!
              </p>
              
              <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-4xl">{selectedPackage?.icon}</span>
                  <div>
                    <p className="text-white font-bold text-xl">{selectedPackage?.name}</p>
                    <p className="text-green-400 font-bold text-2xl">€{calculateTotalPrice()}</p>
                  </div>
                </div>
                {(formData.guinnessRecordAttempt || formData.greekNight) && (
                  <div className="text-center mb-4 space-y-1">
                    {formData.guinnessRecordAttempt && (
                      <p className="text-blue-100 text-sm">✓ Includes Guinness Record Attempt</p>
                    )}
                    {formData.greekNight && (
                      <p className="text-blue-100 text-sm">✓ Includes Greek Night</p>
                    )}
                  </div>
                )}
                <p className="text-blue-100 text-sm text-center">
                  {t.register.confirmationSent} {user?.email}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="bg-white text-blue-900 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 text-center shadow-lg"
                >
                  {t.register.goToDashboard}
                </Link>
                <Link
                  href="/"
                  className="bg-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all border border-white/30 text-center"
                >
                  {t.register.backToHome}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Admin Testing Notice */}
        {user?.isAdmin && !isOpen && (
          <div className="mb-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 border-2 border-yellow-300 shadow-xl">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="text-center">
                <p className="text-white font-bold text-xl">👑 ADMIN TESTING MODE</p>
                <p className="text-white/90 text-sm">Registration is closed for public, but you can test as admin</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            {t.register.title}
          </h1>
          <p className="text-xl text-blue-100">
            {t.register.subtitle}
          </p>
          {step > 0 && (
            <Link
              href="/register/bulk"
              className="inline-block text-blue-200 hover:text-white underline mt-4"
            >
              ← Register as Dance Studio / Teacher instead
            </Link>
          )}
        </div>

        {/* Progress Steps - Only show if type selected */}
        {step > 0 && (
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-blue-300'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 1 ? 'bg-white text-blue-900' : 'bg-white/20'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className="font-semibold hidden sm:inline">{t.register.step1}</span>
              </div>
              <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-blue-300'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 2 ? 'bg-white text-blue-900' : 'bg-white/20'
                }`}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <span className="font-semibold hidden sm:inline">Your Details</span>
              </div>
              <div className={`w-16 h-1 rounded ${step >= 3 ? 'bg-white' : 'bg-white/20'}`} />
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-white' : 'text-blue-300'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 3 ? 'bg-white text-blue-900' : 'bg-white/20'
                }`}>
                  {step > 3 ? '✓' : '3'}
                </div>
                <span className="font-semibold hidden sm:inline">Confirm</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 0: Choose Registration Type */}
        {step === 0 && (
          <div className="animate-fadeIn max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Choose Your Registration Type
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Individual Registration */}
              <button
                onClick={() => {
                  setRegistrationType("individual");
                  setStep(1);
                }}
                className="group relative bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-md rounded-3xl p-8 border-2 border-white/30 hover:border-white hover:shadow-2xl hover:shadow-white/30 transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-6xl mb-6">🕺</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Individual Registration</h3>
                  <p className="text-blue-100 text-lg leading-relaxed">
                    Register yourself for the Greek Dance Festival. Choose your package and complete your registration.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-white font-semibold">
                    <span>Continue</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Dance Studio / Teacher Registration */}
              <button
                onClick={() => {
                  window.location.href = "/register/bulk";
                }}
                className="group relative bg-gradient-to-br from-purple-500/20 to-pink-500/30 backdrop-blur-md rounded-3xl p-8 border-2 border-purple-400/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-400/30 transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-6xl mb-6">👥</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Dance Studio / Teacher</h3>
                  <p className="text-blue-100 text-lg leading-relaxed">
                    Register multiple students from your dance studio or as a teacher. Bulk registration for groups.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-white font-semibold">
                    <span>Continue</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Package Selection */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Select Your Festival Package
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {packages.map((pkg) => (
                <button
                  key={pkg.name}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 transition-all transform hover:scale-[1.02] text-left ${
                    selectedPackage?.name === pkg.name
                      ? 'border-white shadow-xl shadow-white/20'
                      : pkg.popular
                      ? 'border-yellow-400'
                      : 'border-white/20 hover:border-white/50'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full font-bold text-xs">
                      MOST POPULAR
                    </div>
                  )}
                  
                  {selectedPackage?.name === pkg.name && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="text-2xl mb-2">{pkg.icon}</div>
                  <h3 className="text-base font-bold text-white mb-1">{pkg.name}</h3>
                  <div className="text-2xl font-bold text-white mb-3">{pkg.price}</div>
                  
                  <ul className="space-y-1">
                    {pkg.features.slice(0, 3).map((feature, idx) => {
                      const isSpecial = feature.includes('🍷') || feature.includes('🏆');
                      return (
                        <li 
                          key={idx} 
                          className={`flex items-start text-xs ${isSpecial ? 'font-bold' : 'text-blue-100'}`}
                        >
                          <span className="text-green-400 mr-1.5 text-xs">✓</span>
                          <span className={isSpecial ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300' : ''}>{feature}</span>
                        </li>
                      );
                    })}
                    {pkg.features.length > 3 && (
                      <li className="text-blue-200 text-xs">+{pkg.features.length - 3} more</li>
                    )}
                  </ul>
                </button>
              ))}
            </div>
            
            {/* Zeimpekiko Choreography Notice for Step 1 */}
            <div className="max-w-3xl mx-auto mt-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border-2 border-purple-400/50">
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">🎬</div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">Zeimpekiko Choreography Video</h3>
                  <p className="text-blue-100 text-sm leading-relaxed mb-3">
                    The choreography will be sent to the dance schools in February.
                  </p>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    If you do not belong to any dance school, you can request a video by sending an email to:{" "}
                    <a href="mailto:greekdancefestival@gmail.com" className="text-white font-semibold hover:underline">
                      greekdancefestival@gmail.com
                    </a>
                  </p>
                  <p className="text-yellow-200 text-sm font-semibold mt-3">
                    ⚠️ You must be registered in order to receive the video.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedPackage}
                className="bg-white text-blue-900 px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {t.register.continueWith} {selectedPackage?.name || 'Package'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: User Details */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                Your Details
              </h2>
              
              {!user ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-blue-100 text-lg mb-6">
                    {t.register.signInRequired}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/login"
                      className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all"
                    >
                      {t.login.signIn}
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-all border border-white/30"
                    >
                      {t.register.createAccount}
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                  {/* User Info Display */}
                  <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {(formData.firstName || user.firstName)[0]}{(formData.lastName || user.lastName)[0]}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{user.firstName} {user.lastName}</p>
                        <p className="text-blue-100">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Name Fields - Can be edited */}
                  <div className="mb-6">
                    <label className="block text-white font-semibold mb-3">
                      Registration Name (editable)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="First Name"
                          className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Last Name"
                          className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                          required
                        />
                      </div>
                    </div>
                    <p className="text-blue-200 text-sm mt-2">
                      This name will appear on your festival badge and certificate
                    </p>
                  </div>
                  
                  {/* Phone Number */}
                  <div className="mb-6">
                    <label className="block text-white font-semibold mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+30 123 456 7890"
                      className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                      required
                    />
                    <p className="text-blue-200 text-sm mt-2">
                      We&apos;ll use this to contact you about the festival
                    </p>
                  </div>

                  {/* Add-ons Section */}
                  {selectedPackage && selectedPackage.name !== "Full Pass" && (
                    <div className="mb-6">
                      <label className="block text-white font-semibold mb-4 text-lg">
                        Optional Add-ons
                      </label>
                      <div className="space-y-4">
                        {/* Show Guinness Record addon for Greek Night Only and class passes */}
                        {selectedPackage.name !== "Guinness Record Only" && (
                          <div 
                            onClick={() => setFormData({ ...formData, guinnessRecordAttempt: !formData.guinnessRecordAttempt })}
                            className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                              formData.guinnessRecordAttempt 
                                ? 'bg-blue-500/20 border-blue-400' 
                                : 'bg-white/5 border-white/20 hover:border-white/40'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                                formData.guinnessRecordAttempt 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-white/40'
                              }`}>
                                {formData.guinnessRecordAttempt && (
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white font-semibold">🏆 Guinness Record Attempt</span>
                                  <span className="text-white font-bold">+€30</span>
                                </div>
                                <p className="text-blue-100 text-sm">
                                  Be part of history! Join our attempt to break the world record for the largest Greek dance performance
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Show Greek Night addon for Guinness Record Only and class passes */}
                        {selectedPackage.name !== "Greek Night Only" && (
                          <div 
                            onClick={() => setFormData({ ...formData, greekNight: !formData.greekNight })}
                            className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                              formData.greekNight 
                                ? 'bg-blue-500/20 border-blue-400' 
                                : 'bg-white/5 border-white/20 hover:border-white/40'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                                formData.greekNight 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-white/40'
                              }`}>
                                {formData.greekNight && (
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-semibold">🍷 Greek Night</span>
                                <span className="text-white font-bold">+€40</span>
                              </div>
                              <p className="text-blue-100 text-sm">
                                Enjoy an authentic Greek evening with traditional food and drinks
                              </p>
                            </div>
                          </div>
                        </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Full Pass Notice */}
                  {selectedPackage && selectedPackage.name === "Full Pass" && (
                    <div className="mb-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border-2 border-green-400/50">
                      <div className="text-center">
                        <p className="text-white font-bold text-lg mb-2">🎉 All-Inclusive Package! 🎉</p>
                        <p className="text-blue-100 text-sm">
                          Your Full Pass already includes Greek Night access and Guinness Record participation at no extra cost!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Guinness Record Only Notice */}
                  {selectedPackage && selectedPackage.name === "Guinness Record Only" && (
                    <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border-2 border-yellow-400/50">
                      <div className="text-center">
                        <p className="text-white font-bold text-lg mb-2">🏆 Guinness Record Attempt</p>
                        <p className="text-blue-100 text-sm">
                          Want to add Greek Night to your experience? Select it as an optional addon above!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Greek Night Only Notice */}
                  {selectedPackage && selectedPackage.name === "Greek Night Only" && (
                    <div className="mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border-2 border-purple-400/50">
                      <div className="text-center">
                        <p className="text-white font-bold text-lg mb-2">🍷 Greek Night Experience</p>
                        <p className="text-blue-100 text-sm">
                          Want to also participate in the Guinness Record? Add it as an optional addon above!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Selected Package Summary */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 mb-8 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{selectedPackage?.icon}</span>
                        <div>
                          <p className="text-white font-bold text-lg">{selectedPackage?.name}</p>
                          <p className="text-blue-100 text-sm">{selectedPackage?.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-2xl">{selectedPackage?.price}</p>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-blue-200 text-sm hover:text-white underline"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                    
                    {/* Add-ons Summary */}
                    {(formData.guinnessRecordAttempt || formData.greekNight) && (
                      <div className="border-t border-white/20 pt-4 space-y-2">
                        {formData.guinnessRecordAttempt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-100">🏆 Guinness Record Attempt</span>
                            <span className="text-white font-semibold">+€30</span>
                          </div>
                        )}
                        {formData.greekNight && (
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-100">🍷 Greek Night</span>
                            <span className="text-white font-semibold">+€40</span>
                          </div>
                        )}
                        <div className="border-t border-white/20 pt-2 mt-2 flex justify-between">
                          <span className="text-white font-bold">Total</span>
                          <span className="text-white font-bold text-xl">€{calculateTotalPrice()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-white/20 text-white px-6 py-4 rounded-full font-semibold hover:bg-white/30 transition-all border border-white/30"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.phone || !formData.firstName || !formData.lastName}
                      className="flex-1 bg-white text-blue-900 px-6 py-4 rounded-full font-bold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      Review & Confirm
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && user && (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                Confirm Your Registration
              </h2>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-red-200 text-center">
                  {error}
                </div>
              )}
              
              {/* Summary Card */}
              <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10 mb-8">
                <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 p-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedPackage?.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold text-2xl">{selectedPackage?.name}</p>
                      <p className="text-blue-100">{selectedPackage?.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-3xl">{selectedPackage?.price}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-blue-100">Registration Name</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{formData.firstName} {formData.lastName}</span>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-blue-300 text-sm hover:text-white underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-blue-100">Email</span>
                    <span className="text-white font-semibold">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-blue-100">Phone</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{formData.phone}</span>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-blue-300 text-sm hover:text-white underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-blue-100">Festival Dates</span>
                    <span className="text-white font-semibold">June 12-14, 2026</span>
                  </div>
                </div>
              </div>
              
              {/* Features */}
              <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
                <h3 className="text-white font-semibold mb-4">What&apos;s Included:</h3>
                <ul className="grid grid-cols-2 gap-3">
                  {selectedPackage?.features.map((feature, idx) => {
                    const isSpecial = feature.includes('🍷') || feature.includes('🏆');
                    return (
                      <li 
                        key={idx} 
                        className={`flex items-center text-sm ${isSpecial ? 'font-bold col-span-2 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-pink-400/20 p-3 rounded-lg border-2 border-yellow-400/50 animate-pulse shadow-lg' : 'text-blue-100'}`}
                      >
                        <span className="text-green-400 mr-2">✓</span>
                        <span className={isSpecial ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300' : ''}>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {/* Zeimpekiko Choreography Notice */}
              {(formData.guinnessRecordAttempt || selectedPackage?.name === "Full Pass") && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 mb-8 border-2 border-purple-400/50">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">🎬</div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">Zeimpekiko Choreography Video</h3>
                      <p className="text-blue-100 text-sm leading-relaxed mb-3">
                        The choreography will be sent to the dance schools in February.
                      </p>
                      <p className="text-blue-100 text-sm leading-relaxed">
                        If you do not belong to any dance school, you can request a video by sending an email to:{" "}
                        <a href="mailto:greekdancefestival@gmail.com" className="text-white font-semibold hover:underline">
                          greekdancefestival@gmail.com
                        </a>
                      </p>
                      <p className="text-yellow-200 text-sm font-semibold mt-3">
                        ⚠️ You must be registered in order to receive the video.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="flex-1 bg-white/20 text-white px-6 py-4 rounded-full font-semibold hover:bg-white/30 transition-all border border-white/30 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-full font-bold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
