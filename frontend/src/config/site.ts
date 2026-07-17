/**
 * ExamForge AI — Site Configuration
 * Central metadata and SEO defaults.
 */
export const siteConfig = {
  name: "ExamForge AI",
  description:
    "Upload books, notes & PYQs. Our AI will create personalized notes, generate questions, track your progress and make you exam-ready!",
  url: "https://examforge.ai",
  ogImage: "/favicon.png",
  links: {
    github: "https://github.com/Aniket-Athanikar/Exam_Forge",
  },
  creator: "ExamForge AI Team",
  keywords: [
    "exam preparation",
    "AI study assistant",
    "SSC",
    "UPSC",
    "GATE",
    "Banking",
    "mock tests",
    "competitive exams",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
