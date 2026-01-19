"use client";

import { SessionProvider } from "next-auth/react";
import { AnalyticsProvider } from "./components/AnalyticsProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
