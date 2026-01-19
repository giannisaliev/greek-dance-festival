'use client';

import { useState, useEffect } from 'react';
import Navigation from "../components/Navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Attraction {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  order: number;
}

// Default attractions (used when database is empty)
const defaultAttractions: Attraction[] = [
  {
    id: 'default-1',
    title: 'White Tower',
    description: "The iconic symbol of Thessaloniki, this 15th-century Ottoman fortification offers panoramic views of the city and the Thermaic Gulf. Now a museum showcasing the city's history.",
    image: 'https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?w=800&q=80',
    badge: '15 min walk from waterfront',
    order: 0
  },
  {
    id: 'default-2',
    title: 'Rotunda',
    description: 'A UNESCO World Heritage Site dating back to the 4th century. Originally built as a mausoleum, it features stunning Byzantine mosaics and impressive architecture.',
    image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
    badge: 'UNESCO World Heritage',
    order: 1
  },
  {
    id: 'default-3',
    title: 'Ano Poli (Upper Town)',
    description: 'Wander through narrow cobblestone streets, traditional houses, and Byzantine walls. This historic neighborhood offers breathtaking views and authentic Greek atmosphere.',
    image: 'https://images.unsplash.com/photo-1601823984263-b55f31c1c650?w=800&q=80',
    badge: 'Best sunset views',
    order: 2
  },
  {
    id: 'default-4',
    title: 'Archaeological Museum',
    description: 'Home to priceless artifacts from ancient Macedonia, including treasures from the royal tombs of Vergina and stunning gold jewelry from the Hellenistic period.',
    image: 'https://images.unsplash.com/photo-1566127444979-b3d2b3c9e9c0?w=800&q=80',
    badge: 'Ancient Macedonian treasures',
    order: 3
  },
  {
    id: 'default-5',
    title: 'Ladadika District',
    description: "A vibrant entertainment district filled with colorful restored buildings, tavernas, bars, and restaurants. Perfect for experiencing Thessaloniki's nightlife and cuisine.",
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    badge: 'Nightlife & dining hub',
    order: 4
  },
  {
    id: 'default-6',
    title: 'Waterfront Promenade',
    description: 'A scenic 3.5km promenade along the Thermaic Gulf. Ideal for walking, cycling, or relaxing at seaside cafes while enjoying views of Mount Olympus on clear days.',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80',
    badge: 'Perfect for sunset walks',
    order: 5
  }
];

export default function InformationPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'guinness' | 'workshop'>('guinness');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoadingAttractions, setIsLoadingAttractions] = useState(true);

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const res = await fetch('/api/attractions');
      if (res.ok) {
        const data = await res.json();
        // Use database attractions if available, otherwise use defaults
        setAttractions(data.length > 0 ? data : defaultAttractions);
      } else {
        // If API fails, use defaults
        setAttractions(defaultAttractions);
      }
    } catch (error) {
      console.error('Error fetching attractions:', error);
      // If fetch fails, use defaults
      setAttractions(defaultAttractions);
    } finally {
      setIsLoadingAttractions(false);
    }
  };

  // Function to get translated attraction data
  const getTranslatedAttraction = (attraction: Attraction) => {
    const translationMap: { [key: string]: { title: string; description: string; badge: string } } = {
      'White Tower': {
        title: language === 'el' ? t.information.whiteTower : 'White Tower',
        description: language === 'el' ? t.information.whiteTowerDesc : attraction.description,
        badge: language === 'el' ? t.information.whiteTowerBadge : attraction.badge,
      },
      'Rotunda': {
        title: language === 'el' ? t.information.rotunda : 'Rotunda',
        description: language === 'el' ? t.information.rotundaDesc : attraction.description,
        badge: language === 'el' ? t.information.rotundaBadge : attraction.badge,
      },
      'Ano Poli (Upper Town)': {
        title: language === 'el' ? t.information.anoPoli : 'Ano Poli (Upper Town)',
        description: language === 'el' ? t.information.anoPoliDesc : attraction.description,
        badge: language === 'el' ? t.information.anoPoliBadge : attraction.badge,
      },
      'Archaeological Museum': {
        title: language === 'el' ? t.information.archaeologicalMuseum : 'Archaeological Museum',
        description: language === 'el' ? t.information.archaeologicalMuseumDesc : attraction.description,
        badge: language === 'el' ? t.information.archaeologicalMuseumBadge : attraction.badge,
      },
      'Ladadika District': {
        title: language === 'el' ? t.information.ladadika : 'Ladadika District',
        description: language === 'el' ? t.information.ladadikaDesc : attraction.description,
        badge: language === 'el' ? t.information.ladadikaBadge : attraction.badge,
      },
      'Waterfront Promenade': {
        title: language === 'el' ? t.information.waterfrontPromenade : 'Waterfront Promenade',
        description: language === 'el' ? t.information.waterfrontPromenadeDesc : attraction.description,
        badge: language === 'el' ? t.information.waterfrontPromenadeBadge : attraction.badge,
      },
    };

    return translationMap[attraction.title] || {
      title: attraction.title,
      description: attraction.description,
      badge: attraction.badge,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            {t.information.festivalInfoTitle}
          </h1>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-8 flex gap-4 justify-center">
          <button
            onClick={() => setActiveTab('guinness')}
            className={`flex-1 max-w-xs py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
              activeTab === 'guinness'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl scale-105'
                : 'bg-white/10 text-white border-2 border-white/20 hover:border-white/40'
            }`}
          >
            🏆 {t.information.guinnessRecordTab}
          </button>
          <button
            onClick={() => setActiveTab('workshop')}
            className={`flex-1 max-w-xs py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
              activeTab === 'workshop'
                ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-xl scale-105'
                : 'bg-white/10 text-white border-2 border-white/20 hover:border-white/40'
            }`}
          >
            🎭 {t.information.workshopsTab}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Guinness Record Location */}
          <div className={`bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/20 flex flex-col ${
            activeTab === 'guinness' ? 'block' : 'hidden lg:flex'
          }`}>
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full animate-pulse shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 text-center mb-2">
                🏆 {t.information.guinnessRecordTitle}
              </h2>
              <div className="bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-pink-400/20 rounded-xl p-4 border-2 border-yellow-400/50 mb-6">
                <div className="text-center">
                  <p className="text-white font-bold text-2xl mb-2">{t.information.sundayDate}</p>
                  <p className="text-yellow-200 font-bold text-3xl">{t.information.time12pm}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <h3 className="text-white font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {t.information.locationLabel}
                </h3>
                <p className="text-blue-100 font-semibold">{t.information.aristotelousSquare}</p>
                <p className="text-blue-200 text-sm">{t.information.thessaloniki}</p>
              </div>
            </div>
            
            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 hover:border-yellow-400/50 transition-colors duration-300">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d825.4823985025275!2d22.940773521181264!3d40.6324654401109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a8390885a99cbd%3A0xe39e3d18ec8160ab!2sAristotle%20Square!5e0!3m2!1sen!2sgr!4v1768406943270!5m2!1sen!2sgr"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              ></iframe>
            </div>
            
            <a
              href="https://www.google.com/maps/search/?api=1&query=40.6324654,22.9407735"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-4 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              {t.information.openInMaps}
            </a>
          </div>

          {/* Workshop Location */}
          <div className={`bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20 flex flex-col ${
            activeTab === 'workshop' ? 'block' : 'hidden lg:flex'
          }`}>
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-4 rounded-full animate-bounce shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 text-center mb-2">
                🎭 {t.information.workshopLocationTitle}
              </h2>
              <div className="bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-xl p-4 border-2 border-blue-400/50 mb-6">
                <div className="text-center">
                  <p className="text-white font-bold text-xl mb-1">{t.information.fridayToSunday}</p>
                  <p className="text-blue-200 font-semibold text-lg">{t.information.festivalDates}</p>
                  <a href="/#schedule" className="inline-block mt-2 text-yellow-300 hover:text-yellow-200 font-semibold underline transition-colors duration-200">
                    {t.information.viewFullSchedule} →
                  </a>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <h3 className="text-white font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {t.information.locationLabel}
                </h3>
                <p className="text-blue-100 font-semibold">{t.information.ymcaThessaloniki}</p>
                <p className="text-blue-200 text-sm">{t.information.thessaloniki}</p>
              </div>
            </div>
            
            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 hover:border-blue-400/50 transition-colors duration-300">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d565.6499229414236!2d22.95216373764882!3d40.62661132017817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a839026870857f%3A0x7ac841aaf16c594d!2sYMCA%20-%20Young%20Men&#39;s%20Christian%20Association!5e0!3m2!1sen!2sgr!4v1768407001042!5m2!1sen!2sgr"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              ></iframe>
            </div>
            
            <a
              href="https://www.google.com/maps/search/?api=1&query=40.6266113,22.9521637"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white text-center py-4 rounded-full font-bold text-lg hover:from-blue-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              {t.information.openInMaps}
            </a>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-3xl p-8 border-2 border-white/30">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            📍 {t.information.importantNotes}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h4 className="font-bold text-white text-lg mb-3 flex items-center">
                <span className="text-2xl mr-2">🚌</span>
                {t.information.gettingAround}
              </h4>
              <p className="text-blue-100 text-sm">
                {t.information.gettingAroundText}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h4 className="font-bold text-white text-lg mb-3 flex items-center">
                <span className="text-2xl mr-2">🅿️</span>
                {t.information.parking}
              </h4>
              <p className="text-blue-100 text-sm">
                {t.information.parkingText}
              </p>
            </div>
          </div>
        </div>

        {/* Sightseeing Section */}
        <div className="mt-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <span>🏛️</span>
              {t.information.exploreThessaloniki}
              <span>🌟</span>
            </h2>
            <p className="text-blue-100 text-lg">
              {t.information.exploreDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingAttractions ? (
              <div className="col-span-full text-center text-white py-12">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading attractions...</p>
              </div>
            ) : (
              attractions.map((attraction) => {
                const translated = getTranslatedAttraction(attraction);
                return (
                <div
                  key={attraction.id}
                  className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={attraction.image}
                      alt={translated.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white">
                        {translated.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-blue-100 text-sm mb-4">
                      {translated.description}
                    </p>
                    <div className="flex items-center text-yellow-300 text-sm">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {translated.badge}
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>

          {/* Travel Tips */}
          <div className="mt-10 bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-3xl p-8 border-2 border-green-400/30">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
              <span>💡</span>
              {t.information.travelTipsTitle}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-5 border border-white/20">
                <div className="text-3xl mb-3">🎫</div>
                <h4 className="font-bold text-white text-lg mb-2">{t.information.cityPassTitle}</h4>
                <p className="text-blue-100 text-sm">
                  {t.information.cityPassDesc}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-5 border border-white/20">
                <div className="text-3xl mb-3">🍽️</div>
                <h4 className="font-bold text-white text-lg mb-2">{t.information.localCuisineTitle}</h4>
                <p className="text-blue-100 text-sm">
                  {t.information.localCuisineDesc}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-5 border border-white/20">
                <div className="text-3xl mb-3">🚶</div>
                <h4 className="font-bold text-white text-lg mb-2">{t.information.bestWayTitle}</h4>
                <p className="text-blue-100 text-sm">
                  {t.information.bestWayDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
