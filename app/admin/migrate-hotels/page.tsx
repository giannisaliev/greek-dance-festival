"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/app/components/Navigation";

export default function MigrateHotelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const runMigration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/migrate-hotels", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Migration failed");
      }
    } catch (err) {
      setError("Failed to run migration");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-6">
            🔧 Hotel Fields Migration
          </h1>

          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-100 font-semibold mb-2">⚠️ One-Time Migration</p>
            <p className="text-blue-100 text-sm">
              This will add the new <code>breakfastIncluded</code> and <code>cityTax</code> columns to the Hotel table.
              Run this only if you're experiencing errors with the hotel pages.
            </p>
          </div>

          <button
            onClick={runMigration}
            disabled={loading}
            className="w-full bg-green-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Running Migration..." : "🚀 Run Migration"}
          </button>

          {result && (
            <div className="mt-6 bg-green-500/20 border border-green-400/30 rounded-lg p-4">
              <p className="text-green-100 font-semibold mb-2">✅ Success!</p>
              <p className="text-white text-sm">{result.message}</p>
              {result.alreadyExists && (
                <p className="text-blue-100 text-sm mt-2">
                  Columns already existed - no changes made.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-400/30 rounded-lg p-4">
              <p className="text-red-100 font-semibold mb-2">❌ Error</p>
              <p className="text-white text-sm">{error}</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <a
              href="/admin/hotels"
              className="text-blue-200 hover:text-white underline"
            >
              ← Back to Hotels Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
