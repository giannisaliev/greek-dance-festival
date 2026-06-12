"use client";

import { useState } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t.forgotPassword.errorMessage);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError(t.forgotPassword.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">{t.forgotPassword.successTitle}</h1>
              <p className="text-blue-100 mb-8">{t.forgotPassword.successMessage}</p>
              <Link href="/login" className="text-white font-semibold hover:underline">
                {t.forgotPassword.backToLogin}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white mb-2 text-center">
                {t.forgotPassword.title}
              </h1>
              <p className="text-blue-100 mb-8 text-center">{t.forgotPassword.subtitle}</p>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-400 text-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-white font-medium mb-2">
                    {t.forgotPassword.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white focus:bg-white/30"
                    placeholder="your.email@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-blue-900 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t.forgotPassword.sending : t.forgotPassword.sendLink}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-blue-100 hover:text-white hover:underline">
                  {t.forgotPassword.backToLogin}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
