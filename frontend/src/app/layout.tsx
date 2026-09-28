import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/ToastContext";
import { ProfileProvider } from "@/contexts";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#084c38",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Aptora",
  description:
    "Aptora is an AI-powered exam preparation platform that helps students build personalized study plans, practice with mock tests, organize notes and track their progress.",
  keywords: [
    "Aptora",
    "education",
    "UPSC prep",
    "SSC CGL",
    "Banking exams",
    "exam preparation",
    "personalized study plan",
    "AI tutor",
    "mock tests",
    "study assistant",
    "active recall",
  ],
  authors: [{ name: "Aptora Team" }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Aptora — AI-Powered Exam Preparation",
    description:
      "Aptora is an AI-powered exam preparation platform that helps students build personalized study plans, practice with mock tests, organize notes and track their progress.",
    url: "https://aptora.ai",
    siteName: "Aptora",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aptora — AI-Powered Exam Preparation",
    description:
      "Aptora is an AI-powered exam preparation platform that helps students build personalized study plans, practice with mock tests, organize notes and track their progress.",
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
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
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
            `,
          }}
        />
      </head>
      <body
        className="font-sans antialiased min-h-screen text-slate-800 bg-[#FAF9F6] selection:bg-[#ecfdf5] selection:text-[#084c38]"
        suppressHydrationWarning
      >
        <AuthProvider>
          <ProfileProvider>
            <ToastProvider>
              <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden bg-[#FAF9F6]">
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