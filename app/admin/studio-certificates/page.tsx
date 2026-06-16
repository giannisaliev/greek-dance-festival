"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jsPDF } from "jspdf";
import Navigation from "@/app/components/Navigation";
import {
  buildStudioCertificateCanvas,
  CertificateTemplateId,
  DEFAULT_CERTIFICATE_TEMPLATE,
  EVENT_DATE,
  EVENT_LOCATION,
} from "@/lib/certificate/templates";

type StudioLogo = {
  fileName: string;
  displayName: string;
  logoUrl: string;
};

function toSafeFilePart(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "studio";
}

export default function StudioCertificatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [studios, setStudios] = useState<StudioLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [busyStudio, setBusyStudio] = useState<string | null>(null);
  const [template, setTemplate] = useState<CertificateTemplateId>(DEFAULT_CERTIFICATE_TEMPLATE);
  const [previewStudio, setPreviewStudio] = useState<StudioLogo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

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

  useEffect(() => {
    if (status !== "authenticated" || !(session?.user as any)?.isAdmin) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const [logosRes, settingsRes] = await Promise.all([
          fetch("/api/studio-certificates", { cache: "no-store" }),
          fetch("/api/settings", { cache: "no-store" }),
        ]);

        const logosData = await logosRes.json();
        const settingsData = await settingsRes.json();

        setStudios(Array.isArray(logosData.studios) ? logosData.studios : []);
        if (settingsData?.certificateTemplate) {
          setTemplate(settingsData.certificateTemplate as CertificateTemplateId);
        }
      } catch {
        setStudios([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [session, status]);

  const filteredStudios = useMemo(() => {
    if (!search.trim()) return studios;
    const q = search.toLowerCase();
    return studios.filter(
      (studio) =>
        studio.displayName.toLowerCase().includes(q) || studio.fileName.toLowerCase().includes(q)
    );
  }, [studios, search]);

  const handlePreview = async (studio: StudioLogo) => {
    setPreviewStudio(studio);
    setPreviewUrl(null);
    setIsPreviewLoading(true);
    try {
      const canvas = await buildStudioCertificateCanvas(template, studio.logoUrl, studio.displayName, 0.15);
      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.88));
    } catch (err) {
      console.error("Preview generation failed:", err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewStudio(null);
    setPreviewUrl(null);
  };

  const downloadStudioCertificate = async (studio: StudioLogo) => {
    setBusyStudio(studio.fileName);
    try {
      const canvas = await buildStudioCertificateCanvas(template, studio.logoUrl, studio.displayName);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297);
      pdf.save(`Guinness_Record_Studio_${toSafeFilePart(studio.displayName)}.pdf`);

      fetch("/api/certificate-downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: `Studio: ${studio.displayName}`,
          downloadedByRole: "admin",
          templateId: template,
        }),
      }).catch(() => {});
    } catch (error) {
      console.error("Studio certificate generation failed:", error);
      alert(`Failed to generate certificate for ${studio.displayName}.`);
    } finally {
      setBusyStudio(null);
    }
  };

  const downloadAll = async () => {
    if (!filteredStudios.length) return;

    setIsDownloadingAll(true);
    try {
      for (const studio of filteredStudios) {
        setBusyStudio(studio.fileName);
        const canvas = await buildStudioCertificateCanvas(template, studio.logoUrl, studio.displayName);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297);
        pdf.save(`Guinness_Record_Studio_${toSafeFilePart(studio.displayName)}.pdf`);

        fetch("/api/certificate-downloads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantName: `Studio: ${studio.displayName}`,
            downloadedByRole: "admin",
            templateId: template,
          }),
        }).catch(() => {});
      }
    } catch (error) {
      console.error("Bulk studio certificate generation failed:", error);
      alert("Failed while generating studio certificates.");
    } finally {
      setBusyStudio(null);
      setIsDownloadingAll(false);
    }
  };

  if (status === "loading" || !session || !(session.user as any)?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Studio Certificates</h1>
              <p className="text-blue-100 mt-2 text-sm">
                Admin-only downloads. One certificate per studio logo from public/Studios, using the current Guinness certificate design.
              </p>
              <p className="text-blue-200 mt-1 text-xs">
                Event: {EVENT_DATE} | {EVENT_LOCATION}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="bg-white/20 text-white px-5 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30 text-sm"
              >
                Back to Admin
              </Link>
              <button
                onClick={downloadAll}
                disabled={isDownloadingAll || isLoading || filteredStudios.length === 0}
                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-5 py-2 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isDownloadingAll ? "Generating..." : `Download All (${filteredStudios.length})`}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-blue-200 text-xs uppercase tracking-wide">Template</div>
              <div className="text-white text-lg font-semibold mt-1">{template}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-blue-200 text-xs uppercase tracking-wide">Total Studio Logos</div>
              <div className="text-white text-lg font-semibold mt-1">{studios.length}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-blue-200 text-xs uppercase tracking-wide">Shown</div>
              <div className="text-white text-lg font-semibold mt-1">{filteredStudios.length}</div>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search studio by name or filename..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center text-white py-16">Loading studio logos...</div>
          ) : filteredStudios.length === 0 ? (
            <div className="text-center text-blue-100 py-16">
              {search ? "No studio logos match your search." : "No studio logos found in public/Studios."}
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px]">
                  <thead>
                    <tr className="border-b border-white/20 bg-white/5">
                      <th className="text-left text-white font-semibold py-3 px-4 text-sm">Logo</th>
                      <th className="text-left text-white font-semibold py-3 px-4 text-sm">Studio Name</th>
                      <th className="text-left text-white font-semibold py-3 px-4 text-sm">File</th>
                      <th className="text-left text-white font-semibold py-3 px-4 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudios.map((studio) => (
                      <tr key={studio.fileName} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="h-14 w-24 rounded-md bg-white p-2 flex items-center justify-center">
                            <img
                              src={studio.logoUrl}
                              alt={studio.displayName}
                              className="max-h-10 max-w-20 object-contain"
                              loading="lazy"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-white text-sm font-medium">{studio.displayName}</td>
                        <td className="py-3 px-4 text-blue-200 text-xs">{studio.fileName}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreview(studio)}
                              disabled={isDownloadingAll || busyStudio === studio.fileName}
                              className="bg-white/20 text-white px-3 py-2 rounded-lg font-semibold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs border border-white/30"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => downloadStudioCertificate(studio)}
                              disabled={isDownloadingAll || busyStudio === studio.fileName}
                              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-yellow-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {busyStudio === studio.fileName ? "Generating..." : "Download PDF"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Preview modal */}
    {previewStudio && (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={closePreview}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-sm">{previewStudio.displayName}</div>
              <div className="text-blue-200 text-xs mt-0.5">Certificate Preview</div>
            </div>
            <button
              onClick={closePreview}
              className="text-white/70 hover:text-white text-xl font-light leading-none"
              aria-label="Close preview"
            >
              ×
            </button>
          </div>

          <div className="bg-gray-100 flex items-center justify-center" style={{ minHeight: 200 }}>
            {isPreviewLoading ? (
              <div className="py-16 text-gray-400 text-sm">Generating preview…</div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={`Certificate preview for ${previewStudio.displayName}`}
                className="w-full block"
              />
            ) : (
              <div className="py-16 text-gray-400 text-sm">Preview unavailable</div>
            )}
          </div>

          <div className="flex gap-3 p-4 bg-white">
            <button
              onClick={closePreview}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
            >
              Close
            </button>
            <button
              onClick={() => { closePreview(); downloadStudioCertificate(previewStudio); }}
              disabled={busyStudio === previewStudio.fileName || isDownloadingAll}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:from-yellow-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
