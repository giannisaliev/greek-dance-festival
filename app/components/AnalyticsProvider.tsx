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

      // Generate descriptive event name
      const getDescriptiveName = (element: HTMLElement): string => {
        // Priority 1: aria-label (most descriptive)
        const ariaLabel = element.getAttribute("aria-label");
        if (ariaLabel) return ariaLabel;
        
        // Priority 2: title attribute
        const title = element.getAttribute("title");
        if (title) return title;
        
        // Priority 3: data-analytics-name or data-name
        const dataName = element.getAttribute("data-analytics-name") || element.getAttribute("data-name");
        if (dataName) return dataName;
        
        // Priority 4: For links, combine text with href context
        if (link) {
          const text = element.textContent?.trim() || "";
          const href = link.getAttribute("href") || "";
          
          // Special cases for social media links
          if (href.includes("instagram.com")) return `Instagram - ${text}`;
          if (href.includes("facebook.com")) return `Facebook - ${text}`;
          if (href.includes("twitter.com") || href.includes("x.com")) return `Twitter - ${text}`;
          if (href.includes("youtube.com")) return `YouTube - ${text}`;
          if (href.includes("linkedin.com")) return `LinkedIn - ${text}`;
          
          // For internal links, show destination
          if (href.startsWith("/")) {
            return text ? `${text} (→ ${href})` : `Navigate to ${href}`;
          }
          
          return text || `Link to ${href}`;
        }
        
        // Priority 5: Button text with parent context
        if (button) {
          let text = element.textContent?.trim() || "";
          
          // Look for context in parent elements
          let parent = element.parentElement;
          let depth = 0;
          while (parent && depth < 3) {
            const parentText = parent.getAttribute("data-section") || parent.getAttribute("data-context");
            if (parentText) {
              return `${text} (${parentText})`;
            }
            parent = parent.parentElement;
            depth++;
          }
          
          return text || "Button";
        }
        
        // Priority 6: Element text content
        return element.textContent?.trim().substring(0, 50) || "Element";
      };

      const descriptiveName = getDescriptiveName(clickedElement);

      if (link) {
        const href = link.getAttribute("href");
        analytics.trackNavigation(href || "unknown", { 
          linkText: descriptiveName,
          ...elementDetails,
          clickType: "link",
        });
      } else if (button) {
        analytics.trackClick(descriptiveName, { 
          ...elementDetails,
          clickType: "button",
        });
      } else {
        analytics.trackClick(descriptiveName, {
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
