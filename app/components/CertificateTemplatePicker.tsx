"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildCertificateCanvas,
  CERTIFICATE_TEMPLATES,
  CertificateTemplateId,
} from "@/lib/certificate/templates";

interface Props {
  value: CertificateTemplateId;
  onChange: (id: CertificateTemplateId) => void;
}

export default function CertificateTemplatePicker({ value, onChange }: Props) {
  const [sampleName, setSampleName] = useState("Maria Papadopoulou");
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [rendering, setRendering] = useState(false);
  const [zoom, setZoom] = useState<{ id: string; url: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setRendering(true);
      const name = sampleName.trim() || "Your Name";
      const next: Record<string, string> = {};
      for (const tpl of CERTIFICATE_TEMPLATES) {
        try {
          // Render at reduced scale for a fast, lightweight preview
          const canvas = await buildCertificateCanvas(tpl.id, name, 0.34);
          next[tpl.id] = canvas.toDataURL("image/jpeg", 0.85);
        } catch (e) {
          console.error("Preview render failed:", tpl.id, e);
        }
      }
      setPreviews(next);
      setRendering(false);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sampleName]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-blue-200 text-sm font-semibold mb-1">Preview name</label>
          <input
            type="text"
            value={sampleName}
            onChange={(e) => setSampleName(e.target.value)}
            placeholder="Type a sample name to preview"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
          />
        </div>
        {rendering && <span className="text-blue-200 text-sm pb-2">Rendering previews…</span>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CERTIFICATE_TEMPLATES.map((tpl) => {
          const selected = value === tpl.id;
          return (
            <div
              key={tpl.id}
              className={`rounded-xl border-2 overflow-hidden transition-all ${
                selected ? "border-green-400 ring-2 ring-green-400/50" : "border-white/15"
              } bg-white/5`}
            >
              <div className="relative bg-black/20 aspect-[1/1.414] flex items-center justify-center">
                {previews[tpl.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previews[tpl.id]}
                    alt={`${tpl.name} preview`}
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setZoom({ id: tpl.id, url: previews[tpl.id] })}
                  />
                ) : (
                  <div className="text-blue-200/60 text-xs">Loading…</div>
                )}
                {selected && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                    ✓ Default
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="text-white font-bold text-sm">{tpl.name}</div>
                <div className="text-blue-200 text-xs mt-0.5 mb-3 leading-snug">{tpl.description}</div>
                <button
                  type="button"
                  onClick={() => onChange(tpl.id)}
                  className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                    selected
                      ? "bg-green-500 text-white cursor-default"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  }`}
                >
                  {selected ? "Selected as default" : "Set as default"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zoom modal */}
      {zoom && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom.url}
            alt="Certificate preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setZoom(null)}
            className="absolute top-5 right-6 text-white text-4xl font-light hover:text-blue-200"
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
