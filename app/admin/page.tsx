"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "../components/Navigation";

interface Participant {
  id: string;
  phone: string;
  packageType: string;
  checkedIn: boolean;
  createdAt: string;
  registrantFirstName: string | null;
  registrantLastName: string | null;
  registeredBy: string | null;
  studioName: string | null;
  guinnessRecordAttempt: boolean;
  greekNight: boolean;
  totalPrice: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  emailVerified: string | null;
  createdAt: string;
  image: string | null;
}

interface Teacher {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isTeacher: boolean;
  studioName: string | null;
  participant?: {
    id: string;
    packageType: string;
    phone: string;
    guinnessRecordAttempt: boolean;
    greekNight: boolean;
    totalPrice: number;
    checkedIn: boolean;
    registrantFirstName: string | null;
    registrantLastName: string | null;
  } | null;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"participants" | "schedule" | "settings" | "users">("participants");
  
  // Check authentication and admin status
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

  // Show loading while checking auth
  if (status === "loading" || !session || !(session.user as any)?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  // Participants state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0,
  });

  // Schedule state
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    day: "Friday",
    date: "June 12",
    time: "",
    lecturer: "",
    danceStyle: "",
    level: "Beginner",
    hall: "Hall 1",
    color: "#FF6B6B",
  });

  // Settings state
  const [settings, setSettings] = useState({
    registrationOpen: false,
    registrationMessage: "Registration opens on March 1st, 2026",
    showTbaTeachers: false,
    tbaTeachersCount: 3,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersSearchQuery, setUsersSearchQuery] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch participants
  const fetchParticipants = async (query = "") => {
    setIsLoading(true);
    try {
      const url = query
        ? `/api/participants?q=${encodeURIComponent(query)}`
        : "/api/participants";
      const response = await fetch(url);
      const data = await response.json();
      const participantsList = Array.isArray(data.participants) ? data.participants : [];
      const teachersList = Array.isArray(data.teachers) ? data.teachers : [];
      setParticipants(participantsList);
      setTeachers(teachersList);
      
      const total = participantsList.length;
      const checkedIn = participantsList.filter((p: Participant) => p.checkedIn).length;
      setStats({
        total,
        checkedIn,
        pending: total - checkedIn,
      });
    } catch (error) {
      console.error("Error fetching participants:", error);
      setParticipants([]);
      setTeachers([]);
      setStats({ total: 0, checkedIn: 0, pending: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch schedule
  const fetchSchedule = async () => {
    try {
      const response = await fetch("/api/schedule");
      const data = await response.json();
      setScheduleItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setScheduleItems([]);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      setSettings({
        registrationOpen: data.registrationOpen || false,
        registrationMessage: data.registrationMessage || "Registration opens on March 1st, 2026",
        showTbaTeachers: data.showTbaTeachers || false,
        tbaTeachersCount: data.tbaTeachersCount || 3,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  // Save settings
  const saveSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Toggle registration status
  const toggleRegistration = async () => {
    const newSettings = { ...settings, registrationOpen: !settings.registrationOpen };
    setSettings(newSettings);
    setSettingsLoading(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });
    } catch (error) {
      console.error("Error toggling registration:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async (query = "") => {
    setUsersLoading(true);
    try {
      const url = query
        ? `/api/users?q=${encodeURIComponent(query)}`
        : "/api/users";
      const response = await fetch(url);
      const data = await response.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchSchedule();
    fetchSettings();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchParticipants(searchQuery);
  };

  // Generate search suggestions
  const updateSearchSuggestions = (value: string) => {
    setSearchQuery(value);
    if (value.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const suggestions = new Set<string>();
    const lowerValue = value.toLowerCase();

    participants.forEach(p => {
      const firstName = (p.registrantFirstName || p.user.firstName || "").toLowerCase();
      const lastName = (p.registrantLastName || p.user.lastName || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const email = p.user.email.toLowerCase();
      const studio = (p.studioName || "").toLowerCase();

      if (fullName.includes(lowerValue) && fullName) suggestions.add(`${p.registrantFirstName || p.user.firstName} ${p.registrantLastName || p.user.lastName}`);
      if (email.includes(lowerValue) && email !== "-") suggestions.add(p.user.email);
      if (studio.includes(lowerValue) && studio) suggestions.add(p.studioName!);
    });

    setSearchSuggestions(Array.from(suggestions).slice(0, 8));
    setShowSuggestions(true);
  };

  const handleCheckIn = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/participants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          checkedIn: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchParticipants(searchQuery);
        
        // Generate QR code if checking in
        if (!currentStatus) {
          const QRCode = (await import('qrcode')).default;
          const qrData = JSON.stringify({
            participantId: id,
            checkedInAt: new Date().toISOString(),
            festivalName: "Greek Dance Festival 2026"
          });
          const qrCodeUrl = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
              dark: '#1e40af',
              light: '#ffffff'
            }
          });
          setQrCodes(prev => ({ ...prev, [id]: qrCodeUrl }));
        } else {
          // Remove QR code if undoing check-in
          setQrCodes(prev => {
            const newQrCodes = { ...prev };
            delete newQrCodes[id];
            return newQrCodes;
          });
        }
      }
    } catch (error) {
      console.error("Error updating check-in status:", error);
    }
  };

  const toggleTeacherExpansion = (userId: string) => {
    setExpandedTeachers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Group participants by registeredBy
  const groupedParticipants = () => {
    let individualParticipants = participants.filter(p => !p.registeredBy);
    const teacherGroups: { [key: string]: Participant[] } = {};
    
    participants.forEach(p => {
      if (p.registeredBy) {
        if (!teacherGroups[p.registeredBy]) {
          teacherGroups[p.registeredBy] = [];
        }
        teacherGroups[p.registeredBy].push(p);
      }
    });

    // Filter duplicates if enabled
    if (showDuplicates) {
      const duplicateEmails = getDuplicateEmails();
      individualParticipants = individualParticipants.filter(p => duplicateEmails.has(p.user.email));
      
      // Filter teacher groups to only show those with duplicate students
      Object.keys(teacherGroups).forEach(teacherId => {
        teacherGroups[teacherId] = teacherGroups[teacherId].filter(p => duplicateEmails.has(p.user.email));
        if (teacherGroups[teacherId].length === 0) {
          delete teacherGroups[teacherId];
        }
      });
    }

    return { individualParticipants, teacherGroups };
  };

  // Find duplicate emails
  const getDuplicateEmails = () => {
    const emailCounts = new Map<string, number>();
    participants.forEach(p => {
      const email = p.user.email.toLowerCase();
      emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
    });
    
    const duplicates = new Set<string>();
    emailCounts.forEach((count, email) => {
      if (count > 1) {
        duplicates.add(email);
      }
    });
    
    return duplicates;
  };

  const duplicateCount = getDuplicateEmails().size;

  // Schedule handlers
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/schedule";
      const method = editingSchedule ? "PUT" : "POST";
      const body = editingSchedule
        ? { id: editingSchedule.id, ...scheduleForm }
        : scheduleForm;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchSchedule();
        setShowScheduleForm(false);
        setEditingSchedule(null);
        setScheduleForm({
          day: "Friday",
          date: "June 12",
          time: "",
          lecturer: "",
          danceStyle: "",
          level: "Beginner",
          hall: "Hall 1",
          color: "#FF6B6B",
        });
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  const handleEditSchedule = (item: ScheduleItem) => {
    setEditingSchedule(item);
    setScheduleForm({
      day: item.day,
      date: item.date,
      time: item.time,
      lecturer: item.lecturer,
      danceStyle: item.danceStyle,
      level: item.level,
      hall: item.hall || "Hall 1",
      color: item.color || "#FF6B6B",
    });
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule item?")) return;
    
    try {
      const response = await fetch(`/api/schedule?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSchedule();
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-white">Admin Dashboard</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/admin/analytics"
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:from-indigo-600 hover:to-blue-600 transition-all shadow-lg text-sm sm:text-base text-center"
              >
                📊 Analytics
              </Link>
              <Link
                href="/admin/hotels"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg text-sm sm:text-base text-center"
              >
                🏨 Manage Hotels
              </Link>
              <Link
                href="/admin/teachers"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg text-sm sm:text-base text-center"
              >
                👨‍🏫 Manage Teachers
              </Link>
              <Link
                href="/admin/attractions"
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:from-green-600 hover:to-teal-600 transition-all shadow-lg text-sm sm:text-base text-center"
              >
                🏛️ Manage Attractions
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("participants")}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === "participants"
                  ? "bg-white text-blue-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Participants
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === "schedule"
                  ? "bg-white text-blue-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === "settings"
                  ? "bg-white text-blue-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => {
                setActiveTab("users");
                fetchUsers();
              }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === "users"
                  ? "bg-white text-blue-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Users
            </button>
          </div>

          {/* Participants Tab */}
          {activeTab === "participants" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{stats.total}</div>
                  <div className="text-blue-100 text-sm sm:text-base">Total Participants</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">{stats.checkedIn}</div>
                  <div className="text-blue-100 text-sm sm:text-base">Checked In</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">{stats.pending}</div>
                  <div className="text-blue-100 text-sm sm:text-base">Pending Check-in</div>
                </div>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => updateSearchSuggestions(e.target.value)}
                      onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Search by name, email, studio, or phone..."
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
                    />
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                        {searchSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSearchQuery(suggestion);
                              setShowSuggestions(false);
                              fetchParticipants(suggestion);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-6 sm:px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm sm:text-base"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowDuplicates(false);
                      fetchParticipants();
                    }}
                    className="px-6 sm:px-8 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm sm:text-base"
                  >
                    Clear
                  </button>
                </div>
              </form>

              {/* Duplicate Filter */}
              <div className="mb-8 flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDuplicates(!showDuplicates)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                      showDuplicates
                        ? "bg-yellow-500 text-white"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {showDuplicates ? "✓ " : ""}Show Duplicate Emails Only
                  </button>
                  {duplicateCount > 0 && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {duplicateCount} duplicate email{duplicateCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="text-blue-100 text-sm">
                  {showDuplicates ? "Showing only participants with duplicate emails" : "Showing all participants"}
                </div>
              </div>

              {/* Participants List */}
              {isLoading ? (
                <div className="text-center text-white text-xl py-12">Loading...</div>
              ) : participants.length === 0 ? (
                <div className="text-center text-blue-100 text-xl py-12">
                  No participants found
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Individual Participants */}
                  {groupedParticipants().individualParticipants.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">Individual Registrations</h3>
                      <div className="overflow-x-auto bg-white/5 rounded-xl border border-white/10">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/20">
                              <th className="text-left text-white font-semibold py-4 px-4">Name</th>
                              <th className="text-left text-white font-semibold py-4 px-4">Email</th>
                              <th className="text-left text-white font-semibold py-4 px-4">Phone</th>
                              <th className="text-left text-white font-semibold py-4 px-4">Registered By</th>
                              <th className="text-left text-white font-semibold py-4 px-4">Package</th>
                              <th className="text-left text-white font-semibold py-4 px-4">Add-ons</th>
                              <th className="text-left text-white font-semibold py-4 px-4">Price</th>
                              <th className="text-left text-white font-semibold py-4 px-4">Status</th>
                              <th className="text-left text-white font-semibold py-4 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedParticipants().individualParticipants.map((participant) => {
                              const registeredByTeacher = participant.registeredBy ? teachers.find(t => t.id === participant.registeredBy) : null;
                              
                              return (
                              <tr
                                key={participant.id}
                                className="border-b border-white/10 hover:bg-white/5 transition-colors"
                              >
                                <td className="py-4 px-4 text-white">
                                  {participant.registrantFirstName || participant.user.firstName} {participant.registrantLastName || participant.user.lastName}
                                </td>
                                <td className="py-4 px-4 text-blue-100">{participant.user.email}</td>
                                <td className="py-4 px-4 text-blue-100">{participant.phone || "—"}</td>
                                <td className="py-4 px-4">
                                  {registeredByTeacher ? (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-white font-medium">{registeredByTeacher.firstName} {registeredByTeacher.lastName}</span>
                                      {participant.studioName && (
                                        <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded w-fit">🏢 {participant.studioName}</span>
                                      )}
                                      <span className="text-xs text-blue-300">{registeredByTeacher.email}</span>
                                    </div>
                                  ) : (
                                    <span className="text-blue-200 text-sm italic">Self-registered</span>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-blue-100">{participant.packageType}</td>
                                <td className="py-4 px-4 text-blue-100">
                                  <div className="flex gap-1">
                                    {participant.guinnessRecordAttempt && (
                                      <span className="text-xs bg-blue-500/30 px-2 py-1 rounded">🏆</span>
                                    )}
                                    {participant.greekNight && (
                                      <span className="text-xs bg-purple-500/30 px-2 py-1 rounded">🍷</span>
                                    )}
                                    {!participant.guinnessRecordAttempt && !participant.greekNight && "—"}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-blue-100">€{participant.totalPrice}</td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                      participant.checkedIn
                                        ? "bg-green-500 text-white"
                                        : "bg-yellow-500 text-white"
                                    }`}
                                  >
                                    {participant.checkedIn ? "✓ Checked In" : "Pending"}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex flex-col gap-2">
                                    <button
                                      onClick={() => handleCheckIn(participant.id, participant.checkedIn)}
                                      className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                                        participant.checkedIn
                                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                          : "bg-green-500 hover:bg-green-600 text-white"
                                      }`}
                                    >
                                      {participant.checkedIn ? "Undo" : "Check In"}
                                    </button>
                                    {participant.checkedIn && qrCodes[participant.id] && (
                                      <button
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.download = `qr-${participant.user.firstName}-${participant.user.lastName}.png`;
                                          link.href = qrCodes[participant.id];
                                          link.click();
                                        }}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-sm"
                                      >
                                        📥 QR
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )})}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Teacher Groups */}
                  {Object.keys(groupedParticipants().teacherGroups).length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">Teacher/Studio Registrations</h3>
                      <div className="space-y-4">
                        {Object.entries(groupedParticipants().teacherGroups).map(([teacherId, students]) => {
                          const teacher = teachers.find(t => t.id === teacherId);
                          if (!teacher) return null;

                          const isExpanded = expandedTeachers.has(teacherId);
                          const totalStudents = students.length;
                          const checkedInStudents = students.filter(s => s.checkedIn).length;

                          return (
                            <div key={teacherId} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                              {/* Teacher Header - Clickable */}
                              <button
                                onClick={() => toggleTeacherExpansion(teacherId)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <span className="text-2xl">{isExpanded ? "▼" : "▶"}</span>
                                  <div className="text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-bold text-lg">
                                        {teacher.participant?.registrantFirstName || teacher.firstName} {teacher.participant?.registrantLastName || teacher.lastName}
                                      </span>
                                      {teacher.studioName && (
                                        <span className="bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full text-xs font-semibold">
                                          🏢 {teacher.studioName}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-blue-200 text-sm">{teacher.email}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="text-white font-bold">{totalStudents} Students</div>
                                    <div className="text-blue-200 text-sm">{checkedInStudents} checked in</div>
                                  </div>
                                  {teacher.participant && (
                                    <div className={`px-4 py-2 rounded-lg font-semibold ${
                                      teacher.participant.checkedIn ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                                    }`}>
                                      Teacher: {teacher.participant.checkedIn ? "✓" : "Pending"}
                                    </div>
                                  )}
                                </div>
                              </button>

                              {/* Teacher Details */}
                              {isExpanded && (
                                <div className="border-t border-white/10">
                                  {/* Teacher's Own Registration (if exists) */}
                                  {teacher.participant && (
                                    <div className="px-6 py-4 bg-blue-900/30">
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-white font-bold">Teacher Registration</h4>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                        <div>
                                          <div className="text-blue-200">Package</div>
                                          <div className="text-white">{teacher.participant.packageType}</div>
                                        </div>
                                        <div>
                                          <div className="text-blue-200">Phone</div>
                                          <div className="text-white">{teacher.participant.phone || "—"}</div>
                                        </div>
                                        <div>
                                          <div className="text-blue-200">Add-ons</div>
                                          <div className="text-white">
                                            {teacher.participant.guinnessRecordAttempt && "🏆 "}
                                            {teacher.participant.greekNight && "🍷 "}
                                            {!teacher.participant.guinnessRecordAttempt && !teacher.participant.greekNight && "—"}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-blue-200">Price</div>
                                          <div className="text-white font-bold">€{teacher.participant.totalPrice}</div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleCheckIn(teacher.participant!.id, teacher.participant!.checkedIn)}
                                          className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                                            teacher.participant.checkedIn
                                              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                              : "bg-green-500 hover:bg-green-600 text-white"
                                          }`}
                                        >
                                          {teacher.participant.checkedIn ? "Undo Check-in" : "Check In Teacher"}
                                        </button>
                                        {teacher.participant.checkedIn && qrCodes[teacher.participant.id] && (
                                          <button
                                            onClick={() => {
                                              const link = document.createElement('a');
                                              link.download = `qr-teacher-${teacher.firstName}-${teacher.lastName}.png`;
                                              link.href = qrCodes[teacher.participant!.id];
                                              link.click();
                                            }}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-sm"
                                          >
                                            📥 Download QR Code
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Teacher info if no participant record */}
                                  {!teacher.participant && (
                                    <div className="px-6 py-4 bg-blue-900/20">
                                      <p className="text-blue-200 text-sm">
                                        <span className="font-semibold text-white">{teacher.firstName} {teacher.lastName}</span> has not registered themselves yet.
                                      </p>
                                    </div>
                                  )}

                                  {/* Students List */}
                                  <div className="px-6 py-4">
                                    <h4 className="text-white font-bold mb-3">Registered Students ({totalStudents})</h4>
                                    <div className="overflow-x-auto">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="border-b border-white/20">
                                            <th className="text-left text-white font-semibold py-2 px-2 text-sm">Name</th>
                                            <th className="text-left text-white font-semibold py-2 px-2 text-sm">Email</th>
                                            <th className="text-left text-white font-semibold py-2 px-2 text-sm">Studio</th>
                                            <th className="text-left text-white font-semibold py-2 px-2 text-sm">Package</th>
                                            <th className="text-left text-white font-semibold py-2 px-2 text-sm">Add-ons</th>
                                            <th className="text-left text-white font-semibold py-2 px-2 text-sm">Price</th>
                                            <th className="text-left text-white font-semibold py-2 px-2 text-sm">Status</th>
                                            <th className="text-left text-white font-semibold py-2 px-2 text-sm">Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {students.map((student) => (
                                            <tr key={student.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                              <td className="py-3 px-2 text-white text-sm">
                                                {student.registrantFirstName} {student.registrantLastName}
                                              </td>
                                              <td className="py-3 px-2 text-blue-100 text-sm">{student.user.email}</td>
                                              <td className="py-3 px-2 text-sm">
                                                {student.studioName ? (
                                                  <span className="bg-purple-500/30 text-purple-200 px-2 py-1 rounded text-xs">🏢 {student.studioName}</span>
                                                ) : (
                                                  <span className="text-blue-200">—</span>
                                                )}
                                              </td>
                                              <td className="py-3 px-2 text-blue-100 text-sm">{student.packageType}</td>
                                              <td className="py-3 px-2 text-blue-100 text-sm">
                                                {student.guinnessRecordAttempt && "🏆 "}
                                                {student.greekNight && "🍷 "}
                                                {!student.guinnessRecordAttempt && !student.greekNight && "—"}
                                              </td>
                                              <td className="py-3 px-2 text-blue-100 text-sm">€{student.totalPrice}</td>
                                              <td className="py-3 px-2">
                                                <span
                                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    student.checkedIn
                                                      ? "bg-green-500 text-white"
                                                      : "bg-yellow-500 text-white"
                                                  }`}
                                                >
                                                  {student.checkedIn ? "✓" : "Pending"}
                                                </span>
                                              </td>
                                              <td className="py-3 px-2">
                                                <div className="flex gap-1">
                                                  <button
                                                    onClick={() => handleCheckIn(student.id, student.checkedIn)}
                                                    className={`px-3 py-1 rounded-lg font-semibold transition-colors text-xs ${
                                                      student.checkedIn
                                                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                                        : "bg-green-500 hover:bg-green-600 text-white"
                                                    }`}
                                                  >
                                                    {student.checkedIn ? "Undo" : "Check In"}
                                                  </button>
                                                  {student.checkedIn && qrCodes[student.id] && (
                                                    <button
                                                      onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.download = `qr-${student.registrantFirstName}-${student.registrantLastName}.png`;
                                                        link.href = qrCodes[student.id];
                                                        link.click();
                                                      }}
                                                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-xs"
                                                    >
                                                      📥
                                                    </button>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Schedule Tab */}
          {activeTab === "schedule" && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => {
                    setShowScheduleForm(!showScheduleForm);
                    setEditingSchedule(null);
                    setScheduleForm({
                      day: "Friday",
                      date: "June 12",
                      time: "",
                      lecturer: "",
                      danceStyle: "",
                      level: "Beginner",
                      hall: "Hall 1",
                      color: "#FF6B6B",
                    });
                  }}
                  className="px-6 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  {showScheduleForm ? "Cancel" : "Add New Schedule Item"}
                </button>
              </div>

              {/* Schedule Form */}
              {showScheduleForm && (
                <form onSubmit={handleScheduleSubmit} className="bg-white/5 rounded-xl p-4 sm:p-6 mb-8 border border-white/10">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                    {editingSchedule ? "Edit Schedule Item" : "Add New Schedule Item"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-white font-semibold mb-2">Day</label>
                      <select
                        value={scheduleForm.day}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        required
                      >
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">Date</label>
                      <select
                        value={scheduleForm.date}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        required
                      >
                        <option value="June 12">June 12</option>
                        <option value="June 13">June 13</option>
                        <option value="June 14">June 14</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">Time</label>
                      <input
                        type="text"
                        value={scheduleForm.time}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                        placeholder="e.g., 10:00 - 11:30"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">Lecturer</label>
                      <input
                        type="text"
                        value={scheduleForm.lecturer}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, lecturer: e.target.value })}
                        placeholder="Lecturer name"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">Dance Style</label>
                      <input
                        type="text"
                        value={scheduleForm.danceStyle}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, danceStyle: e.target.value })}
                        placeholder="e.g., Syrtos, Kalamatianos"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">Level</label>
                      <select
                        value={scheduleForm.level}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, level: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        required
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">Hall (Optional)</label>
                      <select
                        value={scheduleForm.hall}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, hall: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <option value="">None (for special events)</option>
                        <option value="Hall 1">Hall 1</option>
                        <option value="Hall 2">Hall 2</option>
                        <option value="Hall 3">Hall 3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">Color</label>
                      <input
                        type="color"
                        value={scheduleForm.color}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, color: e.target.value })}
                        className="w-full h-12 rounded-lg bg-white/10 border border-white/20 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                      {editingSchedule ? "Update Schedule Item" : "Add Schedule Item"}
                    </button>
                  </div>
                </form>
              )}

              {/* Schedule List */}
              <div className="space-y-8">
                {["Friday", "Saturday", "Sunday"].map((day) => {
                  const dayItems = scheduleItems.filter((item) => item.day === day);
                  const dateMap: { [key: string]: string } = {
                    Friday: "June 12",
                    Saturday: "June 13",
                    Sunday: "June 14",
                  };
                  
                  return (
                    <div key={day} className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {day}, {dateMap[day]}
                      </h3>
                      {dayItems.length === 0 ? (
                        <p className="text-blue-100">No schedule items for this day yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {dayItems.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-lg p-4 border-2"
                              style={{
                                backgroundColor: item.color ? `${item.color}15` : 'rgba(255,255,255,0.05)',
                                borderColor: item.color || 'rgba(255,255,255,0.1)'
                              }}
                            >
                              {/* Desktop View */}
                              <div className="hidden md:flex justify-between items-center">
                                <div className="grid grid-cols-5 gap-4 flex-1">
                                  <div>
                                    <div className="text-sm text-blue-200">Time</div>
                                    <div className="text-white font-semibold">{item.time}</div>
                                  </div>
                                  {item.hall && (
                                    <div>
                                      <div className="text-sm text-blue-200">Hall</div>
                                      <div className="text-white font-semibold">{item.hall}</div>
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm text-blue-200">Dance Style</div>
                                    <div className="text-white font-semibold">{item.danceStyle}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-blue-200">Lecturer</div>
                                    <div className="text-white font-semibold">{item.lecturer}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-blue-200">Level</div>
                                    <div className="text-white font-semibold">{item.level}</div>
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => handleEditSchedule(item)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchedule(item.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              
                              {/* Mobile View */}
                              <div className="md:hidden space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-xs text-blue-200 mb-1">Time</div>
                                    <div className="text-white font-semibold text-sm">{item.time}</div>
                                  </div>
                                  {item.hall && (
                                    <div>
                                      <div className="text-xs text-blue-200 mb-1">Hall</div>
                                      <div className="text-white font-semibold text-sm">{item.hall}</div>
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-xs text-blue-200 mb-1">Dance Style</div>
                                    <div className="text-white font-semibold text-sm">{item.danceStyle}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-blue-200 mb-1">Lecturer</div>
                                    <div className="text-white font-semibold text-sm">{item.lecturer}</div>
                                  </div>
                                  <div className="col-span-2">
                                    <div className="text-xs text-blue-200 mb-1">Level</div>
                                    <div className="text-white font-semibold text-sm">{item.level}</div>
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-white/10">
                                  <button
                                    onClick={() => handleEditSchedule(item)}
                                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchedule(item.id)}
                                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <>
              <div className="space-y-8">
                {/* Registration Toggle */}
                <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Registration Status</h3>
                      <p className="text-blue-100">Control whether new registrations are accepted</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-semibold ${settings.registrationOpen ? 'text-green-400' : 'text-red-400'}`}>
                        {settings.registrationOpen ? 'OPEN' : 'CLOSED'}
                      </span>
                      <button
                        onClick={toggleRegistration}
                        disabled={settingsLoading}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
                          settings.registrationOpen ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.registrationOpen ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  {/* Status indicator card */}
                  <div className={`rounded-xl p-6 border ${
                    settings.registrationOpen 
                      ? 'bg-green-500/20 border-green-500/50' 
                      : 'bg-red-500/20 border-red-500/50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        settings.registrationOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`} />
                      <span className="text-white font-semibold text-lg">
                        {settings.registrationOpen 
                          ? 'Registration is currently accepting new participants' 
                          : 'Registration is closed - visitors will see the coming soon page'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Closed Registration Message */}
                <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-4">Closed Registration Message</h3>
                  <p className="text-blue-100 mb-6">
                    This message will be displayed when registration is closed
                  </p>
                  <textarea
                    value={settings.registrationMessage}
                    onChange={(e) => setSettings({ ...settings, registrationMessage: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                    placeholder="Enter message to display when registration is closed..."
                  />
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={saveSettings}
                      disabled={settingsLoading}
                      className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      {settingsLoading ? 'Saving...' : 'Save Message'}
                    </button>
                    {settingsSaved && (
                      <span className="text-green-400 font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Settings saved!
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-4">Quick Actions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setSettings({ ...settings, registrationOpen: true });
                        toggleRegistration();
                      }}
                      disabled={settings.registrationOpen}
                      className="p-6 bg-green-500/20 border border-green-500/50 rounded-xl text-left hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-green-400 font-bold text-lg mb-1">Open Registration</div>
                      <div className="text-green-200 text-sm">Allow new participants to register</div>
                    </button>
                    <button
                      onClick={() => {
                        setSettings({ ...settings, registrationOpen: false });
                        toggleRegistration();
                      }}
                      disabled={!settings.registrationOpen}
                      className="p-6 bg-red-500/20 border border-red-500/50 rounded-xl text-left hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-red-400 font-bold text-lg mb-1">Close Registration</div>
                      <div className="text-red-200 text-sm">Stop accepting new registrations</div>
                    </button>
                  </div>
                </div>

                {/* TBA Teachers Settings */}
                <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-4">TBA Teacher Cards</h3>
                  <p className="text-blue-100 mb-6">
                    Show placeholder cards for teachers that will be announced soon
                  </p>
                  
                  <div className="space-y-6">
                    {/* Toggle TBA Teachers */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">Show TBA Cards</div>
                        <div className="text-blue-200 text-sm">Display placeholder cards on the Teachers page</div>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, showTbaTeachers: !settings.showTbaTeachers })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          settings.showTbaTeachers ? 'bg-green-500' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.showTbaTeachers ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Number of TBA Cards */}
                    {settings.showTbaTeachers && (
                      <div>
                        <label className="block text-white font-semibold mb-2">Number of TBA Cards</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={settings.tbaTeachersCount}
                            onChange={(e) => setSettings({ ...settings, tbaTeachersCount: Number(e.target.value) })}
                            className="flex-1"
                          />
                          <span className="text-white font-bold text-xl min-w-[40px] text-center">{settings.tbaTeachersCount}</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={saveSettings}
                      disabled={settingsLoading}
                      className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      {settingsLoading ? 'Saving...' : 'Save TBA Settings'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <>
              <div className="space-y-6">
                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={usersSearchQuery}
                    onChange={(e) => setUsersSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        fetchUsers(usersSearchQuery);
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 text-sm sm:text-base"
                  />
                  <button
                    onClick={() => fetchUsers(usersSearchQuery)}
                    disabled={usersLoading}
                    className="px-4 sm:px-6 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {usersLoading ? "Searching..." : "Search"}
                  </button>
                  <button
                    onClick={() => {
                      setUsersSearchQuery("");
                      fetchUsers("");
                    }}
                    className="px-4 sm:px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm sm:text-base"
                  >
                    Clear
                  </button>
                </div>

                {/* Users Table/Cards */}
                <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-white font-semibold">Name</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Email</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Verified</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {usersLoading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-blue-100">
                              Loading users...
                            </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-blue-100">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {user.image && (
                                    <img
                                      src={user.image}
                                      alt={user.firstName}
                                      className="w-10 h-10 rounded-full"
                                    />
                                  )}
                                  <div>
                                    <div className="text-white font-semibold">
                                      {user.firstName} {user.lastName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-blue-100">{user.email}</td>
                              <td className="px-6 py-4">
                                {user.isAdmin ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/50">
                                    🛡️ Admin
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/50">
                                    User
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {user.emailVerified ? (
                                  <span className="text-green-400">✓ Verified</span>
                                ) : (
                                  <span className="text-gray-400">Not verified</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-blue-100">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-white/10">
                    {usersLoading ? (
                      <div className="px-4 py-12 text-center text-blue-100">
                        Loading users...
                      </div>
                    ) : users.length === 0 ? (
                      <div className="px-4 py-12 text-center text-blue-100">
                        No users found
                      </div>
                    ) : (
                      users.map((user) => (
                        <div key={user.id} className="p-4 hover:bg-white/5 transition-colors">
                          <div className="flex items-start gap-3 mb-3">
                            {user.image && (
                              <img
                                src={user.image}
                                alt={user.firstName}
                                className="w-12 h-12 rounded-full"
                              />
                            )}
                            <div className="flex-1">
                              <div className="text-white font-semibold text-lg">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-blue-100 text-sm break-all">{user.email}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div>
                              <div className="text-xs text-blue-200 mb-1">Status</div>
                              {user.isAdmin ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/50">
                                  🛡️ Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/50">
                                  User
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="text-xs text-blue-200 mb-1">Verified</div>
                              {user.emailVerified ? (
                                <span className="text-green-400 text-sm">✓ Verified</span>
                              ) : (
                                <span className="text-gray-400 text-sm">Not verified</span>
                              )}
                            </div>
                            <div className="col-span-2">
                              <div className="text-xs text-blue-200 mb-1">Joined</div>
                              <div className="text-blue-100 text-sm">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{users.length}</div>
                    <div className="text-blue-100 text-sm sm:text-base">Total Users</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
                      {users.filter(u => u.isAdmin).length}
                    </div>
                    <div className="text-blue-100 text-sm sm:text-base">Admins</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
                      {users.filter(u => u.emailVerified).length}
                    </div>
                    <div className="text-blue-100 text-sm sm:text-base">Verified Users</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
