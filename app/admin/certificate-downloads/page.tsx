"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";

interface CertDownload {
  id: string;
  participantId: string;
  participantName: string;
  downloadedById: string;
  downloadedByName: string;
  downloadedByRole: string;
  templateId: string;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  self: "Self",
  teacher: "Teacher / Studio",
};

const TEMPLATE_LABELS: Record<string, string> = {
  classic: "Classic Gold",
  flyer: "Full Flyer",
  elegant: "Elegant Navy",
  festive: "Festival Blue",
};

export default function CertificateDownloadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [downloads, setDownloads] = useState<CertDownload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/login"); return; }
    if (!(session.user as any)?.isAdmin) { router.push("/"); return; }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !(session?.user as any)?.isAdmin) return;

    fetch("/api/certificate-downloads")
      .then((r) => r.json())
      .then((d) => setDownloads(d.downloads ?? []))
      .catch(() => setDownloads([]))
      .finally(() => setIsLoading(false));
  }, [session, status]);

  if (status === "loading" || !session || !(session.user as any)?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading…</div>
      </div>
    );
  }

  const filtered = downloads.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.participantName.toLowerCase().includes(q) ||
      d.downloadedByName.toLowerCase().includes(q) ||
      d.downloadedByRole.toLowerCase().includes(q)
    );
  });

  // Stats
  const totalSelf = downloads.filter((d) => d.downloadedByRole === "self").length;
  const totalTeacher = downloads.filter((d) => d.downloadedByRole === "teacher").length;
  const uniqueParticipants = new Set(downloads.filter((d) => d.participantId !== "unknown").map((d) => d.participantId)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">📜 Certificate Downloads</h1>
              <p className="text-blue-100 mt-1 text-sm">
                Track which participants and teachers have downloaded Guinness World Record certificates.
              </p>
            </div>
            <Link
              href="/admin"
              className="shrink-0 bg-white/20 text-white px-5 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30 text-sm text-center"
            >
              ← Admin Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="text-3xl font-bold text-white">{downloads.length}</div>
              <div className="text-blue-200 text-sm mt-1">Total Downloads</div>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="text-3xl font-bold text-emerald-300">{uniqueParticipants}</div>
              <div className="text-blue-200 text-sm mt-1">Unique Participants</div>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 col-span-2 sm:col-span-1">
              <div className="flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-yellow-300">{totalSelf}</div>
                  <div className="text-blue-200 text-xs mt-1">Self Downloads</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-violet-300">{totalTeacher}</div>
                  <div className="text-blue-200 text-xs mt-1">Teacher Downloads</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by participant name, downloader name, or role…"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center text-white py-16">Loading downloads…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-blue-100 py-16">
              {search ? "No results match your search." : "No certificate downloads recorded yet."}
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/20 bg-white/5">
                      <th className="text-left text-white font-semibold py-3 px-4 text-sm">Participant</th>
                      <th className="text-left text-white font-semibold py-3 px-4 text-sm">Downloaded By</th>
                      <th className="text-left text-white font-semibold py-3 px-4 text-sm">Role</th>
                      <th className="text-left text-white font-semibold py-3 px-4 text-sm">Template</th>
                      <th className="text-left text-white font-semibold py-3 px-4 text-sm">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d) => (
                      <tr key={d.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white text-sm font-medium">{d.participantName}</td>
                        <td className="py-3 px-4 text-blue-100 text-sm">
                          {d.downloadedByName}
                          {d.downloadedById === "anonymous" && (
                            <span className="ml-2 text-xs text-blue-300/60">(not logged in)</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${
                              d.downloadedByRole === "teacher"
                                ? "bg-violet-500/20 text-violet-200 border-violet-500/30"
                                : "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
                            }`}
                          >
                            {ROLE_LABELS[d.downloadedByRole] ?? d.downloadedByRole}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-blue-200 text-xs">
                          {TEMPLATE_LABELS[d.templateId] ?? d.templateId}
                        </td>
                        <td className="py-3 px-4 text-blue-200 text-xs whitespace-nowrap">
                          {new Date(d.createdAt).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 text-blue-200 text-xs border-t border-white/10">
                Showing {filtered.length} of {downloads.length} download{downloads.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}