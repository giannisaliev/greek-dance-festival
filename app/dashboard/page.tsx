"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { useRouter } from "next/navigation";

interface Participant {
  id: string;
  registrantFirstName: string | null;
  registrantLastName: string | null;
  phone: string;
  packageType: string;
  guinnessRecordAttempt: boolean;
  greekNight: boolean;
  totalPrice: number;
  checkedIn: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myRegistration, setMyRegistration] = useState<Participant | null>(null);
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, studentsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/participants/my-registrations")
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
        setMyRegistration(userData.user.participant);
      } else {
        router.push("/login");
        return;
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setRegisteredStudents(studentsData.students || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
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

  const getPackageIcon = (packageType: string) => {
    if (packageType.includes("Full")) return "👑";
    if (packageType.includes("Enthusiast")) return "⭐";
    if (packageType.includes("Explorer")) return "🎭";
    if (packageType.includes("Starter")) return "🌟";
    if (packageType.includes("Guinness")) return "🏆";
    if (packageType.includes("Greek Night")) return "🍷";
    return "🎫";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            My Registrations
          </h1>
          <p className="text-xl text-blue-100">
            Manage your festival registrations
          </p>
        </div>

        {/* My Registration */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">My Registration</h2>
          {myRegistration ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{getPackageIcon(myRegistration.packageType)}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {myRegistration.registrantFirstName || user?.firstName} {myRegistration.registrantLastName || user?.lastName}
                    </h3>
                    <p className="text-blue-100">{myRegistration.packageType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-3xl">€{myRegistration.totalPrice}</p>
                  {myRegistration.checkedIn && (
                    <span className="inline-block bg-green-500 text-white text-sm px-3 py-1 rounded-full mt-2">
                      ✓ Checked In
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-blue-200 text-sm">Phone</p>
                  <p className="text-white font-semibold">{myRegistration.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Registration Date</p>
                  <p className="text-white font-semibold">
                    {new Date(myRegistration.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {(myRegistration.guinnessRecordAttempt || myRegistration.greekNight) && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-blue-200 text-sm mb-2">Add-ons:</p>
                  <div className="flex gap-2">
                    {myRegistration.guinnessRecordAttempt && (
                      <span className="bg-blue-500/30 text-white px-3 py-1 rounded-full text-sm">
                        🏆 Guinness Record
                      </span>
                    )}
                    {myRegistration.greekNight && (
                      <span className="bg-purple-500/30 text-white px-3 py-1 rounded-full text-sm">
                        🍷 Greek Night
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-2xl font-bold text-white mb-4">Not Registered Yet</h3>
              <p className="text-blue-100 mb-6">
                You haven't registered for the festival yet. Register now to secure your spot!
              </p>
              <Link
                href="/register"
                className="inline-block bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all shadow-lg"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>

        {/* Students I Registered */}
        {registeredStudents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                Students I Registered ({registeredStudents.length})
              </h2>
              <Link
                href="/register/bulk"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                + Add More Students
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registeredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{getPackageIcon(student.participant.packageType)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {student.participant.registrantFirstName} {student.participant.registrantLastName}
                      </h3>
                      <p className="text-blue-200 text-sm">{student.email}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100 text-sm">{student.participant.packageType}</span>
                      <span className="text-white font-bold">€{student.participant.totalPrice}</span>
                    </div>
                  </div>

                  {(student.participant.guinnessRecordAttempt || student.participant.greekNight) && (
                    <div className="flex gap-2">
                      {student.participant.guinnessRecordAttempt && (
                        <span className="bg-blue-500/20 text-blue-100 px-2 py-1 rounded text-xs">
                          🏆 Guinness
                        </span>
                      )}
                      {student.participant.greekNight && (
                        <span className="bg-purple-500/20 text-purple-100 px-2 py-1 rounded text-xs">
                          🍷 Greek Night
                        </span>
                      )}
                    </div>
                  )}

                  {student.participant.checkedIn && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ Checked In
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/register/bulk"
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all text-center group"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
              Register Students
            </h3>
            <p className="text-blue-100 text-sm">
              Register multiple students for your dance studio
            </p>
          </Link>

          <Link
            href="/"
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all text-center group"
          >
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
              View Schedule
            </h3>
            <p className="text-blue-100 text-sm">
              Check the festival program and workshops
            </p>
          </Link>

          <Link
            href="/information"
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all text-center group"
          >
            <div className="text-4xl mb-3">ℹ️</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
              Festival Info
            </h3>
            <p className="text-blue-100 text-sm">
              Location, schedule, and important details
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
