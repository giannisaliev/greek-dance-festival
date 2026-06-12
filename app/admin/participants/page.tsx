"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";

interface Participant {
  id: string;
  phone: string;
  packageType: string;
  guinnessRecordAttempt: boolean;
  greekNight: boolean;
  createdAt: string;
  registrantFirstName: string | null;
  registrantLastName: string | null;
  studioName: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const PACKAGE_OPTIONS = [
  { key: "guinness-only", label: "Guinness Record Only" },
  { key: "greek-night-only", label: "Greek Night Only" },
  { key: "starter-pass", label: "Starter Pass" },
  { key: "explorer-pass", label: "Explorer Pass" },
  { key: "enthusiast-pass", label: "Enthusiast Pass" },
  { key: "full-pass", label: "Full Pass" },
];

const ADD_ON_FILTERS = [
  { key: "guinness", label: "Guinness Record" },
  { key: "greek-night", label: "Greek Night" },
];

const PASS_FILTERS = [
  { key: "starter-pass", label: "Starter Pass" },
  { key: "explorer-pass", label: "Explorer Pass" },
  { key: "enthusiast-pass", label: "Enthusiast Pass" },
  { key: "full-pass", label: "Full Pass" },
];

const getDisplayName = (participant: Participant) => {
  const firstName = participant.registrantFirstName || participant.user.firstName;
  const lastName = participant.registrantLastName || participant.user.lastName;
  return `${firstName} ${lastName}`.trim();
};

const getStudioOrSelf = (participant: Participant) => {
  if (participant.studioName && participant.studioName.trim().length > 0) {
    return participant.studioName;
  }
  return "Self";
};

export default function AdminParticipantsByPackagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"addons" | "passes">("addons");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedPasses, setSelectedPasses] = useState<string[]>([]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (!(session.user as any)?.isAdmin) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !(session?.user as any)?.isAdmin) {
      return;
    }

    const fetchParticipants = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/participants");
        const data = await response.json();
        const list = Array.isArray(data.participants) ? data.participants : [];
        setParticipants(list);
      } catch (error) {
        console.error("Error fetching participants:", error);
        setParticipants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [session, status]);

  const filteredParticipants = useMemo(() => {
    const activeFilters = activeTab === "addons" ? selectedAddOns : selectedPasses;

    if (activeFilters.length === 0) {
      return participants;
    }

    if (activeTab === "addons") {
      return participants.filter((participant) => {
        return selectedAddOns.some((filterKey) => {
          if (filterKey === "guinness") {
            return participant.guinnessRecordAttempt || participant.packageType === "guinness-only" || participant.packageType === "full-pass";
          }

          if (filterKey === "greek-night") {
            return participant.greekNight || participant.packageType === "greek-night-only" || participant.packageType === "full-pass";
          }

          return false;
        });
      });
    }

    return participants.filter((participant) => selectedPasses.includes(participant.packageType));
  }, [participants, selectedAddOns, selectedPasses, activeTab]);

  const toggleAddOn = (filterKey: string) => {
    setSelectedAddOns((current) =>
      current.includes(filterKey)
        ? current.filter((value) => value !== filterKey)
        : [...current, filterKey]
    );
  };

  const togglePass = (packageKey: string) => {
    setSelectedPasses((current) =>
      current.includes(packageKey)
        ? current.filter((value) => value !== packageKey)
        : [...current, packageKey]
    );
  };

  const clearFilters = () => {
    if (activeTab === "addons") {
      setSelectedAddOns([]);
    } else {
      setSelectedPasses([]);
    }
  };

  const packageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    participants.forEach((participant) => {
      counts[participant.packageType] = (counts[participant.packageType] || 0) + 1;
    });
    return counts;
  }, [participants]);

  const addonCounts = useMemo(() => {
    const counts = { guinness: 0, greekNight: 0 };

    participants.forEach((participant) => {
      if (participant.guinnessRecordAttempt || participant.packageType === "guinness-only" || participant.packageType === "full-pass") {
        counts.guinness += 1;
      }

      if (participant.greekNight || participant.packageType === "greek-night-only" || participant.packageType === "full-pass") {
        counts.greekNight += 1;
      }
    });

    return counts;
  }, [participants]);

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
              <h1 className="text-2xl sm:text-4xl font-bold text-white">Participants by Package</h1>
              <p className="text-blue-100 mt-2">Filter participants by add-ons or by pass type without reloading the table.</p>
            </div>
            <button
              onClick={() => router.push("/admin")}
              className="bg-white/20 text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
            >
              Back to Admin
            </button>
          </div>

          <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("addons")}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === "addons"
                  ? "bg-white text-blue-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Add-ons
            </button>
            <button
              onClick={() => setActiveTab("passes")}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === "passes"
                  ? "bg-white text-blue-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Passes
            </button>
          </div>

          {activeTab === "addons" ? (
            <div className="flex flex-wrap gap-3 mb-3">
              {ADD_ON_FILTERS.map((option) => {
                const count = option.key === "guinness" ? addonCounts.guinness : addonCounts.greekNight;
                const isActive = selectedAddOns.includes(option.key);

                return (
                  <button
                    key={option.key}
                    onClick={() => toggleAddOn(option.key)}
                    className={`text-left rounded-xl border px-4 py-3 transition-all min-w-[200px] ${
                      isActive
                        ? "bg-white text-blue-900 border-white"
                        : "bg-white/5 text-white border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-sm">{option.label}</div>
                      <span className={`text-sm font-bold ${isActive ? "text-blue-900" : "text-blue-100"}`}>
                        {isActive ? "✓" : ""}
                      </span>
                    </div>
                    <div className={`mt-1 text-xl font-bold ${isActive ? "text-blue-900" : "text-blue-100"}`}>{count}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 mb-3">
              {PASS_FILTERS.map((option) => {
                const count = packageCounts[option.key] || 0;
                const isActive = selectedPasses.includes(option.key);

                return (
                  <button
                    key={option.key}
                    onClick={() => togglePass(option.key)}
                    className={`text-left rounded-xl border px-4 py-3 transition-all min-w-[170px] ${
                      isActive
                        ? "bg-white text-blue-900 border-white"
                        : "bg-white/5 text-white border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-sm">{option.label}</div>
                      <span className={`text-sm font-bold ${isActive ? "text-blue-900" : "text-blue-100"}`}>
                        {isActive ? "✓" : ""}
                      </span>
                    </div>
                    <div className={`mt-1 text-xl font-bold ${isActive ? "text-blue-900" : "text-blue-100"}`}>{count}</div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="text-blue-100 text-sm">
              {activeTab === "addons"
                ? selectedAddOns.length === 0
                  ? "Showing all add-on participants"
                  : `Filtering ${selectedAddOns.length} selected add-on${selectedAddOns.length > 1 ? "s" : ""}`
                : selectedPasses.length === 0
                  ? "Showing all pass types"
                  : `Filtering ${selectedPasses.length} selected pass${selectedPasses.length > 1 ? "es" : ""}`}
            </div>
            {(activeTab === "addons" ? selectedAddOns.length : selectedPasses.length) > 0 && (
              <button
                onClick={clearFilters}
                className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-white">Loading participants...</div>
            ) : filteredParticipants.length === 0 ? (
              <div className="p-8 text-center text-blue-100">No participants found for this package.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-b border-white/20 bg-white/5">
                      <th className="text-left text-white font-semibold py-3 px-4">Participant</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Package</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Studio / Self</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Email</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Phone</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Add-ons</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map((participant) => {
                      const packageLabel =
                        PACKAGE_OPTIONS.find((option) => option.key === participant.packageType)?.label || participant.packageType;

                      const showGuinnessTick =
                        participant.guinnessRecordAttempt || participant.packageType === "guinness-only" || participant.packageType === "full-pass";
                      const showGreekNightTick =
                        participant.greekNight || participant.packageType === "greek-night-only" || participant.packageType === "full-pass";

                      return (
                        <tr key={participant.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-white">{getDisplayName(participant)}</td>
                          <td className="py-3 px-4 text-green-200 font-semibold">✓ {packageLabel}</td>
                          <td className="py-3 px-4 text-blue-100">{getStudioOrSelf(participant)}</td>
                          <td className="py-3 px-4 text-blue-100">{participant.user.email}</td>
                          <td className="py-3 px-4 text-blue-100">{participant.phone || "-"}</td>
                          <td className="py-3 px-4 text-blue-100">
                            <div className="flex flex-wrap gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${showGuinnessTick ? "bg-green-500/20 text-green-200 border-green-300/30" : "bg-white/5 text-white/40 border-white/10"}`}>
                                {showGuinnessTick ? "✓" : "✕"} Guinness
                              </span>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${showGreekNightTick ? "bg-green-500/20 text-green-200 border-green-300/30" : "bg-white/5 text-white/40 border-white/10"}`}>
                                {showGreekNightTick ? "✓" : "✕"} Greek Night
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-blue-100">
                            {new Date(participant.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
