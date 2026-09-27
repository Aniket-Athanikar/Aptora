import * as LucideIcons from "lucide-react";

export const PRESET_EXAMS = [
  { name: "UPSC CSE", category: "Civil Services", color: "from-[#084c38] to-[#059669]", icon: "FileText", glow: "rgba(8, 76, 56, 0.12)" },
  { name: "State PSC", category: "Civil Services", color: "from-[#063b2b] to-emerald-600", icon: "Building", glow: "rgba(6, 59, 43, 0.12)" },
  { name: "SSC CGL", category: "Government", color: "from-teal-600 to-emerald-700", icon: "Briefcase", glow: "rgba(13, 148, 136, 0.12)" },
  { name: "Banking PO", category: "Government", color: "from-emerald-600 to-teal-700", icon: "Landmark", glow: "rgba(5, 150, 105, 0.12)" },
  { name: "JEE Advanced", category: "Engineering", color: "from-blue-600 to-teal-700", icon: "Atom", glow: "rgba(37, 99, 235, 0.12)" },
  { name: "NEET UG", category: "Medical", color: "from-emerald-500 to-teal-600", icon: "Activity", glow: "rgba(16, 185, 129, 0.12)" },
  { name: "CAT", category: "Management", color: "from-indigo-600 to-emerald-700", icon: "TrendingUp", glow: "rgba(79, 70, 229, 0.12)" },
  { name: "GATE", category: "Engineering", color: "from-cyan-600 to-teal-700", icon: "Settings", glow: "rgba(8, 145, 178, 0.12)" },
];

export const PRESET_SUBJECTS: Record<string, string[]> = {
  "UPSC CSE": ["Indian Polity", "History & Culture", "Geography", "Indian Economy", "Environment & Ecology", "Science & Tech", "CSAT & Logic"],
  "State PSC": ["State History", "Polity & Governance", "Geography", "Economy & Development", "General Mental Ability"],
  "JEE Advanced": ["Physics", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Mathematics"],
  "NEET UG": ["Biology (Botany)", "Biology (Zoology)", "Physics", "Chemistry"],
  "CAT": ["Quantitative Aptitude", "Data Interpretation", "Logical Reasoning", "Verbal Ability & RC"],
  "GATE": ["Engineering Mathematics", "General Aptitude", "Core Technical Subject 1", "Core Technical Subject 2"],
  "SSC CGL": ["Quantitative Aptitude", "General Intelligence & Reasoning", "English Language", "General Awareness"],
  "Banking PO": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General Financial Awareness"],
  "default": ["General Knowledge", "Analytical Reasoning", "Quantitative Ability", "Verbal Ability"]
};

export const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120"
];

export const STEP_HEADERS = [
  { id: 1, label: "Target" },
  { id: 2, label: "Profile" },
  { id: 3, label: "Timeline" },
  { id: 4, label: "Lifestyle" },
  { id: 5, label: "Focus" },
  { id: 6, label: "Weakness" },
  { id: 7, label: "Projections" }
];

export const STEP_COLORS: Record<number, { glowLeft: string; glowRight: string; shadow: string; gradient: string; glowBtn: string }> = {
  1: { glowLeft: "bg-[#084c38]/15", glowRight: "bg-[#059669]/15", shadow: "shadow-[0_24px_85px_rgba(8,76,56,0.18)]", gradient: "from-[#084c38] to-[#059669]", glowBtn: "rgba(8,76,56,0.3)" },
  2: { glowLeft: "bg-[#059669]/15", glowRight: "bg-teal-500/15", shadow: "shadow-[0_24px_85px_rgba(5,150,105,0.18)]", gradient: "from-[#059669] to-teal-600", glowBtn: "rgba(5,150,105,0.3)" },
  3: { glowLeft: "bg-[#084c38]/15", glowRight: "bg-emerald-600/15", shadow: "shadow-[0_24px_85px_rgba(8,76,56,0.18)]", gradient: "from-[#063b2b] to-[#084c38]", glowBtn: "rgba(8,76,56,0.3)" },
  4: { glowLeft: "bg-[#059669]/15", glowRight: "bg-teal-600/15", shadow: "shadow-[0_24px_85px_rgba(5,150,105,0.18)]", gradient: "from-[#084c38] to-[#059669]", glowBtn: "rgba(8,76,56,0.3)" },
  5: { glowLeft: "bg-teal-600/15", glowRight: "bg-[#084c38]/15", shadow: "shadow-[0_24px_85px_rgba(13,148,136,0.18)]", gradient: "from-teal-600 to-[#084c38]", glowBtn: "rgba(13,148,136,0.3)" },
  6: { glowLeft: "bg-[#084c38]/15", glowRight: "bg-emerald-600/15", shadow: "shadow-[0_24px_85px_rgba(8,76,56,0.18)]", gradient: "from-[#063b2b] to-[#059669]", glowBtn: "rgba(8,76,56,0.3)" },
  7: { glowLeft: "bg-[#059669]/20", glowRight: "bg-[#084c38]/20", shadow: "shadow-[0_24px_85px_rgba(5,150,105,0.22)]", gradient: "from-[#084c38] via-[#059669] to-[#063b2b]", glowBtn: "rgba(5,150,105,0.4)" }
};

export const getStepStyles = (currentStep: number) => {
  return {
    cardBg: "bg-[#ecfdf5]/40 border-[#d1fae5]",

    badgeBg: "bg-[#ecfdf5] text-[#084c38] border-[#d1fae5]",

    accentText: "text-[#084c38] font-bold",

    focusBorder: "focus:border-[#084c38] focus:ring-4 focus:ring-[#084c38]/10",

    btnBg: "bg-[#084c38] hover:bg-[#063b2b] text-white shadow-md shadow-[#084c38]/20 transition-all cursor-pointer",

    activeSelectionCard: "border-[#084c38] bg-[#ecfdf5]/80 text-[#084c38] shadow-md shadow-[#084c38]/10 scale-[1.01]"
  };
};