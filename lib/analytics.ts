"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

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

  // Track page view
  useEffect(() => {
    if (pathname && !trackedPages.current.has(pathname)) {
      trackedPages.current.add(pathname);
      trackEvent("page_view", `view_${pathname}`, pathname);
    }
  }, [pathname]);

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
