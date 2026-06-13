"use client";

import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import Navigation from "@/app/components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  buildCertificateCanvas,
  CertificateTemplateId,
  DEFAULT_CERTIFICATE_TEMPLATE,
  EVENT_DATE,
  EVENT_LOCATION,
} from "@/lib/certificate/templates";

export default function CertificatePage() {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [template, setTemplate] = useState<CertificateTemplateId>(DEFAULT_CERTIFICATE_TEMPLATE);
  const [name, setName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setEnabled(d.certificatePageEnabled ?? false);
        setTemplate((d.certificateTemplate as CertificateTemplateId) || DEFAULT_CERTIFICATE_TEMPLATE);
      })
      .catch(() => setEnabled(false));
  }, []);

  // Debounced name search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = name.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/certificate-names?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.names || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name]);

  const downloadCertificate = async () => {
    const finalName = name.trim();
    if (!finalName) return;
    setGenerating(true);
    try {
      const canvas = await buildCertificateCanvas(template, finalName);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297);
      const safe = finalName.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
      pdf.save(`Guinness_Record_Certificate_${safe || "participant"}.pdf`);
    } catch (e) {
      console.error("Certificate generation failed:", e);
      alert("Sorry, the certificate could not be generated. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const c = t.certificate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {enabled === null ? (
          <div className="text-center text-blue-100 py-20">Loading…</div>
        ) : !enabled ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-white/20 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-2">{c.unavailableTitle}</h1>
            <p className="text-blue-100">{c.unavailableText}</p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-10 border-2 border-yellow-400/40 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🏆</div>
              <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 mb-3">
                {c.title}
              </h1>
              <p className="text-blue-100 text-base sm:text-lg">{c.subtitle}</p>
            </div>

            <label className="block text-white font-semibold mb-2">{c.nameLabel}</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={c.namePlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/30 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 text-lg"
                autoComplete="off"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 text-sm">…</div>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-2xl py-1 max-h-72 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button
                      key={`${s}-${i}`}
                      type="button"
                      onClick={() => {
                        setName(s);
                        setShowSuggestions(false);
                      }}
                      className="block w-full text-left px-4 py-2.5 text-gray-800 hover:bg-yellow-50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-blue-200/80 text-sm mt-2">{c.searchHint}</p>

            <button
              onClick={downloadCertificate}
              disabled={!name.trim() || generating}
              className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 rounded-xl font-bold text-lg hover:from-yellow-300 hover:to-orange-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? c.generating : `📜 ${c.downloadButton}`}
            </button>

            <div className="mt-8 pt-6 border-t border-white/15 text-center text-blue-100 text-sm space-y-1">
              <p>📅 {EVENT_DATE}</p>
              <p>📍 {EVENT_LOCATION}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
