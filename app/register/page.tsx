"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";

interface Package {
  name: string;
  price: string;
  priceValue: number;
  description: string;
  features: string[];
  popular: boolean;
  icon: string;
}

const packages: Package[] = [
  {
    name: "Starter Pass",
    price: "€70",
    priceValue: 70,
    description: "Get a taste of the festival",
    features: [
      "Access to 2 classes",
      "Festival program",
      "Certificate of participation"
    ],
    popular: false,
    icon: "🌟"
  },
  {
    name: "Explorer Pass",
    price: "€100",
    priceValue: 100,
    description: "Explore more Greek dance styles",
    features: [
      "Access to 4 classes",
      "Festival program",
      "Festival merchandise",
      "Certificate of participation"
    ],
    popular: false,
    icon: "🎭"
  },
  {
    name: "Enthusiast Pass",
    price: "€200",
    priceValue: 200,
    description: "For serious dance enthusiasts",
    features: [
      "Access to 8 classes",
      "Festival program",
      "Festival merchandise",
      "Priority class selection",
      "Certificate of participation"
    ],
    popular: true,
    icon: "⭐"
  },
  {
    name: "Full Pass",
    price: "€290",
    priceValue: 290,
    description: "The ultimate festival experience",
    features: [
      "Access to all 24 classes",
      "Unlimited class participation",
      "🍷 Greek Night access included 🎉",
      "🏆 Guinness Record participation included ⭐",
      "Festival program",
      "Premium merchandise",
      "Priority class selection",
      "Certificate of participation"
    ],
    popular: false,
    icon: "👑"
  }
];

export default function RegisterPage() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [closedMessage, setClosedMessage] = useState("");
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [user, setUser] = useState<{firstName: string; lastName: string; email: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    guinnessRecordAttempt: false,
    greekNight: false,
  });

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;
    let total = selectedPackage.priceValue;
    
    // Full Pass already includes Greek Night and Guinness Record
    if (selectedPackage.name !== "Full Pass") {
      if (formData.guinnessRecordAttempt) total += 30;
      if (formData.greekNight) total += 40;
    }
    
    return total;
  };

  useEffect(() => {
    // Check registration status and user auth
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
      // Full Pass includes Greek Night and Guinness Record
      const includesGreekNight = selectedPackage.name === "Full Pass" || formData.greekNight;
      const includesGuinness = selectedPackage.name === "Full Pass" || formData.guinnessRecordAttempt;
      
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formData.phone,
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
            <p className="text-white text-xl">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Registration closed state
  if (!isOpen) {
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
                Registration Opens Soon!
              </h2>

              <p className="text-xl md:text-2xl text-blue-100 text-center mb-8">
                Mark your calendars
              </p>

              <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl p-8 border border-white/30 mb-8">
                <p className="text-center text-white font-bold text-2xl md:text-3xl">
                  {closedMessage}
                </p>
              </div>

              <p className="text-center text-blue-100 text-lg mb-10 leading-relaxed">
                Get ready for an unforgettable experience at the Greek Dance Festival!<br />
                Don&apos;t miss your chance to be part of this incredible celebration.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="bg-white text-blue-900 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 text-center shadow-lg"
                >
                  Back to Home
                </Link>
                <Link
                  href="/pricing"
                  className="bg-blue-700/50 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-600/50 transition-all transform hover:scale-105 border-2 border-white/30 text-center backdrop-blur-sm"
                >
                  View Packages
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-white/20">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-white font-semibold mb-1">Festival Dates</p>
                    <p className="text-blue-100 text-sm">June 12-14, 2026</p>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">🎭</div>
                    <p className="text-white font-semibold mb-1">Dance Workshops</p>
                    <p className="text-blue-100 text-sm">All skill levels welcome</p>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">🎵</div>
                    <p className="text-white font-semibold mb-1">Live Music</p>
                    <p className="text-blue-100 text-sm">Traditional Greek bands</p>
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
              
              <h2 className="text-4xl font-bold text-white mb-4">Registration Complete!</h2>
              <p className="text-xl text-blue-100 mb-8">
                Welcome to the Greek Dance Festival, {user?.firstName}!
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
                  A confirmation email has been sent to {user?.email}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="bg-white text-blue-900 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 text-center shadow-lg"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/"
                  className="bg-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all border border-white/30 text-center"
                >
                  Back to Home
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Register for the Festival
          </h1>
          <p className="text-xl text-blue-100">
            Join us for an unforgettable celebration of Greek culture and dance
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-blue-300'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-white text-blue-900' : 'bg-white/20'
              }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="font-semibold hidden sm:inline">Choose Package</span>
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
              }`}>2 lg:grid-cols-4
                3
              </div>
              <span className="font-semibold hidden sm:inline">Confirm</span>
            </div>
          </div>
        </div>

        {/* Step 1: Package Selection */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Select Your Festival Package
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <button
                  key={pkg.name}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 transition-all transform hover:scale-[1.02] text-left ${
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
                    <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="text-4xl mb-4">{pkg.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
                  <p className="text-blue-100 text-sm mb-4">{pkg.description}</p>
                  <div className="text-4xl font-bold text-white mb-4">{pkg.price}</div>
                  
                  <ul className="space-y-2">
                    {pkg.features.slice(0, 4).map((feature, idx) => {
                      const isSpecial = feature.includes('🍷') || feature.includes('🏆');
                      return (
                        <li 
                          key={idx} 
                          className={`flex items-start text-sm ${isSpecial ? 'text-yellow-300 font-bold' : 'text-blue-100'}`}
                        >
                          <span className="text-green-400 mr-2">✓</span>
                          <span>{feature}</span>
                        </li>
                      );
                    })}
                    {pkg.features.length > 4 && (
                      <li className="text-blue-200 text-sm">+{pkg.features.length - 4} more benefits</li>
                    )}
                  </ul>
                </button>
              ))}
            </div>
            
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedPackage}
                className="bg-white text-blue-900 px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                Continue with {selectedPackage?.name || 'Package'}
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
                    Please sign in or create an account to continue
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/login"
                      className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-all border border-white/30"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                  {/* User Info Display */}
                  <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{user.firstName} {user.lastName}</p>
                        <p className="text-blue-100">{user.email}</p>
                      </div>
                    </div>
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
                        {/* Guinness Record Attempt */}
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

                        {/* Greek Night */}
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
                              Enjoy an authentic Greek evening with traditional food, drinks, live music, and dancing under the stars
                            </p>
                          </div>
                        </div>
                      </div>
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
                      disabled={!formData.phone}
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
                    <span className="text-blue-100">Name</span>
                    <span className="text-white font-semibold">{user.firstName} {user.lastName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-blue-100">Email</span>
                    <span className="text-white font-semibold">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-blue-100">Phone</span>
                    <span className="text-white font-semibold">{formData.phone}</span>
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
                        className={`flex items-center text-sm ${isSpecial ? 'text-yellow-300 font-bold col-span-2 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 p-2 rounded-lg border border-yellow-400/30' : 'text-blue-100'}`}
                      >
                        <span className="text-green-400 mr-2">✓</span>
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
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
