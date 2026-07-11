import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PromptMemory | Enterprise AI Context Vault",
  description: "Organize projects, capture cross-platform AI sessions, and generate instant continuation prompts.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' }
    ],
    shortcut: ['/icon.svg'],
    apple: ['/icon.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppShell>
              {children}
            </AppShell>
            <OnboardingModal />
            <Toaster theme="dark" position="bottom-right" className="!font-sans" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
