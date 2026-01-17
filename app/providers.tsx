"use client";

import { SessionProvider } from "next-auth/react";
import { AnalyticsProvider } from "./components/AnalyticsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </SessionProvider>
  );
}
