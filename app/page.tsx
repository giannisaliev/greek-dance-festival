"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "./components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/* ─── Firework helpers ─── */
const FW_COLORS = [
  "#FFD700", "#FF6B6B", "#4FC3F7", "#81C784",
  "#FF8A65", "#CE93D8", "#F06292", "#80DEEA",
];

function FireworkBurst({ delaySec = 0, cycleSec = 3.5, colors = FW_COLORS }: {
  delaySec?: number;
  cycleSec?: number;
  colors?: string[];
}) {
  const numParticles = 12;
  const angles = Array.from({ length: numParticles }, (_, i) => (360 / numParticles) * i);

  return (
    <div
      style={{
        position: "relative",
        width: "10px",
        height: "10px",
        animation: `fw-burst-cycle ${cycleSec}s ${delaySec}s infinite ease-out`,
      }}
    >
      {/* Particles */}
      {angles.map((angle, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: i % 4 === 0 ? "6px" : "4px",
            height: i % 4 === 0 ? "6px" : "4px",
            marginTop: "-3px",
            marginLeft: "-3px",
            borderRadius: "50%",
            backgroundColor: colors[i % colors.length],
            boxShadow: `0 0 5px 1px ${colors[i % colors.length]}`,
            "--fw-angle": `${angle}deg`,
            animation: `fw-particle ${cycleSec * 0.33}s ${delaySec}s infinite ease-out`,
          } as React.CSSProperties}
        />
      ))}

      {/* Center flash */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: "white",
          boxShadow: "0 0 10px 4px rgba(255,255,255,0.95)",
          animation: `fw-center-flash ${cycleSec * 0.33}s ${delaySec}s infinite ease-out`,
        }}
      />
    </div>
  );
}

function FireworkColumn({ side }: { side: "left" | "right" }) {
  const bursts: { top: string; delay: number; cycle: number; colors: string[] }[] = [
    { top: "5%",  delay: 0,    cycle: 3.5, colors: ["#FFD700","#FFF176","#FF8F00","#FFCA28"] },
    { top: "22%", delay: 0.9,  cycle: 4,   colors: ["#EF5350","#F48FB1","#EC407A","#FFCDD2"] },
    { top: "40%", delay: 1.7,  cycle: 3.8, colors: ["#26C6DA","#80DEEA","#4FC3F7","#B3E5FC"] },
    { top: "57%", delay: 2.5,  cycle: 3.2, colors: ["#66BB6A","#A5D6A7","#C6FF00","#DCEDC8"] },
    { top: "74%", delay: 0.4,  cycle: 4.2, colors: ["#AB47BC","#CE93D8","#E040FB","#E1BEE7"] },
    { top: "88%", delay: 1.3,  cycle: 3.6, colors: ["#FF7043","#FFAB91","#FFD54F","#FFCCBC"] },
  ];

  return (
    <div
      className="hidden md:flex"
      style={{
        position: "absolute",
        top: 0,
        [side]: "-90px",
        height: "100%",
        width: "80px",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        pointerEvents: "none",
      }}
    >
      {bursts.map((b, i) => (
        <div key={i} style={{ position: "absolute", top: b.top, left: "50%", transform: "translateX(-50%)" }}>
          <FireworkBurst delaySec={b.delay} cycleSec={b.cycle} colors={b.colors} />
        </div>
      ))}
    </div>
  );
}

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
  const [hallLocations, setHallLocations] = useState<{[key: string]: {url?: string; name?: string; image?: string}}>({});
  const [greekNightMapUrl, setGreekNightMapUrl] = useState<string>("");
  const [greekNightBannerEnabled, setGreekNightBannerEnabled] = useState<boolean>(false);
  const [activeMapModal, setActiveMapModal] = useState<{
    day: string; hall: string;
    url?: string; name?: string; image?: string;
    activeTab: 'map' | 'photo';
  } | null>(null);

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
    
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setHallLocations({
            "Friday-Hall 1":   { url: data.fridayHall1MapUrl || "",   name: data.fridayHall1Name || "",   image: data.fridayHall1Image || "" },
            "Friday-Hall 2":   { url: data.fridayHall2MapUrl || "",   name: data.fridayHall2Name || "",   image: data.fridayHall2Image || "" },
            "Saturday-Hall 1": { url: data.saturdayHall1MapUrl || "", name: data.saturdayHall1Name || "", image: data.saturdayHall1Image || "" },
            "Saturday-Hall 2": { url: data.saturdayHall2MapUrl || "", name: data.saturdayHall2Name || "", image: data.saturdayHall2Image || "" },
          });
          setGreekNightMapUrl(data.greekNightMapUrl || "");
          setGreekNightBannerEnabled(data.greekNightBannerEnabled ?? false);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    }

    fetchSchedule();
    fetchStudios();
    fetchSettings();
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
  
  const getHallLoc = (day: string, hall: string) => hallLocations[`${day}-${hall}`] || {};
  const getHallMapUrl = (day: string, hall: string) => getHallLoc(day, hall).url || undefined;
  const getHallName  = (day: string, hall: string) => getHallLoc(day, hall).name || undefined;
  const getHallImage = (day: string, hall: string) => getHallLoc(day, hall).image || undefined;
  const hasHallLocation = (day: string, hall: string) =>
    !!(getHallMapUrl(day, hall) || getHallImage(day, hall));
  // Match the Greek Night row regardless of case/emoji (e.g. "🎉 GREEK NIGHT 🎉")
  const isGreekNight = (s: string) => /greek\s*night/i.test(s || "");

  function getGoogleMapsEmbedUrl(url: string): string {
    if (!url) return '';
    if (url.includes('/maps/embed') || url.includes('output=embed')) return url;
    const coordFull = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+\.?\d*)z/);
    if (coordFull) return `https://www.google.com/maps/@${coordFull[1]},${coordFull[2]},${coordFull[3]}z?output=embed`;
    const coordShort = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordShort) return `https://www.google.com/maps/@${coordShort[1]},${coordShort[2]},15z?output=embed`;
    if (url.includes('google.com/maps')) return url + (url.includes('?') ? '&' : '?') + 'output=embed';
    return url;
  }

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
        // Repeat studios until each group has enough items to fill any screen width.
        // Each card is ~164px wide (100px + 2×32px margin). 16 items ≈ 2600px covers 4K+.
        const minPerGroup = Math.max(16, studios.length);
        const repeats = Math.ceil(minPerGroup / studios.length);
        const groupItems = Array.from({ length: repeats }, () => studios).flat();

        const studioCard = (studio: typeof studios[0], idx: number, prefix: string) => (
          <div
            key={`${prefix}-${idx}`}
            className="flex flex-col items-center mx-8 group flex-shrink-0"
            style={{ width: '100px' }}
          >
            {/* Logo or initials fallback */}
            <div className="h-14 w-full flex items-center justify-center">
              {studio.logo ? (
                <img
                  src={studio.logo}
                  alt={studio.name}
                  className="max-h-14 max-w-full w-auto object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg leading-none">
                    {studio.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 3)}
                  </span>
                </div>
              )}
            </div>
            {/* Studio name */}
            <p className="text-white text-xs font-semibold mt-2 text-center leading-tight w-full truncate">
              {studio.name}
            </p>
            {/* Country flag + name */}
            <div className="flex items-center gap-1 mt-0.5 justify-center">
              <img
                src={`https://flagcdn.com/w20/${studio.countryCode.toLowerCase()}.png`}
                alt={studio.country}
                className="w-4 h-auto rounded-sm flex-shrink-0"
              />
              <p className="text-blue-200 text-xs truncate">{studio.country}</p>
            </div>
          </div>
        );
        return (
          <div className="w-full bg-white/5 backdrop-blur-sm border-b border-white/10 py-5 overflow-hidden relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-blue-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-blue-900 to-transparent z-10 pointer-events-none" />

            {/* Title */}
            <p className="text-center text-yellow-300 font-bold text-xs tracking-widest uppercase mb-4 opacity-90">
              🏆 Guinness Record Dance Studios
            </p>

            {/* Scrolling track: two identical groups = seamless loop at -50% */}
            <div className="overflow-hidden">
              <div className="marquee-track">
                {/* Group 1 */}
                <div className="marquee-group">
                  {groupItems.map((studio, idx) => studioCard(studio, idx, 'a'))}
                </div>
                {/* Group 2 - identical, for seamless loop */}
                <div className="marquee-group" aria-hidden="true">
                  {groupItems.map((studio, idx) => studioCard(studio, idx, 'b'))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Greek Night banner box (toggle in admin) */}
        {greekNightBannerEnabled && (
          <div className="mb-8 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-pink-400/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 border-2 border-yellow-400/60 shadow-2xl text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 mb-2">
              🍷 {t.home.greekNight}
            </h3>
            <p className="text-white text-base sm:text-lg mb-5">
              {t.home.greekNightBannerText}
            </p>
            {greekNightMapUrl && (
              <a
                href={greekNightMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/25 hover:bg-white/40 text-white px-6 py-3 rounded-full text-base font-bold transition-all border-2 border-white/40 shadow-lg hover:shadow-xl hover:scale-105"
              >
                📍 {t.home.locationLabel || 'Location'}
              </a>
            )}
          </div>
        )}

        {/* Certificate celebration banner */}
        <Link
          href="/certificate"
          className="block max-w-2xl mx-auto mb-8 group"
        >
          <div className="bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-pink-400/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 border-2 border-yellow-400/60 shadow-2xl text-center transition-all group-hover:scale-[1.02] group-hover:border-yellow-300">
            <div className="text-4xl sm:text-5xl mb-3">🎉🏆🎉</div>
            <p className="text-white text-lg sm:text-xl font-bold mb-2">
              We did it! Congratulations, everyone for being part of this historical moment for Zeimpekiko!
            </p>
            <span className="inline-flex items-center gap-2 mt-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 px-6 py-3 rounded-full text-base sm:text-lg font-bold shadow-lg transition-all group-hover:from-yellow-300 group-hover:to-orange-300">
              📜 Get your Guinness Record certificate here!
            </span>
          </div>
        </Link>

        {/* Festival Flyer */}
        <div className="relative max-w-2xl mx-auto mb-8">
          {/* Fireworks — left side */}
          <FireworkColumn side="left" />
          {/* Fireworks — right side */}
          <FireworkColumn side="right" />

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-2xl">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden">
              <Image
                src="/Guiness flyer.png"
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
              
              // Only show halls that have at least one lesson on this day
              const usedHalls = Array.from(
                new Set(dayItems.filter((i: any) => i.hall).map((i: any) => i.hall))
              ).sort() as string[];

              const activeHall = usedHalls.includes(activeHalls[day])
                ? activeHalls[day]
                : usedHalls[0] || "Hall 1";

              const gridColsClass =
                usedHalls.length === 1 ? "grid-cols-1" :
                usedHalls.length === 2 ? "grid-cols-1 md:grid-cols-2" :
                "grid-cols-1 md:grid-cols-3";

              return (
                <div key={day} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                    <h4 className="text-2xl font-bold text-white">{dayName}, {dateMap[day]}</h4>
                    {/* Location pills for halls that have a map URL or image */}
                    {usedHalls.some(hall => hasHallLocation(day, hall)) && (
                      <div className="flex flex-wrap gap-2">
                        {usedHalls.filter(hall => hasHallLocation(day, hall)).map(hall => (
                          <button
                            key={hall}
                            onClick={() => setActiveMapModal({
                              day, hall,
                              url: getHallMapUrl(day, hall),
                              name: getHallName(day, hall),
                              image: getHallImage(day, hall),
                              activeTab: 'map',
                            })}
                            className="flex items-center gap-2 bg-white/25 hover:bg-white/40 text-white px-5 py-2.5 rounded-full text-base font-bold transition-all border-2 border-white/40 shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            📍 {getHallName(day, hall) || `${hall} Location`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
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
                            const isHighlight = isGreekNight(item.danceStyle) || item.danceStyle.includes('Guinness');
                            
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
                                {isGreekNight(item.danceStyle) && greekNightMapUrl && (
                                  <a
                                    href={greekNightMapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-3 bg-white/25 hover:bg-white/40 text-white px-5 py-2.5 rounded-full text-base font-bold transition-all border-2 border-white/40 shadow-lg hover:shadow-xl hover:scale-105"
                                  >
                                    📍 {t.home.locationLabel || 'Location'}
                                  </a>
                                )}
                              </div>
                            );
                          }

                          // Regular sessions with halls
                          return (
                            <div key={time}>
                              <div className="text-white font-semibold mb-3 text-center text-lg bg-white/5 rounded-lg py-2">
                                {time}
                              </div>
                              <div className={`grid ${gridColsClass} gap-4`}>
                                {usedHalls.map((hall) => {
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
                        <div className="flex flex-wrap gap-2 pb-2">
                          {usedHalls.map((hall) => (
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
                          {hasHallLocation(day, activeHall) && (
                            <button
                              onClick={() => setActiveMapModal({
                                day, hall: activeHall,
                                url: getHallMapUrl(day, activeHall),
                                name: getHallName(day, activeHall),
                                image: getHallImage(day, activeHall),
                                activeTab: 'map',
                              })}
                              className="px-5 py-2.5 rounded-lg font-bold bg-white/25 text-white hover:bg-white/40 transition-all whitespace-nowrap text-base border-2 border-white/40 shadow-lg"
                            >
                              📍 Location
                            </button>
                          )}
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
                                    const isHighlight = isGreekNight(item.danceStyle) || item.danceStyle.includes('Guinness');
                                    
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
                                            {isGreekNight(item.danceStyle) && greekNightMapUrl && (
                                              <a
                                                href={greekNightMapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 mt-3 bg-white/25 hover:bg-white/40 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 border-white/40 shadow-lg"
                                              >
                                                📍 {t.home.locationLabel || 'Location'}
                                              </a>
                                            )}
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

      {/* Location Modal */}
      {activeMapModal && (() => {
        const hasMap   = !!activeMapModal.url;
        const hasPhoto = !!activeMapModal.image;
        const showTabs = hasMap && hasPhoto;
        const tab      = activeMapModal.activeTab;
        const embedUrl = hasMap ? getGoogleMapsEmbedUrl(activeMapModal.url!) : '';

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setActiveMapModal(null)}
          >
            <div
              className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col"
              style={{ maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-blue-900 flex-shrink-0">
                <div>
                  <div className="text-blue-200 text-xs font-semibold uppercase tracking-wider">
                    {activeMapModal.day} — {activeMapModal.hall}
                  </div>
                  {activeMapModal.name && (
                    <div className="text-white font-bold text-xl leading-tight mt-0.5">
                      {activeMapModal.name}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setActiveMapModal(null)}
                  className="text-white hover:text-blue-200 text-3xl leading-none font-light ml-4"
                >
                  ×
                </button>
              </div>

              {/* Tabs — only shown when both map and photo exist */}
              {showTabs && (
                <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  {(['map', 'photo'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveMapModal({ ...activeMapModal, activeTab: t })}
                      className={`flex-1 py-3 text-sm font-bold transition-colors ${
                        tab === t
                          ? 'text-blue-900 border-b-2 border-blue-900 bg-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {t === 'map' ? '📍 Map' : '🖼️ Photo'}
                    </button>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="relative flex-1 min-h-0" style={{ height: '400px' }}>
                {/* Map tab */}
                {(!showTabs || tab === 'map') && hasMap && (
                  <iframe
                    key={embedUrl}
                    src={embedUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${activeMapModal.day} ${activeMapModal.hall} Location`}
                  />
                )}
                {/* Photo tab */}
                {(!showTabs || tab === 'photo') && hasPhoto && (
                  <img
                    src={activeMapModal.image}
                    alt={activeMapModal.name || `${activeMapModal.hall} location`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end flex-shrink-0">
                {hasMap && (
                  <a
                    href={activeMapModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-900 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-sm"
                  >
                    Open in Google Maps ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
