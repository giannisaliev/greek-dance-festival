"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const analytics = useAnalytics();

  useEffect(() => {
    // Track all clicks with detailed information
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      const button = target.closest("button");
      const clickedElement = link || button || target;

      // Get position information
      const rect = clickedElement.getBoundingClientRect();
      const position = {
        x: e.clientX,
        y: e.clientY,
        elementX: rect.left,
        elementY: rect.top,
        elementWidth: rect.width,
        elementHeight: rect.height,
      };

      // Get detailed element information
      const elementDetails = {
        tagName: clickedElement.tagName,
        id: clickedElement.id || null,
        className: clickedElement.className || null,
        text: clickedElement.textContent?.trim().substring(0, 100) || null,
        href: link?.getAttribute("href") || null,
        type: button?.getAttribute("type") || clickedElement.getAttribute("type") || null,
        ariaLabel: clickedElement.getAttribute("aria-label") || null,
        title: clickedElement.getAttribute("title") || null,
        dataAttributes: getDataAttributes(clickedElement),
        position,
        timestamp: new Date().toISOString(),
      };

      if (link) {
        const href = link.getAttribute("href");
        const text = link.textContent?.trim() || "Unknown Link";
        analytics.trackNavigation(href || "unknown", { 
          linkText: text,
          ...elementDetails,
          clickType: "link",
        });
      } else if (button) {
        const text = button.textContent?.trim() || "Unknown Button";
        analytics.trackClick(text, { 
          ...elementDetails,
          clickType: "button",
        });
      } else {
        // Track other clickable elements
        const text = clickedElement.textContent?.trim().substring(0, 50) || "Unknown Element";
        analytics.trackClick(text, {
          ...elementDetails,
          clickType: "element",
        });
      }
    };

    document.addEventListener("click", handleClick, true); // Use capture phase
    return () => document.removeEventListener("click", handleClick, true);
  }, [analytics]);

  return <>{children}</>;
}

// Helper function to extract data attributes
function getDataAttributes(element: HTMLElement): Record<string, string> {
  const dataAttrs: Record<string, string> = {};
  Array.from(element.attributes).forEach(attr => {
    if (attr.name.startsWith("data-")) {
      dataAttrs[attr.name] = attr.value;
    }
  });
  return dataAttrs;
}
