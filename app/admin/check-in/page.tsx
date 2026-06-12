"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";

interface ScheduleItem {
  id: string;
  day: string;
  date: string;
  time: string;
  lecturer: string;
  danceStyle: string;
  level: string;
  hall?: string | null;
  color?: string | null;
}

interface ParticipantLite {
  id: string;
  phone: string;
  packageType: string;
  registrantFirstName: string | null;
  registrantLastName: string | null;
  studioName: string | null;
  user: { firstName: string; lastName: string; email: string };
}

interface CheckIn {
  id: string;
  scheduleId: string;
  participantId: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  participant: {
    id: string;
    registrantFirstName: string | null;
    registrantLastName: string | null;
    studioName: string | null;
    packageType: string;
    user: { firstName: string; lastName: string; email: string };
  } | null;
}

const PACKAGE_NAMES: { [key: string]: string } = {
  "guinness-only": "Guinness Record Only",
  "greek-night-only": "Greek Night Only",
  "starter-pass": "Starter Pass",
  "explorer-pass": "Explorer Pass",
  "enthusiast-pass": "Enthusiast Pass",
  "full-pass": "Full Pass",
};

const DAY_ORDER = ["Friday", "Saturday", "Sunday"];
const DATE_MAP: { [key: string]: string } = {
  Friday: "June 12",
  Saturday: "June 13",
  Sunday: "June 14",
};

const participantName = (p: ParticipantLite) =>
  `${p.registrantFirstName || p.user.firstName} ${p.registrantLastName || p.user.lastName}`.trim();

const checkInName = (c: CheckIn) => {
  if (c.participant) {
    return `${c.participant.registrantFirstName || c.participant.user.firstName} ${
      c.participant.registrantLastName || c.participant.user.lastName
    }`.trim();
  }
  return `${c.firstName || ""} ${c.lastName || ""}`.trim();
};

export default function AdminClassCheckInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [participants, setParticipants] = useState<ParticipantLite[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [checkInsLoading, setCheckInsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [walkIn, setWalkIn] = useState({ firstName: "", lastName: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  // Auth guard
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (!(session.user as any)?.isAdmin) {
      router.push("/");
    }
  }, [session, status, router]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [scheduleRes, participantsRes, countsRes] = await Promise.all([
        fetch("/api/schedule"),
        fetch("/api/participants"),
        fetch("/api/class-checkins"),
      ]);
      const scheduleData = await scheduleRes.json();
      const participantsData = await participantsRes.json();
      const countsData = await countsRes.json();

      setScheduleItems(Array.isArray(scheduleData) ? scheduleData : []);
      setParticipants(Array.isArray(participantsData.participants) ? participantsData.participants : []);
      setCounts(countsData.counts || {});
    } catch (error) {
      console.error("Error loading class check-in data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated" || !(session?.user as any)?.isAdmin) return;
    fetchAll();
  }, [session, status]);

  const fetchCheckIns = async (scheduleId: string) => {
    setCheckInsLoading(true);
    try {
      const res = await fetch(`/api/class-checkins?scheduleId=${scheduleId}`);
      const data = await res.json();
      setCheckIns(Array.isArray(data.checkIns) ? data.checkIns : []);
    } catch (error) {
      console.error("Error loading check-ins:", error);
      setCheckIns([]);
    } finally {
      setCheckInsLoading(false);
    }
  };

  const refreshCounts = async () => {
    try {
      const res = await fetch("/api/class-checkins");
      const data = await res.json();
      setCounts(data.counts || {});
    } catch (error) {
      console.error("Error refreshing counts:", error);
    }
  };

  const openClass = (scheduleId: string) => {
    if (openClassId === scheduleId) {
      setOpenClassId(null);
      setCheckIns([]);
      return;
    }
    setOpenClassId(scheduleId);
    setSearchTerm("");
    setWalkIn({ firstName: "", lastName: "", phone: "" });
    setCheckIns([]);
    fetchCheckIns(scheduleId);
  };

  const addParticipant = async (scheduleId: string, participantId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/class-checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, participantId }),
      });
      if (res.ok) {
        setSearchTerm("");
        await fetchCheckIns(scheduleId);
        await refreshCounts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add participant");
      }
    } catch (error) {
      console.error("Error adding participant:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const addWalkIn = async (scheduleId: string) => {
    if (!walkIn.firstName.trim() || !walkIn.lastName.trim()) {
      alert("Please enter a first and last name for the walk-in.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/class-checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, ...walkIn }),
      });
      if (res.ok) {
        setWalkIn({ firstName: "", lastName: "", phone: "" });
        await fetchCheckIns(scheduleId);
        await refreshCounts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add walk-in");
      }
    } catch (error) {
      console.error("Error adding walk-in:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const removeCheckIn = async (checkInId: string, scheduleId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/class-checkins?id=${checkInId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCheckIns(scheduleId);
        await refreshCounts();
      }
    } catch (error) {
      console.error("Error removing check-in:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Participants matching the search box, excluding those already checked into the open class
  const searchResults = useMemo(() => {
    if (!openClassId) return [];
    const alreadyIn = new Set(checkIns.filter((c) => c.participantId).map((c) => c.participantId));
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return participants
      .filter((p) => !alreadyIn.has(p.id))
      .filter((p) => {
        const name = participantName(p).toLowerCase();
        const email = p.user.email.toLowerCase();
        const studio = (p.studioName || "").toLowerCase();
        return name.includes(term) || email.includes(term) || studio.includes(term);
      })
      .slice(0, 8);
  }, [participants, checkIns, searchTerm, openClassId]);

  const totalCheckedIn = useMemo(
    () => Object.values(counts).reduce((sum, n) => sum + n, 0),
    [counts]
  );

  const classesByDay = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    DAY_ORDER.forEach((day) => {
      map[day] = scheduleItems.filter((item) => item.day === day);
    });
    // Any items with an unexpected day get their own bucket
    scheduleItems.forEach((item) => {
      if (!DAY_ORDER.includes(item.day)) {
        if (!map[item.day]) map[item.day] = [];
        map[item.day].push(item);
      }
    });
    return map;
  }, [scheduleItems]);

  if (status === "loading" || !session || !(session.user as any)?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white">Class Check-in</h1>
              <p className="text-blue-100 mt-2">
                Select a class to check in attendees. You can add registered participants or walk-ins.
              </p>
            </div>
            <button
              onClick={() => router.push("/admin")}
              className="bg-white/20 text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
            >
              Back to Admin
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{scheduleItems.length}</div>
              <div className="text-blue-100 text-sm sm:text-base">Classes</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">{totalCheckedIn}</div>
              <div className="text-blue-100 text-sm sm:text-base">Total Class Check-ins</div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-white text-xl py-12">Loading...</div>
          ) : scheduleItems.length === 0 ? (
            <div className="text-center text-blue-100 text-xl py-12">
              No classes found. Add classes in the Schedule tab first.
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(classesByDay)
                .filter((day) => classesByDay[day].length > 0)
                .map((day) => (
                  <div key={day} className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {day}
                      {DATE_MAP[day] ? `, ${DATE_MAP[day]}` : ""}
                    </h3>
                    <div className="space-y-3">
                      {classesByDay[day].map((item) => {
                        const isOpen = openClassId === item.id;
                        const count = counts[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            className="rounded-lg border-2 overflow-hidden"
                            style={{
                              backgroundColor: item.color ? `${item.color}15` : "rgba(255,255,255,0.05)",
                              borderColor: item.color || "rgba(255,255,255,0.1)",
                            }}
                          >
                            {/* Class header */}
                            <button
                              onClick={() => openClass(item.id)}
                              className="w-full px-4 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xl">{isOpen ? "▼" : "▶"}</span>
                                <div>
                                  <div className="text-white font-bold">
                                    {item.danceStyle} <span className="text-blue-200 font-normal">· {item.level}</span>
                                  </div>
                                  <div className="text-blue-200 text-sm">
                                    {item.time}
                                    {item.hall ? ` · ${item.hall}` : ""} · {item.lecturer}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${
                                  count > 0 ? "bg-green-500 text-white" : "bg-white/20 text-white"
                                }`}
                              >
                                {count} checked in
                              </span>
                            </button>

                            {/* Expanded check-in panel */}
                            {isOpen && (
                              <div className="border-t border-white/10 px-4 py-4 space-y-6">
                                {/* Add registered participant */}
                                <div>
                                  <label className="block text-white font-semibold mb-2 text-sm">
                                    Add a registered participant
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      placeholder="Search by name, email, or studio..."
                                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                                    />
                                    {searchTerm.trim() && (
                                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                                        {searchResults.length === 0 ? (
                                          <div className="px-4 py-3 text-gray-500 text-sm">
                                            No matching participants
                                          </div>
                                        ) : (
                                          searchResults.map((p) => (
                                            <button
                                              key={p.id}
                                              type="button"
                                              disabled={submitting}
                                              onClick={() => addParticipant(item.id, p.id)}
                                              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors disabled:opacity-50"
                                            >
                                              <div className="font-medium text-sm">{participantName(p)}</div>
                                              <div className="text-xs text-gray-500">
                                                {p.user.email}
                                                {p.studioName ? ` · 🎭 ${p.studioName}` : ""}
                                                {" · "}
                                                {PACKAGE_NAMES[p.packageType] || p.packageType}
                                              </div>
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Add walk-in */}
                                <div>
                                  <label className="block text-white font-semibold mb-2 text-sm">
                                    Add a walk-in (not registered)
                                  </label>
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                      type="text"
                                      value={walkIn.firstName}
                                      onChange={(e) => setWalkIn({ ...walkIn, firstName: e.target.value })}
                                      placeholder="First name"
                                      className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                                    />
                                    <input
                                      type="text"
                                      value={walkIn.lastName}
                                      onChange={(e) => setWalkIn({ ...walkIn, lastName: e.target.value })}
                                      placeholder="Last name"
                                      className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                                    />
                                    <input
                                      type="text"
                                      value={walkIn.phone}
                                      onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })}
                                      placeholder="Phone (optional)"
                                      className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                                    />
                                    <button
                                      type="button"
                                      disabled={submitting}
                                      onClick={() => addWalkIn(item.id)}
                                      className="px-6 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm whitespace-nowrap disabled:opacity-50"
                                    >
                                      Add Walk-in
                                    </button>
                                  </div>
                                </div>

                                {/* Checked-in list */}
                                <div>
                                  <h4 className="text-white font-bold mb-3 text-sm">
                                    Checked in ({checkIns.length})
                                  </h4>
                                  {checkInsLoading ? (
                                    <div className="text-blue-100 text-sm py-3">Loading...</div>
                                  ) : checkIns.length === 0 ? (
                                    <div className="text-blue-200 text-sm py-3 italic">
                                      No one checked in for this class yet.
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {checkIns.map((c) => {
                                        const isWalkIn = !c.participantId;
                                        return (
                                          <div
                                            key={c.id}
                                            className="flex items-center justify-between gap-3 bg-white/5 rounded-lg px-4 py-2 border border-white/10"
                                          >
                                            <div className="min-w-0">
                                              <div className="text-white text-sm font-medium flex items-center gap-2 flex-wrap">
                                                {checkInName(c)}
                                                {isWalkIn ? (
                                                  <span className="bg-orange-500/30 text-orange-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                    Walk-in
                                                  </span>
                                                ) : c.participant?.studioName ? (
                                                  <span className="bg-purple-500/30 text-purple-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                    🎭 {c.participant.studioName}
                                                  </span>
                                                ) : null}
                                              </div>
                                              <div className="text-blue-200 text-xs truncate">
                                                {isWalkIn
                                                  ? c.phone || "—"
                                                  : `${c.participant?.user.email} · ${
                                                      PACKAGE_NAMES[c.participant?.packageType || ""] ||
                                                      c.participant?.packageType
                                                    }`}
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => removeCheckIn(c.id, item.id)}
                                              disabled={submitting}
                                              className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                                              title="Remove check-in"
                                            >
                                              <span className="text-white text-sm">×</span>
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
