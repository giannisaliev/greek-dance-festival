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
}

// Function to get flag emoji from country code
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch('/api/teachers');
        if (res.ok) {
          const data = await res.json();
          setTeachers(data || []);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Our Teachers
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
                className="group relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Country Flag Badge */}
                <div className="absolute top-4 right-4 z-30">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                    <span className="text-3xl">{getFlagEmoji(teacher.countryCode)}</span>
                  </div>
                </div>

                {/* Teacher Image */}
                <div className="relative h-80 overflow-hidden">
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
                      <span className="text-lg">{getFlagEmoji(teacher.countryCode)}</span>
                      <span className="font-semibold">{teacher.country}</span>
                    </div>
                  </div>
                </div>

                {/* Teaching Style */}
                <div className="relative p-6">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">💃</div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-200 mb-1">Teaching Style</h4>
                      <p className="text-white leading-relaxed">
                        {teacher.teachingStyle}
                      </p>
                    </div>
                  </div>

                  {/* Decorative bottom line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
