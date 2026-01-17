"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

// Convert path to friendly page name
function getPageName(path: string): string {
  const pathMap: Record<string, string> = {
    "/": "Home",
    "/pricing": "Pricing",
    "/register": "Registration",
    "/information": "Information",
    "/login": "Login",
    "/signup": "Sign Up",
    "/dashboard": "Dashboard",
    "/admin": "Admin Panel",
    "/admin/analytics": "Admin Analytics",
  };
  
  return pathMap[path] || path;
}

// Generate a unique session ID for tracking
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

// Track analytics event
async function trackEvent(
  eventType: string,
  eventName: string,
  pagePath: string,
  metadata?: Record<string, any>
) {
  try {
    const sessionId = getSessionId();
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        eventName,
        pagePath,
        metadata,
        sessionId,
      }),
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug("Analytics tracking failed:", error);
  }
}

export function useAnalytics() {
  const pathname = usePathname();
  const trackedPages = useRef(new Set<string>());
  const pageStartTime = useRef<number>(Date.now());
  const currentPage = useRef<string>(pathname || "/");

  // Track page view with time spent on previous page
  useEffect(() => {
    const page = pathname || "/";
    const pageName = getPageName(page);
    const previousPageName = getPageName(currentPage.current);
    
    // Track time spent on previous page
    if (currentPage.current !== page) {
      const timeSpent = Date.now() - pageStartTime.current;
      trackEvent("page_leave", `${previousPageName}`, currentPage.current, {
        timeSpentMs: timeSpent,
        timeSpentSeconds: Math.round(timeSpent / 1000),
        nextPage: page,
        nextPageName: pageName,
      });
    }

    // Track entering new page
    trackEvent("page_view", `${pageName}`, page, {
      fullUrl: typeof window !== "undefined" ? window.location.href : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      screenWidth: typeof window !== "undefined" ? window.screen.width : 0,
      screenHeight: typeof window !== "undefined" ? window.screen.height : 0,
      timestamp: new Date().toISOString(),
    });

    currentPage.current = page;
    pageStartTime.current = Date.now();
  }, [pathname]);

  // Track page leave when component unmounts or window closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - pageStartTime.current;
      const pageName = getPageName(currentPage.current);
      trackEvent("page_leave", `${pageName}`, currentPage.current, {
        timeSpentMs: timeSpent,
        timeSpentSeconds: Math.round(timeSpent / 1000),
        reason: "window_close",
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, []);

  // Track click event
  const trackClick = useCallback((elementName: string, metadata?: Record<string, any>) => {
    trackEvent("click", `click_${elementName}`, pathname || "/", metadata);
  }, [pathname]);

  // Track navigation
  const trackNavigation = useCallback((destination: string, metadata?: Record<string, any>) => {
    trackEvent("navigation", `navigate_to_${destination}`, pathname || "/", {
      ...metadata,
      destination,
    });
  }, [pathname]);

  // Track form submission
  const trackFormSubmit = useCallback((formName: string, metadata?: Record<string, any>) => {
    trackEvent("form_submit", `submit_${formName}`, pathname || "/", metadata);
  }, [pathname]);

  // Track custom event
  const trackCustomEvent = useCallback((eventName: string, metadata?: Record<string, any>) => {
    trackEvent("custom", eventName, pathname || "/", metadata);
  }, [pathname]);

  return {
    trackClick,
    trackNavigation,
    trackFormSubmit,
    trackCustomEvent,
  };
}
