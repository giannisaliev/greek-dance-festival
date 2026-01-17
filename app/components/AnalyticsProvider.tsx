"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const analytics = useAnalytics();

  useEffect(() => {
    // Track all link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      const button = target.closest("button");

      if (link) {
        const href = link.getAttribute("href");
        const text = link.textContent?.trim() || "Unknown Link";
        analytics.trackNavigation(href || "unknown", { linkText: text });
      } else if (button) {
        const text = button.textContent?.trim() || "Unknown Button";
        const type = button.getAttribute("type");
        analytics.trackClick(text, { buttonType: type });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [analytics]);

  return <>{children}</>;
}
