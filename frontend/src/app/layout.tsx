import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/ToastContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#5a36ee",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ExamForge AI",
  description:
    "Upload books, notes & PYQs. Our AI generates tailored study guides, mock tests, and provides personalized tracking to ensure you ace your exams.",
  keywords: [
    "education",
    "exam preparation",
    "personalized notes",
    "AI tutor",
    "mock exams",
    "study assistant",
    "active recall",
  ],
  authors: [{ name: "ExamForge Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ExamForge AI",
    description:
      "Convert your textbooks, notes & study materials into personalized mock tests and automated summary cards.",
    url: "https://examforge.ai",
    siteName: "ExamForge AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExamForge AI",
    description: "AI-Powered Personalized Exam Prep and Study Platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} antialiased min-h-screen text-slate-900 bg-[var(--background)] selection:bg-indigo-500/15 selection:text-indigo-700`}
      >
        <AuthProvider>
          <ToastProvider>
            <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden">
              <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh opacity-60" />
              <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-30" />
              {children}
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
