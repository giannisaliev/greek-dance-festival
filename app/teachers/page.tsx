"use client";

import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Image from "next/image";

interface Teacher {
  id: string;
  name: string;
  image: string;
  teachingStyle: string;
  country: string;
  countryCode: string;
  imagePadding: number;
  instagram?: string;
  facebook?: string;
}

interface Settings {
  showTbaTeachers: boolean;
  tbaTeachersCount: number;
}

// Function to get flag emoji from country code
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Function to get flag image URL from country code
const getFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({ showTbaTeachers: false, tbaTeachersCount: 3 });

  useEffect(() => {
    async function fetchData() {
      try {
        const [teachersRes, settingsRes] = await Promise.all([
          fetch('/api/teachers'),
          fetch('/api/settings')
        ]);
        
        if (teachersRes.ok) {
          const data = await teachersRes.json();
          setTeachers(data || []);
        }
        
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings({
            showTbaTeachers: settingsData.showTbaTeachers ?? false,
            tbaTeachersCount: settingsData.tbaTeachersCount ?? 3
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Teachers
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Meet the exceptional instructors who will guide you through the beautiful world of Greek dance
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading teachers...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Teachers Yet</h3>
              <p className="text-blue-100">
                Our amazing teachers will be announced soon. Stay tuned!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="group relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                {/* Country Flag Badge - positioned outside overflow container */}
                <div className="absolute top-4 right-4 z-50">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-xl border border-white/50">
                    <img 
                      src={getFlagUrl(teacher.countryCode)} 
                      alt={teacher.country}
                      className="w-8 h-6 object-cover rounded-sm"
                    />
                  </div>
                </div>

                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                {/* Teacher Image */}
                <div className="relative h-80 overflow-hidden rounded-t-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <Image
                    src={teacher.image}
                    alt={teacher.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                    style={{ objectPosition: `center ${teacher.imagePadding || 0}px` }}
                  />
                  
                  {/* Name overlay on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                      {teacher.name}
                    </h3>
                    <div className="flex items-center gap-2 text-blue-100">
                      <img 
                        src={getFlagUrl(teacher.countryCode)} 
                        alt={teacher.country}
                        className="w-6 h-4 object-cover rounded-sm"
                      />
                      <span className="font-semibold">{teacher.country}</span>
                    </div>
                  </div>
                </div>

                {/* Teaching Style */}
                <div className="relative p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-3xl">💃</div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-200 mb-1">Teaching Style</h4>
                      <p className="text-white leading-relaxed">
                        {teacher.teachingStyle}
                      </p>
                    </div>
                  </div>

                  {/* Social Links */}
                  {(teacher.instagram || teacher.facebook) && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                      {teacher.instagram && (
                        <a
                          href={teacher.instagram.startsWith('http') ? teacher.instagram : `https://instagram.com/${teacher.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all text-sm"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram
                        </a>
                      )}
                      {teacher.facebook && (
                        <a
                          href={teacher.facebook.startsWith('http') ? teacher.facebook : `https://facebook.com/${teacher.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </a>
                      )}
                    </div>
                  )}

                  {/* Decorative bottom line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
            
            {/* TBA Teacher Cards */}
            {settings.showTbaTeachers && Array.from({ length: settings.tbaTeachersCount }).map((_, index) => (
              <div
                key={`tba-${index}`}
                className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 transition-all duration-500"
              >
                {/* TBA Badge */}
                <div className="absolute top-4 right-4 z-50">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-4 py-1.5 shadow-xl">
                    <span className="text-white font-bold text-sm">TBA</span>
                  </div>
                </div>

                {/* Placeholder Image */}
                <div className="relative h-80 overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-800/50 to-purple-800/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4 opacity-50">👤</div>
                  </div>
                  
                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                      To Be Announced
                    </h3>
                    <div className="flex items-center gap-2 text-blue-200">
                      <span className="font-semibold">Coming Soon</span>
                    </div>
                  </div>
                </div>

                {/* Placeholder Content */}
                <div className="relative p-6">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl opacity-50">💃</div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-200 mb-1">Teaching Style</h4>
                      <p className="text-blue-100/70 leading-relaxed italic">
                        More amazing instructors coming soon...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {teachers.length > 0 && (
          <div className="mt-16 text-center bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Learn?</h3>
            <p className="text-xl text-blue-100 mb-8">
              Join us and learn from these incredible instructors!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="inline-block bg-white text-blue-900 px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Register Now
              </a>
              <a
                href="/pricing"
                className="inline-block bg-blue-700/50 text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-600/50 transition-colors border-2 border-white/30 backdrop-blur-sm"
              >
                View Packages
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
