import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/ToastContext";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6D4AFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ExamForge-AI",
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
    title: "ExamForge-AI | Premium Cognitive Exam Prep",
    description:
      "Convert your textbooks, notes & study materials into personalized mock tests and automated summary cards.",
    url: "https://examforge.ai",
    siteName: "ExamForge-AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExamForge-AI",
    description: "AI-Powered Personalized Exam Prep and Study Platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} antialiased min-h-screen text-slate-800 bg-slate-50 selection:bg-indigo-500/15 selection:text-[#6D4AFF]`}
      >
        <AuthProvider>
          <ToastProvider>
            <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden">
              {/* Premium Background Mesh Glows */}
              <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh opacity-45" />
              <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-25" />
              
              {/* Main Content Tree */}
              <div className="flex-grow w-full flex flex-col">
                {children}
              </div>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
