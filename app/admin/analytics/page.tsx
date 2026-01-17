"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";

interface Statistics {
  totalEvents: number;
  uniqueSessions: number;
  uniqueUsers: number;
  eventsByType: Record<string, number>;
  topPages: { page: string; count: number }[];
  topEvents: { event: string; count: number }[];
  pageTimeStats?: { page: string; avgTimeSeconds: number; totalTimeSeconds: number; visits: number }[];
  eventsOverTime: { time: string; count: number }[];
}

interface RecentEvent {
  id: string;
  eventType: string;
  eventName: string;
  pagePath: string;
  metadata: any;
  user: string;
  createdAt: string;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<RecentEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status, timeRange, eventTypeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const params = new URLSearchParams({
        timeRange,
        ...(eventTypeFilter !== "all" && { eventType: eventTypeFilter }),
      });

      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setStatistics(data.statistics);
      setRecentEvents(data.recentEvents);
      
      // Check if there's a migration message
      if (data.message) {
        setMigrationMessage(data.message);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setErrorMessage("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/migrate-analytics', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        setMigrationMessage(null);
        alert('Analytics table created successfully! Refreshing data...');
        await fetchAnalytics();
      } else {
        alert('Migration failed: ' + data.error);
      }
    } catch (error) {
      console.error("Migration error:", error);
      alert('Migration failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-2xl">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 Analytics Dashboard</h1>
            <p className="text-blue-100">Visitor statistics and engagement metrics</p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
          >
            ← Back to Admin
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/10 text-white border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="24h" className="bg-blue-900">Last 24 Hours</option>
                <option value="7d" className="bg-blue-900">Last 7 Days</option>
                <option value="30d" className="bg-blue-900">Last 30 Days</option>
                <option value="all" className="bg-blue-900">All Time</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">Event Type</label>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="bg-white/10 text-white border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all" className="bg-blue-900">All Events</option>
                <option value="page_view" className="bg-blue-900">Page Views</option>
                <option value="click" className="bg-blue-900">Clicks</option>
                <option value="navigation" className="bg-blue-900">Navigation</option>
                <option value="form_submit" className="bg-blue-900">Form Submissions</option>
              </select>
            </div>

            <button
              onClick={fetchAnalytics}
              className="bg-white text-blue-900 px-6 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-all self-end"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Migration Notice */}
        {migrationMessage && (
          <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Analytics Table Not Found</h3>
                <p className="text-yellow-100 mb-4">{migrationMessage}</p>
                <button
                  onClick={runMigration}
                  className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-all"
                >
                  🔧 Create Analytics Table Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-500/20 border-2 border-red-400 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="text-2xl">❌</div>
              <div className="text-white font-semibold">{errorMessage}</div>
            </div>
          </div>
        )}

        {statistics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/30">
                <div className="text-green-100 text-sm font-semibold mb-2">Total Events</div>
                <div className="text-4xl font-bold text-white mb-1">{statistics.totalEvents.toLocaleString()}</div>
                <div className="text-green-100 text-xs">All tracked interactions</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30">
                <div className="text-purple-100 text-sm font-semibold mb-2">Unique Sessions</div>
                <div className="text-4xl font-bold text-white mb-1">{statistics.uniqueSessions.toLocaleString()}</div>
                <div className="text-purple-100 text-xs">Different visitors</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-2xl p-6 border border-blue-400/30">
                <div className="text-blue-100 text-sm font-semibold mb-2">Registered Users</div>
                <div className="text-4xl font-bold text-white mb-1">{statistics.uniqueUsers.toLocaleString()}</div>
                <div className="text-blue-100 text-xs">Logged-in visitors</div>
              </div>
            </div>

            {/* Events by Type */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Events by Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statistics.eventsByType).map(([type, count]) => (
                  <div key={type} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-blue-100 text-sm mb-1 capitalize">{type.replace("_", " ")}</div>
                    <div className="text-2xl font-bold text-white">{count.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top Pages */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">📄 Top Pages</h2>
                <div className="space-y-3">
                  {statistics.topPages.map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-lg">#{idx + 1}</span>
                        <span className="text-blue-100 font-mono text-sm">{page.page}</span>
                      </div>
                      <span className="text-white font-bold">{page.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Events */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">🎯 Top Events</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {statistics.topEvents.map((event, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-sm">#{idx + 1}</span>
                        <span className="text-blue-100 text-sm">{event.event}</span>
                      </div>
                      <span className="text-white font-semibold text-sm">{event.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Time Statistics */}
            {statistics.pageTimeStats && statistics.pageTimeStats.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">⏱️ Time Spent on Pages</h2>
                <div className="space-y-3">
                  {statistics.pageTimeStats.map((stat, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold">#{idx + 1}</span>
                          <span className="text-blue-100 font-mono text-sm">{stat.page}</span>
                        </div>
                        <span className="text-green-400 font-bold text-lg">{stat.avgTimeSeconds}s avg</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-blue-200">Total Time:</span>
                          <span className="text-white font-semibold ml-2">
                            {Math.floor(stat.totalTimeSeconds / 60)}m {stat.totalTimeSeconds % 60}s
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-200">Visits:</span>
                          <span className="text-white font-semibold ml-2">{stat.visits}</span>
                        </div>
                        <div>
                          <span className="text-blue-200">Avg Time:</span>
                          <span className="text-white font-semibold ml-2">{stat.avgTimeSeconds}s</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events Over Time */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📈 Activity Over Time</h2>
              <div className="space-y-2">
                {statistics.eventsOverTime.map((item, idx) => {
                  const maxCount = Math.max(...statistics.eventsOverTime.map(e => e.count));
                  const width = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="text-blue-100 text-sm w-32 flex-shrink-0">{item.time}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full flex items-center justify-end pr-3"
                          style={{ width: `${width}%` }}
                        >
                          <span className="text-white font-semibold text-sm">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Events Table */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🕐 Detailed Activity Log</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3 px-2">Time</th>
                      <th className="text-left text-white font-semibold py-3 px-2">Type</th>
                      <th className="text-left text-white font-semibold py-3 px-2">Event Details</th>
                      <th className="text-left text-white font-semibold py-3 px-2">Page</th>
                      <th className="text-left text-white font-semibold py-3 px-2">User</th>
                      <th className="text-left text-white font-semibold py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.map((event) => (
                      <tr key={event.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-2 text-blue-100 text-sm whitespace-nowrap">
                          {new Date(event.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            event.eventType === 'click' ? 'bg-green-500/30 text-green-100' :
                            event.eventType === 'page_view' ? 'bg-blue-500/30 text-blue-100' :
                            event.eventType === 'page_leave' ? 'bg-purple-500/30 text-purple-100' :
                            event.eventType === 'navigation' ? 'bg-yellow-500/30 text-yellow-100' :
                            'bg-gray-500/30 text-gray-100'
                          }`}>
                            {event.eventType}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-white text-sm max-w-xs">
                          <div className="truncate font-semibold">{event.eventName}</div>
                          {event.metadata && (
                            <div className="text-blue-200 text-xs mt-1">
                              {event.metadata.text && <div>Text: {event.metadata.text}</div>}
                              {event.metadata.linkText && <div>Link: {event.metadata.linkText}</div>}
                              {event.metadata.href && <div>Href: {event.metadata.href}</div>}
                              {event.metadata.timeSpentSeconds && (
                                <div className="text-green-300 font-semibold">
                                  ⏱️ Time: {event.metadata.timeSpentSeconds}s
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-blue-100 text-sm font-mono">{event.pagePath}</td>
                        <td className="py-3 px-2 text-blue-100 text-sm">{event.user}</td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowDetailsModal(true);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/20" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Event Details</h3>
                  <p className="text-blue-100">{new Date(selectedEvent.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-3 text-lg">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-200">Event Type:</span>
                      <span className="text-white font-semibold ml-2">{selectedEvent.eventType}</span>
                    </div>
                    <div>
                      <span className="text-blue-200">Event Name:</span>
                      <span className="text-white font-semibold ml-2">{selectedEvent.eventName}</span>
                    </div>
                    <div>
                      <span className="text-blue-200">Page:</span>
                      <span className="text-white font-semibold ml-2">{selectedEvent.pagePath}</span>
                    </div>
                    <div>
                      <span className="text-blue-200">User:</span>
                      <span className="text-white font-semibold ml-2">{selectedEvent.user}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {selectedEvent.metadata && (
                  <div className="bg-white/10 rounded-xl p-4">
                    <h4 className="text-white font-bold mb-3 text-lg">Detailed Metadata</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedEvent.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-3 text-sm">
                          <span className="text-blue-300 font-semibold min-w-[150px]">{key}:</span>
                          <span className="text-white flex-1 break-all">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Data */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-3 text-lg">Raw JSON Data</h4>
                  <pre className="text-blue-100 text-xs bg-black/30 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedEvent, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
