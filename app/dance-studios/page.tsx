"use client";

import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface DanceStudio {
  id: string;
  name: string;
  logo: string;
  country: string;
  countryCode: string;
  website?: string;
  googleMapsUrl?: string;
  order: number;
}

const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function DanceStudiosPage() {
  const { t } = useLanguage();
  const [studios, setStudios] = useState<DanceStudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudios() {
      try {
        const res = await fetch("/api/dance-studios");
        if (res.ok) {
          const data = await res.json();
          setStudios(data.studios || []);
        }
      } catch (error) {
        console.error("Error fetching dance studios:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStudios();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            🏛️ {t.nav.danceStudios}
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Meet the dance studios participating in the Greek Dance Festival 2026
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-blue-200">Loading dance studios...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && studios.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏛️</div>
            <p className="text-white text-xl font-semibold">No dance studios yet</p>
            <p className="text-blue-200 mt-2">Check back soon!</p>
          </div>
        )}

        {/* Studios Grid */}
        {!isLoading && studios.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {studios.map((studio) => (
              <div
                key={studio.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col items-center gap-4 hover:bg-white/15 transition-all duration-300"
              >
                {/* Logo or Initials */}
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
                  {studio.logo ? (
                    <img
                      src={studio.logo}
                      alt={studio.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-white font-bold text-xl leading-tight text-center px-2">
                      {studio.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 3)}
                    </span>
                  )}
                </div>

                {/* Name & Country */}
                <div className="text-center w-full">
                  <h2 className="text-white font-bold text-base leading-snug mb-1">
                    {studio.name}
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <img
                      src={`https://flagcdn.com/w20/${studio.countryCode.toLowerCase()}.png`}
                      alt={studio.country}
                      className="w-5 h-auto rounded-sm"
                    />
                    <span className="text-blue-200 text-sm">{studio.country}</span>
                  </div>
                </div>

                {/* Links */}
                {(studio.website || studio.googleMapsUrl) && (
                  <div className="flex flex-wrap justify-center gap-2 w-full mt-auto">
                    {studio.website && (
                      <a
                        href={studio.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-blue-500/30 hover:bg-blue-500/50 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                        </svg>
                        Website
                      </a>
                    )}
                    {studio.googleMapsUrl && (
                      <a
                        href={studio.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-green-500/30 hover:bg-green-500/50 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Location
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
