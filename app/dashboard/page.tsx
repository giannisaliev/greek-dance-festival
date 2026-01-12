"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import Navigation from "../components/Navigation";
import "react-phone-number-input/style.css";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  participant: {
    id: string;
    phone: string;
    packageType: string;
    checkedIn: boolean;
  } | null;
}

const packages = [
  { value: "Day Pass", label: "Day Pass - €45" },
  { value: "Weekend Pass", label: "Weekend Pass - €120" },
  { value: "VIP Pass", label: "VIP Pass - €250" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      {/* Main Content */}
      {/* Dashboard Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome, {user.firstName}!
          </h1>
          <p className="text-blue-100">
            Manage your festival registration and preferences
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/20 border border-green-400 text-green-100"
                : "bg-red-500/20 border border-red-400 text-red-100"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* User Information */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-blue-100 text-sm mb-1">Name</label>
              <div className="text-white text-lg">
                {user.firstName} {user.lastName}
              </div>
            </div>
            <div>
              <label className="block text-blue-100 text-sm mb-1">Email</label>
              <div className="text-white text-lg">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Registration Status */}
        {user.participant ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">
              Festival Registration
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-blue-100 text-sm mb-1">Package</label>
                <div className="text-white text-lg">{user.participant.packageType}</div>
              </div>
              <div>
                <label className="block text-blue-100 text-sm mb-1">Phone</label>
                <div className="text-white text-lg">{user.participant.phone}</div>
              </div>
              <div>
                <label className="block text-blue-100 text-sm mb-1">Status</label>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    user.participant.checkedIn
                      ? "bg-green-500/20 text-green-300 border border-green-400"
                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-400"
                  }`}
                >
                  {user.participant.checkedIn ? "Checked In" : "Registered"}
                </span>
              </div>
            </div>
            
            <Link
              href="/dashboard/edit"
              className="inline-block bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              Edit Registration
            </Link>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              No Active Registration
            </h2>
            <p className="text-blue-100 mb-6">
              You haven&apos;t registered for the festival yet.
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              Register Now
            </Link>
          </div>
        )}
      </div>

      <style jsx global>{`
        .PhoneInput {
          width: 100%;
        }
        .PhoneInputInput {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          color: white;
          width: 100%;
        }
        .PhoneInputInput:focus {
          outline: none;
          border-color: white;
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
