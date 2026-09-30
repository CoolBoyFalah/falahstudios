"use client";

import { PreferencesProvider } from "../lib/i18n";
import { ToastProvider } from "./ui";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <ToastProvider>{children}</ToastProvider>
    </PreferencesProvider>
  );
}
