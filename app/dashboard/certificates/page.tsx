"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jsPDF } from "jspdf";
import Navigation from "@/app/components/Navigation";
import {
  buildCertificateCanvas,
  CertificateTemplateId,
  DEFAULT_CERTIFICATE_TEMPLATE,
} from "@/lib/certificate/templates";

interface Student {
  id: string;
  email: string;
  participant: {
    id: string;
    registrantFirstName: string | null;
    registrantLastName: string | null;
    packageType: string;
    guinnessRecordAttempt: boolean;
    greekNight: boolean;
    totalPrice: number;
    studioName: string | null;
  };
}

function hasGuinnessEligibility(p: Student["participant"]) {
  return (
    p.guinnessRecordAttempt ||
    p.packageType === "guinness-only" ||
    p.packageType === "full-pass"
  );
}

function getDisplayName(s: Student) {
  const first = s.participant.registrantFirstName ?? "";
  const last = s.participant.registrantLastName ?? "";
  return `${first} ${last}`.trim() || s.email;
}

export default function TeacherCertificatesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [template, setTemplate] = useState<CertificateTemplateId>(DEFAULT_CERTIFICATE_TEMPLATE);
  const [generating, setGenerating] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, studentsRes, settingsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/participants/my-registrations"),
          fetch("/api/settings", { cache: "no-store" }),
        ]);

        if (!meRes.ok) {
          router.push("/login");
          return;
        }

        const { user: me } = await meRes.json();
        setUser(me);

        if (studentsRes.ok) {
          const data = await studentsRes.json();
          setStudents(data.students ?? []);
        }

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.certificateTemplate) {
            setTemplate(settings.certificateTemplate as CertificateTemplateId);
          }
        }
      } catch (err) {
        setError("Failed to load data. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [router]);

  const eligibleStudents = students.filter((s) => hasGuinnessEligibility(s.participant));

  async function downloadCertificate(student: Student) {
    const name = getDisplayName(student);
    setGenerating(student.id);
    try {
      const canvas = await buildCertificateCanvas(template, name);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297);
      const safe = name.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
      pdf.save(`Guinness_Certificate_${safe || "participant"}.pdf`);

      // Record the download
      await fetch("/api/certificate-downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: student.participant.id,
          participantName: name,
          downloadedByRole: "teacher",
          templateId: template,
        }),
      }).catch(() => {});

      setDownloaded((prev) => new Set(prev).add(student.id));
    } catch (e) {
      console.error("Certificate generation failed:", e);
      alert("Could not generate certificate. Please try again.");
    } finally {
      setGenerating(null);
    }
  }

  async function downloadAll() {
    for (const student of eligibleStudents) {
      await downloadCertificate(student);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-xl">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-10 border border-white/20">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">🏆 Certificates — My Students</h1>
              <p className="text-blue-100 mt-1 text-sm">
                Download Guinness World Record certificates for your eligible students.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 bg-white/20 text-white px-5 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30 text-sm text-center"
            >
              ← My Dashboard
            </Link>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          {eligibleStudents.length === 0 ? (
            <div className="text-center py-16 text-blue-100">
              <div className="text-5xl mb-4">🎫</div>
              <p className="text-lg font-semibold text-white mb-2">No eligible students</p>
              <p className="text-sm">
                None of your registered students have a Guinness Record package, add-on, or Full Pass.
              </p>
            </div>
          ) : (
            <>
              {/* Stats + bulk action */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white/5 rounded-xl px-5 py-4 border border-white/10">
                <div className="text-white">
                  <span className="font-bold text-xl">{eligibleStudents.length}</span>
                  <span className="text-blue-200 ml-2 text-sm">eligible student{eligibleStudents.length !== 1 ? "s" : ""}</span>
                  {downloaded.size > 0 && (
                    <span className="ml-3 text-green-300 text-sm">· {downloaded.size} downloaded</span>
                  )}
                </div>
                <button
                  onClick={downloadAll}
                  disabled={generating !== null}
                  className="shrink-0 px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 rounded-xl font-bold text-sm hover:from-yellow-300 hover:to-orange-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? "Generating…" : "⬇ Download All"}
                </button>
              </div>

              {/* Student list */}
              <div className="space-y-3">
                {eligibleStudents.map((student) => {
                  const name = getDisplayName(student);
                  const isGenerating = generating === student.id;
                  const isDone = downloaded.has(student.id);
                  const pkg = student.participant.packageType;

                  return (
                    <div
                      key={student.id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-5 py-4 transition-all ${
                        isDone
                          ? "border-green-500/40 bg-green-500/10"
                          : "border-white/15 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-white font-semibold truncate">{name}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-blue-200 truncate">{student.email}</span>
                          {student.participant.studioName && (
                            <span className="text-xs text-purple-200">🎭 {student.participant.studioName}</span>
                          )}
                          <span className="text-xs bg-yellow-500/20 text-yellow-200 border border-yellow-500/30 rounded-full px-2 py-0.5">
                            🏆 {pkg === "guinness-only" ? "Guinness Only" : pkg === "full-pass" ? "Full Pass" : "Guinness Add-on"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadCertificate(student)}
                        disabled={isGenerating || generating !== null}
                        className={`shrink-0 px-5 py-2 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed ${
                          isDone
                            ? "bg-green-500/30 text-green-200 border border-green-500/40"
                            : "bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 hover:from-yellow-300 hover:to-orange-300 disabled:opacity-50"
                        }`}
                      >
                        {isGenerating ? "Generating…" : isDone ? "✓ Downloaded" : "⬇ Download PDF"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}