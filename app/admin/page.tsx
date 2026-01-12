"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";

interface Participant {
  id: string;
  phone: string;
  packageType: string;
  checkedIn: boolean;
  createdAt: string;
  user: {
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
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"participants" | "schedule" | "settings">("participants");
  
  // Participants state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  });

  // Settings state
  const [settings, setSettings] = useState({
    registrationOpen: false,
    registrationMessage: "Registration opens on March 1st, 2026",
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Fetch participants
  const fetchParticipants = async (query = "") => {
    setIsLoading(true);
    try {
      const url = query
        ? `/api/participants?q=${encodeURIComponent(query)}`
        : "/api/participants";
      const response = await fetch(url);
      const data = await response.json();
      setParticipants(data.participants || []);
      
      const total = data.participants.length;
      const checkedIn = data.participants.filter((p: Participant) => p.checkedIn).length;
      setStats({
        total,
        checkedIn,
        pending: total - checkedIn,
      });
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch schedule
  const fetchSchedule = async () => {
    try {
      const response = await fetch("/api/schedule");
      const data = await response.json();
      setScheduleItems(data || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
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
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (error) {
      console.error("Error toggling registration:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchSchedule();
    fetchSettings();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParticipants(searchQuery);
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
      }
    } catch (error) {
      console.error("Error updating check-in status:", error);
    }
  };

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
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h2>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("participants")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "participants"
                  ? "bg-white text-blue-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Participants
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "schedule"
                  ? "bg-white text-blue-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Schedule Management
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "settings"
                  ? "bg-white text-blue-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Settings
            </button>
          </div>

          {/* Participants Tab */}
          {activeTab === "participants" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
                  <div className="text-blue-100">Total Participants</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="text-3xl font-bold text-green-400 mb-2">{stats.checkedIn}</div>
                  <div className="text-blue-100">Checked In</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.pending}</div>
                  <div className="text-blue-100">Pending Check-in</div>
                </div>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="submit"
                    className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      fetchParticipants();
                    }}
                    className="px-8 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </form>

              {/* Participants List */}
              {isLoading ? (
                <div className="text-center text-white text-xl py-12">Loading...</div>
              ) : participants.length === 0 ? (
                <div className="text-center text-blue-100 text-xl py-12">
                  No participants found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left text-white font-semibold py-4 px-4">Name</th>
                        <th className="text-left text-white font-semibold py-4 px-4">Email</th>
                        <th className="text-left text-white font-semibold py-4 px-4">Phone</th>
                        <th className="text-left text-white font-semibold py-4 px-4">Package</th>
                        <th className="text-left text-white font-semibold py-4 px-4">Status</th>
                        <th className="text-left text-white font-semibold py-4 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant) => (
                        <tr
                          key={participant.id}
                          className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-4 text-white">
                            {participant.user.firstName} {participant.user.lastName}
                          </td>
                          <td className="py-4 px-4 text-blue-100">{participant.user.email}</td>
                          <td className="py-4 px-4 text-blue-100">{participant.phone}</td>
                          <td className="py-4 px-4 text-blue-100">{participant.packageType}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                participant.checkedIn
                                  ? "bg-green-500 text-white"
                                  : "bg-yellow-500 text-white"
                              }`}
                            >
                              {participant.checkedIn ? "Checked In" : "Pending"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleCheckIn(participant.id, participant.checkedIn)}
                              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                participant.checkedIn
                                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                  : "bg-green-500 hover:bg-green-600 text-white"
                              }`}
                            >
                              {participant.checkedIn ? "Undo Check-in" : "Check In"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    });
                  }}
                  className="px-6 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  {showScheduleForm ? "Cancel" : "Add New Schedule Item"}
                </button>
              </div>

              {/* Schedule Form */}
              {showScheduleForm && (
                <form onSubmit={handleScheduleSubmit} className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {editingSchedule ? "Edit Schedule Item" : "Add New Schedule Item"}
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
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
                              className="bg-white/5 rounded-lg p-4 border border-white/10 flex justify-between items-center"
                            >
                              <div className="grid grid-cols-4 gap-4 flex-1">
                                <div>
                                  <div className="text-sm text-blue-200">Time</div>
                                  <div className="text-white font-semibold">{item.time}</div>
                                </div>
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
