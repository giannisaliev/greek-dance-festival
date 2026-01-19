"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  packageType: string;
  guinnessRecordAttempt: boolean;
  greekNight: boolean;
  totalPrice: number;
}

interface Package {
  name: string;
  price: string;
  priceValue: number;
  icon: string;
}

export default function BulkRegisterPage() {
  const { t } = useLanguage();
  
  const packages: Package[] = [
    { name: t.pricing.guinnessOnly, price: "€30", priceValue: 30, icon: "🏆" },
    { name: t.pricing.greekNightOnly, price: "€40", priceValue: 40, icon: "🍷" },
    { name: t.pricing.starterPass, price: "€70", priceValue: 70, icon: "🌟" },
    { name: t.pricing.explorerPass, price: "€100", priceValue: 100, icon: "🎭" },
    { name: t.pricing.enthusiastPass, price: "€160", priceValue: 160, icon: "⭐" },
    { name: t.pricing.fullPass, price: "€260", priceValue: 260, icon: "👑" }
  ];

  const [user, setUser] = useState<{firstName: string; lastName: string; email: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [students, setStudents] = useState<Student[]>([{
    id: crypto.randomUUID(),
    firstName: "",
    lastName: "",
    email: "",
    packageType: packages[0].name,
    guinnessRecordAttempt: false,
    greekNight: false,
    totalPrice: packages[0].priceValue,
  }]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const addStudent = () => {
    setStudents([...students, {
      id: crypto.randomUUID(),
      firstName: "",
      lastName: "",
      email: "",
      packageType: packages[0].name,
      guinnessRecordAttempt: false,
      greekNight: false,
      totalPrice: packages[0].priceValue,
    }]);
  };

  const removeStudent = (id: string) => {
    if (students.length > 1) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const updateStudent = (id: string, field: keyof Student, value: any) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        
        // Recalculate price when package changes
        if (field === 'packageType') {
          const pkg = packages.find(p => p.name === value);
          if (pkg) {
            updated.totalPrice = pkg.priceValue;
            // Full Pass includes everything
            if (value === "Full Pass") {
              updated.guinnessRecordAttempt = true;
              updated.greekNight = true;
            }
          }
        }
        
        // Recalculate price when add-ons change
        if (field === 'guinnessRecordAttempt' || field === 'greekNight') {
          const pkg = packages.find(p => p.name === s.packageType);
          if (pkg && pkg.name !== "Full Pass") {
            let price = pkg.priceValue;
            if (field === 'guinnessRecordAttempt' ? value : s.guinnessRecordAttempt) price += 30;
            if (field === 'greekNight' ? value : s.greekNight) price += 40;
            updated.totalPrice = price;
          }
        }
        
        return updated;
      }
      return s;
    }));
  };

  const calculateTotalPrice = () => {
    return students.reduce((sum, student) => sum + student.totalPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError("");

    // Validate no empty fields
    const hasEmptyFields = students.some(s => !s.firstName || !s.lastName || !s.email);
    if (hasEmptyFields) {
      setError("Please fill in all fields for each student (name and email)");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Submitting students:", students);
      
      const response = await fetch("/api/register/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        console.error("Bulk registration failed:", data);
        
        // Show which students failed and why
        if (data.details && Array.isArray(data.details)) {
          const errorSummary = data.details.map((d: any) => `${d.email}: ${d.error}`).join('\n');
          throw new Error(`Registration failed:\n\n${errorSummary}`);
        }
        
        throw new Error(data.error || "Registration failed");
      }

      // Show success even with some errors
      if (data.errors && data.errors.length > 0) {
        const partialSuccess = `Successfully registered ${data.registered.length} student(s).\n\nFailed registrations:\n${data.errors.map((e: any) => `${e.email}: ${e.error}`).join('\n')}`;
        setError(partialSuccess);
      }
      
      setSuccess(true);
    } catch (err) {
      console.error("Error during registration:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Authentication Required</h2>
            <p className="text-blue-100 mb-8">
              You must be logged in to register students for your dance studio.
            </p>
            <Link
              href="/login"
              className="inline-block bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4">Students Registered Successfully!</h2>
            <p className="text-xl text-blue-100 mb-8">
              {students.length} student{students.length > 1 ? 's' : ''} registered for the festival
            </p>
            
            <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
              <p className="text-white font-bold text-2xl mb-2">Total: €{calculateTotalPrice()}</p>
              <p className="text-blue-100 text-sm">
                Confirmation emails have been sent to all students
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-white text-blue-900 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all shadow-lg"
              >
                Back to Home
              </Link>
              <button
                onClick={() => { setSuccess(false); setStudents([{
                  id: crypto.randomUUID(),
                  firstName: "",
                  lastName: "",
                  email: "",
                  packageType: packages[0].name,
                  guinnessRecordAttempt: false,
                  greekNight: false,
                  totalPrice: packages[0].priceValue,
                }]); }}
                className="bg-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all border border-white/30"
              >
                Register More Students
              </button>
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Dance Studio / Teacher Registration
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Register multiple students for Greek Dance Festival 2026
          </p>
          <Link
            href="/register"
            className="inline-block text-blue-200 hover:text-white underline"
          >
            ← Register as individual participant instead
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-red-200 max-w-2xl mx-auto">
            <div className="font-bold text-red-100 mb-2">⚠️ Registration Error</div>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {students.map((student, index) => (
              <div key={student.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Student {index + 1}
                  </h3>
                  {students.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStudent(student.id)}
                      className="text-red-300 hover:text-red-100 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    value={student.firstName}
                    onChange={(e) => updateStudent(student.id, 'firstName', e.target.value)}
                    placeholder="First Name *"
                    className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                  <input
                    type="text"
                    value={student.lastName}
                    onChange={(e) => updateStudent(student.id, 'lastName', e.target.value)}
                    placeholder="Last Name *"
                    className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                  <input
                    type="email"
                    value={student.email}
                    onChange={(e) => updateStudent(student.id, 'email', e.target.value)}
                    placeholder="Email *"
                    className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-white font-semibold mb-2">Package</label>
                  <select
                    value={student.packageType}
                    onChange={(e) => updateStudent(student.id, 'packageType', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    style={{ color: 'white' }}
                  >
                    {packages.map(pkg => (
                      <option key={pkg.name} value={pkg.name} style={{ color: 'white', backgroundColor: '#1e40af' }}>{pkg.icon} {pkg.name} - {pkg.price}</option>
                    ))}
                  </select>
                </div>

                {student.packageType !== "Full Pass" && student.packageType !== "Guinness Record Only" && student.packageType !== "Greek Night Only" && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={student.guinnessRecordAttempt}
                        onChange={(e) => updateStudent(student.id, 'guinnessRecordAttempt', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span>🏆 Guinness Record (+€30)</span>
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={student.greekNight}
                        onChange={(e) => updateStudent(student.id, 'greekNight', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span>🍷 Greek Night (+€40)</span>
                    </label>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Subtotal</span>
                    <span className="text-white font-bold text-xl">€{student.totalPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <button
              type="button"
              onClick={addStudent}
              className="bg-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all border border-white/30 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Another Student
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-blue-100 text-sm">Total for {students.length} student{students.length > 1 ? 's' : ''}</p>
                <p className="text-white font-bold text-3xl">€{calculateTotalPrice()}</p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-bold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 shadow-lg flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Register All Students
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
