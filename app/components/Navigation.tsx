"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/information", label: "Information" },
    { href: "/hotel", label: "Hotel" },
    { href: "/register", label: "Register" },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Don't render session-dependent UI until we know the status
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && session;

  return (
    <>
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-white hover:text-blue-200 transition-colors">
              <img src="/GUINESS.png" alt="Greek Dance Festival Logo" className="h-10 w-10 object-contain" />
              <span>Greek Dance Festival</span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6 items-center">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-white hover:text-blue-200 transition-colors ${
                    pathname === item.href ? "font-semibold" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* User Menu or Login */}
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors bg-white/10 px-4 py-2 rounded-lg"
                      >
                        <span>{session.user?.email?.split('@')[0]}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                          {(session.user as any)?.isAdmin && (
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              🛡️ Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors"
                          >
                            🚪 Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="text-white hover:text-blue-200 transition-colors bg-white/10 px-4 py-2 rounded-lg"
                    >
                      Login
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden relative w-10 h-10 text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span
                  className={`block absolute h-0.5 w-7 bg-white transform transition duration-300 ease-in-out ${
                    isOpen ? "rotate-45" : "-translate-y-2"
                  }`}
                ></span>
                <span
                  className={`block absolute h-0.5 w-7 bg-white transform transition duration-300 ease-in-out ${
                    isOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`block absolute h-0.5 w-7 bg-white transform transition duration-300 ease-in-out ${
                    isOpen ? "-rotate-45" : "translate-y-2"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Side Menu */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 shadow-2xl z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-blue-200 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Menu Title */}
          <h2 className="text-2xl font-bold text-white mb-12 mt-4">Menu</h2>

          {/* Menu Items with Beautiful Continuous Animations */}
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block group relative overflow-hidden rounded-xl transition-all duration-500"
                style={{
                  animation: `floatIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${index * 80}ms, float 3s ease-in-out infinite ${index * 0.5}s`,
                }}
              >
                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-blue-200 to-white animate-gradientRotate opacity-75 blur-sm"></div>
                
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 backdrop-blur-md border border-white/30 hover:border-white/50 rounded-xl px-6 py-5 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl">
                  {/* Continuous shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-xl"></div>
                  
                  {/* Animated orbs */}
                  <div className="absolute top-2 right-4 w-3 h-3 bg-blue-300 rounded-full animate-pulse opacity-60"></div>
                  <div className="absolute bottom-2 left-4 w-2 h-2 bg-white rounded-full animate-ping opacity-40"></div>
                  
                  <div className="relative flex items-center justify-between">
                    <span className={`text-xl font-bold tracking-wide ${
                      pathname === item.href ? "text-blue-200 animate-pulse" : "text-white"
                    } group-hover:text-white transition-all duration-300 transform group-hover:scale-110`}>
                      {item.label}
                    </span>
                    <div className="relative">
                      {/* Pulsing circle background */}
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-0 group-hover:opacity-30"></div>
                      <svg 
                        className="relative w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-2 group-hover:scale-125 transition-all duration-500 animate-bounce-subtle" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Animated bottom line */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 via-blue-200 to-white animate-expandContract rounded-full"></div>
                </div>
              </Link>
            ))}
          </div>

          {/* User Menu for Mobile */}
          {!isLoading && isAuthenticated && (
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="space-y-3">
                <div className="text-white/70 text-sm mb-3">
                  Signed in as: <span className="text-white font-semibold">{session.user?.email}</span>
                </div>
                {(session.user as any)?.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block bg-yellow-500/20 border-2 border-yellow-400/50 rounded-xl p-4 text-white hover:bg-yellow-500/30 transition-all"
                  >
                    🛡️ Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  className="block w-full bg-red-500/20 border-2 border-red-400/50 rounded-xl p-4 text-white hover:bg-red-500/30 transition-all text-left"
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isAuthenticated && (
            <div className="mt-8">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block bg-white/10 border-2 border-white/30 rounded-xl p-4 text-white hover:bg-white/20 transition-all text-center"
              >
                Login
              </Link>
            </div>
          )}

          {/* Decorative Elements */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="border-t border-white/20 pt-6">
              <p className="text-blue-200 text-sm text-center">
                Greek Dance Festival 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatIn {
          0% {
            opacity: 0;
            transform: translateX(50px) translateY(20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes gradientRotate {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes expandContract {
          0%, 100% {
            width: 20%;
            left: 0%;
          }
          50% {
            width: 80%;
            left: 10%;
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-gradientRotate {
          animation: gradientRotate 8s linear infinite;
        }

        .animate-expandContract {
          animation: expandContract 2s ease-in-out infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
