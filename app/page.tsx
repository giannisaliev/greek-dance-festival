import Link from "next/link";
import Image from "next/image";
import Navigation from "./components/Navigation";

async function getSchedule() {
  try {
    const res = await fetch(`http://localhost:3000/api/schedule`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const scheduleItems = await getSchedule();
  
  // Group schedule by day
  const scheduleByDay = {
    Friday: scheduleItems.filter((item: any) => item.day === "Friday"),
    Saturday: scheduleItems.filter((item: any) => item.day === "Saturday"),
    Sunday: scheduleItems.filter((item: any) => item.day === "Sunday"),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

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

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
          >
            Register Now
          </Link>
          <Link
            href="/pricing"
            className="bg-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors border-2 border-white/30"
          >
            View Packages
          </Link>
        </div>

        {/* Festival Schedule */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Festival Schedule</h3>
          
          <div className="space-y-8">
            {/* Friday Schedule */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h4 className="text-2xl font-bold text-white mb-6">Friday, June 12th</h4>
              {scheduleByDay.Friday.length > 0 ? (
                <div className="space-y-4">
                  {scheduleByDay.Friday.map((item: any) => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="grid md:grid-cols-5 gap-4">
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Time:</span> {item.time}
                        </div>
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Dance:</span> {item.danceStyle}
                        </div>
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Lecturer:</span> {item.lecturer}
                        </div>
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Level:</span> {item.level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-100 text-center">Schedule coming soon...</p>
              )}
            </div>

            {/* Saturday Schedule */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h4 className="text-2xl font-bold text-white mb-6">Saturday, June 13th</h4>
              {scheduleByDay.Saturday.length > 0 ? (
                <div className="space-y-4">
                  {scheduleByDay.Saturday.map((item: any) => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="grid md:grid-cols-5 gap-4">
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Time:</span> {item.time}
                        </div>
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Dance:</span> {item.danceStyle}
                        </div>
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Lecturer:</span> {item.lecturer}
                        </div>
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Level:</span> {item.level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-100 text-center">Schedule coming soon...</p>
              )}
            </div>

            {/* Sunday Schedule */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h4 className="text-2xl font-bold text-white mb-6">Sunday, June 14th</h4>
              {scheduleByDay.Sunday.length > 0 ? (
                <div className="space-y-4">
                  {scheduleByDay.Sunday.map((item: any) => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="grid md:grid-cols-5 gap-4">
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Time:</span> {item.time}
                        </div>
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Dance:</span> {item.danceStyle}
                        </div>
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Lecturer:</span> {item.lecturer}
                        </div>
                        <div className="text-blue-100">
                          <span className="font-semibold text-white">Level:</span> {item.level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-100 text-center">Schedule coming soon...</p>
              )}
            </div>
          </div>
        </div>

        {/* Festival Information */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">About the Festival</h3>
            <p className="text-blue-100 leading-relaxed">
              Join us for an unforgettable celebration of Greek culture! Our festival brings together dancers, musicians, 
              and enthusiasts from around the world to share in the joy of traditional Greek dance. Experience authentic 
              performances, workshops, and cultural events that showcase the rich heritage of Greece.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">What to Expect</h3>
            <ul className="text-blue-100 space-y-3">
              <li className="flex items-start">
                <span className="text-2xl mr-2">🎭</span>
                <span>Traditional Greek dance performances</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-2">🎵</span>
                <span>Live music from renowned Greek musicians</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-2">👥</span>
                <span>Interactive workshops and dance lessons</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-2">🍽️</span>
                <span>Authentic Greek cuisine and refreshments</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Join Us?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Don&apos;t miss this incredible opportunity to be part of the Greek Dance Festival!
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-900 px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Register Today
          </Link>
        </div>
      </div>
    </div>
  );
}
