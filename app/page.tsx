"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "./components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Home() {
  const { t, language } = useLanguage();
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studios, setStudios] = useState<{ id: string; name: string; logo: string; country: string; countryCode: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [activeHalls, setActiveHalls] = useState<{[key: string]: string}>({
    Friday: "Hall 1",
    Saturday: "Hall 1",
    Sunday: "Hall 1",
  });

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch('/api/schedule', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setScheduleItems(data || []);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    async function fetchStudios() {
      try {
        const res = await fetch('/api/dance-studios', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setStudios(data.studios || []);
        }
      } catch (error) {
        console.error('Error fetching dance studios:', error);
      }
    }
    
    fetchSchedule();
    fetchStudios();
  }, []);

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      // June 14, 2026 12:00 PM Athens time (EEST, UTC+3)
      const targetDate = new Date('2026-06-14T12:00:00+03:00');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);
  
  // Group schedule by day
  const scheduleByDay = {
    Friday: scheduleItems.filter((item: any) => item.day === "Friday"),
    Saturday: scheduleItems.filter((item: any) => item.day === "Saturday"),
    Sunday: scheduleItems.filter((item: any) => item.day === "Sunday"),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      {/* Dance Studios Slider */}
      {studios.length > 0 && (() => {
        // Duplicate entries so the marquee loops seamlessly
        const items = studios.length < 6 ? [...studios, ...studios, ...studios, ...studios] : [...studios, ...studios];
        const getFlagEmoji = (code: string) => String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)));
        return (
          <div className="w-full bg-white/5 backdrop-blur-sm border-b border-white/10 py-4 overflow-hidden relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-blue-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-900 to-transparent z-10 pointer-events-none" />

            {/* Title */}
            <p className="text-center text-yellow-300 font-bold text-xs tracking-widest uppercase mb-3 opacity-90">
              🏆 Guinness Record Dance Studios
            </p>

            {/* Scrolling track */}
            <div className="overflow-hidden">
              <div className="animate-marquee">
                {items.map((studio, idx) => (
                  <div
                    key={`${studio.id}-${idx}`}
                    className="flex flex-col items-center mx-6 group flex-shrink-0"
                    style={{ minWidth: '90px' }}
                  >
                    {/* Logo circle */}
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white/30 group-hover:border-yellow-400 transition-all group-hover:scale-110 duration-300">
                      <img
                        src={studio.logo}
                        alt={studio.name}
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                    {/* Studio name */}
                    <p className="text-white text-xs font-semibold mt-2 text-center leading-tight max-w-[90px] truncate">
                      {studio.name}
                    </p>
                    {/* Country flag + name */}
                    <p className="text-blue-200 text-xs mt-0.5 text-center">
                      {getFlagEmoji(studio.countryCode)} {studio.country}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Festival Flyer */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-2xl">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden">
              <Image
                src="/flyer.jpg"
                alt="Greek Dance Festival Flyer"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Countdown to Guinness Record */}
        <div className="mt-8 mb-8 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-pink-400/30 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/60 shadow-2xl">
          <div className="text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 mb-4">
              🏆 {t.home.guinnesCountdown}
            </h3>
            <p className="text-white text-lg mb-6">
              {t.home.description}
            </p>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-white/30">
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">
                  {timeLeft.days}
                </div>
                <div className="text-blue-100 text-xs sm:text-sm md:text-base">{t.home.days}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-white/30">
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">
                  {timeLeft.hours}
                </div>
                <div className="text-blue-100 text-xs sm:text-sm md:text-base">{t.home.hours}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-white/30">
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">
                  {timeLeft.minutes}
                </div>
                <div className="text-blue-100 text-xs sm:text-sm md:text-base">{t.home.minutes}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-white/30">
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">
                  {timeLeft.seconds}
                </div>
                <div className="text-blue-100 text-xs sm:text-sm md:text-base">{t.home.seconds}</div>
              </div>
            </div>
            <p className="text-blue-100 mt-6 text-sm">
              {t.home.historyMessage}
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
          >
            {t.nav.register}
          </Link>
          <Link
            href="/pricing"
            className="bg-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors border-2 border-white/30"
          >
            {t.nav.pricing}
          </Link>
        </div>

        {/* Festival Schedule */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">{t.home.scheduleTitle}</h3>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-100">{t.home.loading}</p>
            </div>
          ) : (
          <div className="space-y-12">
            {["Friday", "Saturday", "Sunday"].map((day) => {
              const dayItems = scheduleByDay[day as keyof typeof scheduleByDay];
              const dateMap: { [key: string]: string } = {
                Friday: language === 'el' ? t.home.june12 : "June 12",
                Saturday: language === 'el' ? t.home.june13 : "June 13",
                Sunday: language === 'el' ? t.home.june14 : "June 14",
              };
              const dayName = day === "Friday" ? t.home.friday : day === "Saturday" ? t.home.saturday : t.home.sunday;
              
              // Get ALL unique time slots for this day (including special events)
              // Sort times chronologically (e.g., "09:00 - 10:00" before "10:00 - 11:00")
              const allTimeSlots = Array.from(new Set(dayItems.map((item: any) => item.time))).sort((a, b) => {
                // Extract the start time from formats like "09:00 - 10:00" or "09:00"
                const timeA = a.split(/[\-–—]/)[0].trim().replace(':', '');
                const timeB = b.split(/[\-–—]/)[0].trim().replace(':', '');
                return parseInt(timeA) - parseInt(timeB);
              });
              
              // Group items by time
              const itemsByTime: { [key: string]: any[] } = {};
              dayItems.forEach((item: any) => {
                if (!itemsByTime[item.time]) {
                  itemsByTime[item.time] = [];
                }
                itemsByTime[item.time].push(item);
              });
              
              const activeHall = activeHalls[day];
              
              return (
                <div key={day} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20">
                  <h4 className="text-2xl font-bold text-white mb-6">{dayName}, {dateMap[day]}</h4>
                  
                  {dayItems.length > 0 ? (
                    <>
                      {/* Desktop View - Original 3-column grid */}
                      <div className="hidden md:block space-y-4">
                        {allTimeSlots.map((time: string) => {
                          const items = itemsByTime[time];
                          const hasHalls = items.some((item: any) => item.hall);
                          
                          if (!hasHalls) {
                            // Special events (breaks, Greek Night, Guinness)
                            const item = items[0];
                            const isHighlight = item.danceStyle.includes('Greek Night') || item.danceStyle.includes('Guinness');
                            
                            return (
                              <div
                                key={time}
                                className={`rounded-xl p-6 border-2 text-center ${
                                  isHighlight
                                    ? 'bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-pink-400/30 border-yellow-400/60 animate-pulse shadow-lg'
                                    : 'bg-white/5 border-white/20'
                                }`}
                              >
                                <div className={`font-bold text-xl mb-2 ${
                                  isHighlight 
                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300' 
                                    : 'text-white'
                                }`}>
                                  {item.time}
                                </div>
                                <div className={`font-semibold text-lg ${
                                  isHighlight 
                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200' 
                                    : 'text-blue-100'
                                }`}>
                                  {item.danceStyle}
                                </div>
                              </div>
                            );
                          }
                          
                          // Regular sessions with halls
                          return (
                            <div key={time}>
                              <div className="text-white font-semibold mb-3 text-center text-lg bg-white/5 rounded-lg py-2">
                                {time}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {["Hall 1", "Hall 2", "Hall 3"].map((hall) => {
                                  const hallItem = items.find((item: any) => item.hall === hall);
                                  
                                  if (!hallItem) {
                                    return (
                                      <div key={hall} className="bg-white/5 rounded-xl p-4 border border-white/10 opacity-50">
                                        <div className="text-white font-semibold mb-2">{hall}</div>
                                      <div className="text-blue-200 text-sm">{t.home.noSession}</div>
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <div
                                      key={hall}
                                      className="rounded-xl p-4 border-2 hover:scale-105 transition-transform"
                                      style={{
                                        backgroundColor: hallItem.color ? `${hallItem.color}20` : 'rgba(255,255,255,0.05)',
                                        borderColor: hallItem.color || 'rgba(255,255,255,0.1)'
                                      }}
                                    >
                                      <div className="text-white font-bold mb-3 text-lg">{hall}</div>
                                      <div className="space-y-2">
                                        <div className="text-blue-100">
                                          <span className="font-semibold text-white">{t.home.dance}:</span> {hallItem.danceStyle}
                                        </div>
                                        <div className="text-blue-100">
                                          <span className="font-semibold text-white">{t.home.lecturer}:</span> {hallItem.lecturer}
                                        </div>
                                        <div className="text-blue-100">
                                          <span className="font-semibold text-white">{t.home.level}:</span> {hallItem.level}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Mobile View - Tabbed table format */}
                      <div className="md:hidden space-y-6">
                        {/* Hall Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {["Hall 1", "Hall 2", "Hall 3"].map((hall) => (
                            <button
                              key={hall}
                              onClick={() => setActiveHalls({...activeHalls, [day]: hall})}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-sm ${
                                activeHall === hall
                                  ? "bg-white text-blue-900 shadow-lg"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }`}
                            >
                              {hall}
                            </button>
                          ))}
                        </div>
                        
                        {/* Schedule Table with breaks inline */}
                        <div className="bg-white/5 rounded-xl overflow-hidden border border-white/20">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-white/10">
                                <tr>
                                  <th className="px-3 py-3 text-left text-white font-bold text-sm border-r border-white/20">
                                    Time
                                  </th>
                                  <th className="px-3 py-3 text-left text-white font-bold text-sm">
                                    Class Details
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10">
                                {allTimeSlots.map((time: string) => {
                                  const items = itemsByTime[time];
                                  const hasHalls = items.some((item: any) => item.hall);
                                  
                                  if (!hasHalls) {
                                    // Special event row (break, Greek Night, Guinness)
                                    const item = items[0];
                                    const isHighlight = item.danceStyle.includes('Greek Night') || item.danceStyle.includes('Guinness');
                                    
                                    return (
                                      <tr key={time}>
                                        <td colSpan={2} className="px-3 py-4">
                                          <div className={`rounded-lg p-4 border-2 text-center ${
                                            isHighlight
                                              ? 'bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-pink-400/30 border-yellow-400/60'
                                              : 'bg-white/5 border-white/20'
                                          }`}>
                                            <div className={`font-bold text-base mb-1 ${
                                              isHighlight 
                                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300' 
                                                : 'text-white'
                                            }`}>
                                              {item.time}
                                            </div>
                                            <div className={`font-semibold text-sm ${
                                              isHighlight 
                                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200' 
                                                : 'text-blue-100'
                                            }`}>
                                              {item.danceStyle}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  }
                                  
                                  // Regular class row
                                  const hallItem = items.find((item: any) => item.hall === activeHall);
                                  
                                  return (
                                    <tr key={time} className="hover:bg-white/5 transition-colors">
                                      <td className="px-3 py-3 text-white font-semibold text-sm border-r border-white/20 whitespace-nowrap align-top">
                                        {time}
                                      </td>
                                      <td className="px-3 py-3">
                                        {hallItem ? (
                                          <div 
                                            className="rounded-lg p-3 border-l-4"
                                            style={{
                                              backgroundColor: hallItem.color ? `${hallItem.color}15` : 'rgba(255,255,255,0.05)',
                                              borderLeftColor: hallItem.color || 'rgba(255,255,255,0.3)'
                                            }}
                                          >
                                            <div className="space-y-1">
                                              <div className="text-white font-bold text-sm">
                                                {hallItem.danceStyle}
                                              </div>
                                              <div className="text-blue-100 text-xs">
                                                <span className="font-semibold text-white">{t.home.lecturer}:</span> {hallItem.lecturer}
                                              </div>
                                              <div className="text-blue-100 text-xs">
                                                <span className="font-semibold text-white">{t.home.level}:</span> {hallItem.level}
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-blue-200 text-xs italic py-2">
                                            {t.home.noClass}
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-blue-100 text-center">Schedule coming soon...</p>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Festival Information */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">{t.home.aboutTitle}</h3>
            <p className="text-blue-100 leading-relaxed">
              {t.home.aboutDescription}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">{t.home.whatToExpectTitle}</h3>
            <ul className="text-blue-100 space-y-3">
              <li className="flex items-start">
                <span className="text-2xl mr-2">🎭</span>
                <span>{t.home.traditionalPerformances}</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-2">✨</span>
                <span>{t.home.unforgettableExperience}</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-2">👥</span>
                <span>{t.home.interactiveWorkshops}</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-2">🍽️</span>
                <span>{t.home.authenticCuisine}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-4">{t.home.readyToJoinTitle}</h3>
          <p className="text-xl text-blue-100 mb-8">
            {t.home.readyToJoinDescription}
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-900 px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            {t.home.registerToday}
          </Link>
        </div>
      </div>
    </div>
  );
}
