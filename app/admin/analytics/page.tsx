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
    } catch (error) {
      console.error("Error fetching analytics:", error);
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
              <h2 className="text-2xl font-bold text-white mb-4">🕐 Recent Events</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3 px-2">Time</th>
                      <th className="text-left text-white font-semibold py-3 px-2">Type</th>
                      <th className="text-left text-white font-semibold py-3 px-2">Event</th>
                      <th className="text-left text-white font-semibold py-3 px-2">Page</th>
                      <th className="text-left text-white font-semibold py-3 px-2">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.map((event) => (
                      <tr key={event.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-2 text-blue-100 text-sm">
                          {new Date(event.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-2">
                          <span className="bg-blue-500/30 text-blue-100 px-2 py-1 rounded text-xs">
                            {event.eventType}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-white text-sm">{event.eventName}</td>
                        <td className="py-3 px-2 text-blue-100 text-sm font-mono">{event.pagePath}</td>
                        <td className="py-3 px-2 text-blue-100 text-sm">{event.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
