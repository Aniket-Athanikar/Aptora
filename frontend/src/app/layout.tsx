import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/ToastContext";
import { ProfileProvider } from "@/contexts";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0fb37cff",
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
    title: "ExamForge-AI",
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
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  if (
                    args[0] &&
                    typeof args[0] === 'string' &&
                    (args[0].includes('THREE.Clock') ||
                     args[0].includes('Skipping auto-scroll') ||
                     args[0].includes('WebGLRenderer'))
                  ) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              })();
            `
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased min-h-screen text-slate-800 bg-slate-50 selection:bg-emerald-500/15 selection:text-emerald-600`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ProfileProvider>
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
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}