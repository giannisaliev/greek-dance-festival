"use client";

import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import Navigation from "@/app/components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FLYER_SRC = "/Guiness%20flyer.png";
const LOGO_SRC = "/GUINESS.png";
const EVENT_DATE = "14th June 2026";
const EVENT_LOCATION = "Thessaloniki, Greece";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Draw a centered string with manual letter spacing.
function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  spacing: number
) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  let x = centerX - total / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  [...text].forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i];
  });
  ctx.textAlign = prevAlign;
}

async function buildCertificateCanvas(name: string): Promise<HTMLCanvasElement> {
  // A4 portrait at ~300 DPI
  const W = 2480;
  const H = 3508;
  const cx = W / 2;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fffdf8");
  bg.addColorStop(1, "#fbf3e3");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Decorative gold border (double frame)
  const gold = "#b8860b";
  const goldLight = "#d4af37";
  ctx.strokeStyle = gold;
  ctx.lineWidth = 14;
  ctx.strokeRect(90, 90, W - 180, H - 180);
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 5;
  ctx.strokeRect(130, 130, W - 260, H - 260);

  // Corner flourishes
  ctx.fillStyle = goldLight;
  const corner = (x: number, y: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x, y - 4, dx, 8);
    ctx.fillRect(x - 4, y, 8, dy);
  };
  corner(170, 170, 120, 120);
  corner(W - 170, 170, -120, 120);
  corner(170, H - 170, 120, -120);
  corner(W - 170, H - 170, -120, -120);

  // Logo
  try {
    const logo = await loadImage(LOGO_SRC);
    const lh = 300;
    const lw = (logo.width / logo.height) * lh;
    ctx.drawImage(logo, cx - lw / 2, 250, lw, lh);
  } catch {
    /* logo optional */
  }

  ctx.textAlign = "center";

  // Title
  ctx.fillStyle = "#7a5b10";
  ctx.font = "bold 150px Georgia, 'Times New Roman', serif";
  drawSpacedText(ctx, "CERTIFICATE", cx, 720, 6);
  ctx.fillStyle = gold;
  ctx.font = "bold 70px Georgia, 'Times New Roman', serif";
  drawSpacedText(ctx, "OF ACHIEVEMENT", cx, 820, 22);

  // Divider
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 360, 900);
  ctx.lineTo(cx + 360, 900);
  ctx.stroke();
  ctx.fillStyle = goldLight;
  ctx.beginPath();
  ctx.arc(cx, 900, 12, 0, Math.PI * 2);
  ctx.fill();

  // Presented to
  ctx.fillStyle = "#444";
  ctx.font = "italic 64px Georgia, serif";
  ctx.fillText("This is proudly presented to", cx, 1050);

  // Name
  ctx.fillStyle = "#1a2a44";
  ctx.font = "bold 150px Georgia, 'Times New Roman', serif";
  // Shrink to fit if very long
  let nameSize = 150;
  while (ctx.measureText(name).width > W - 600 && nameSize > 70) {
    nameSize -= 6;
    ctx.font = `bold ${nameSize}px Georgia, 'Times New Roman', serif`;
  }
  ctx.fillText(name, cx, 1250);
  // Underline
  const nameW = Math.min(ctx.measureText(name).width + 120, W - 500);
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - nameW / 2, 1320);
  ctx.lineTo(cx + nameW / 2, 1320);
  ctx.stroke();

  // Body text
  ctx.fillStyle = "#333";
  ctx.font = "52px Georgia, serif";
  ctx.fillText("for being part of the official", cx, 1470);

  ctx.fillStyle = "#b8860b";
  ctx.font = "bold 96px Georgia, 'Times New Roman', serif";
  drawSpacedText(ctx, "GUINNESS WORLD RECORD", cx, 1600, 4);

  ctx.fillStyle = "#333";
  ctx.font = "52px Georgia, serif";
  ctx.fillText("in Zeibekiko", cx, 1700);

  // Date & Location row
  ctx.fillStyle = "#1a2a44";
  ctx.font = "bold 58px Georgia, serif";
  ctx.fillText(`${EVENT_DATE}   •   ${EVENT_LOCATION}`, cx, 1830);

  // Flyer
  try {
    const flyer = await loadImage(FLYER_SRC);
    const fh = 1180;
    const fw = (flyer.width / flyer.height) * fh;
    const fx = cx - fw / 2;
    const fy = 1930;
    // Frame
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = "#fff";
    ctx.fillRect(fx - 16, fy - 16, fw + 32, fh + 32);
    ctx.restore();
    ctx.drawImage(flyer, fx, fy, fw, fh);
    ctx.strokeStyle = goldLight;
    ctx.lineWidth = 4;
    ctx.strokeRect(fx - 16, fy - 16, fw + 32, fh + 32);
  } catch {
    /* flyer optional */
  }

  // Footer
  ctx.fillStyle = "#7a5b10";
  ctx.font = "bold 50px Georgia, serif";
  ctx.fillText("Greek Dance Festival 2026", cx, H - 240);
  ctx.fillStyle = "#999";
  ctx.font = "italic 38px Georgia, serif";
  ctx.fillText("Zeibekiko Guinness World Record Attempt", cx, H - 180);

  return canvas;
}

export default function CertificatePage() {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEnabled(d.certificatePageEnabled ?? false))
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
      const canvas = await buildCertificateCanvas(finalName);
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
