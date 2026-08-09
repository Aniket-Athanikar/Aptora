import { create } from "zustand";

export interface AIMemory {
  userName: string;
  goal: string;
  motivation: string;
  weakSubjects: string[];
  studyStyle: string;
  recentChallenges: string[];
  successfulHabits: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
  isEdited?: boolean;
}

interface AICoachStore {
  memory: AIMemory;
  dailyScore: number;
  chatHistory: ChatMessage[];

  // Actions
  initializeCoach: (userName: string, targetExam: string, weakSubjects: string[]) => void;
  updateDailyScore: (score: number) => void;
  sendChatMessage: (text: string) => void;
  deleteChatMessage: (msgId: string) => void;
  editChatMessage: (msgId: string, newText: string) => void;
  clearChatHistory: () => void;
  loadCoachData: () => void;
}

const defaultMemory: AIMemory = {
  userName: "Rahul",
  goal: "UPSC CSE 2027",
  motivation: "Create impact through administrative leadership",
  weakSubjects: ["Economy", "Science"],
  studyStyle: "Visual + Practice",
  recentChallenges: ["Focusing on long reading blocks", "Economy syllabus coverage"],
  successfulHabits: ["Disciplined morning routines", "Solving MCQ practice sets"],
};

const predefinedChatResponses: { pattern: RegExp; reply: string }[] = [
  {
    pattern: /focus|concentrate|distract/i,
    reply: "Try a 25-minute focus Pomodoro session. Start with your easiest topic to gain momentum, and put your devices on silent mode."
  },
  {
    pattern: /economy|finance/i,
    reply: "Economy is highly analytical. Focus first on micro and macro fundamentals, revise terms like inflation/GDP, and follow with Current Affairs updates."
  },
  {
    pattern: /tired|exhausted|burnout/i,
    reply: "It sounds like you're working hard. Step away for a 10-minute stretch, grab a glass of water, and drop today's target load by 20% to stay sustainable."
  },
  {
    pattern: /schedule|planner|overloaded/i,
    reply: "If your day is packed, prioritize just 1 core study task and 1 practice session. Consistency matters more than finishing everything on a bloated list."
  },
  {
    pattern: /hello|hi|hey/i,
    reply: "Hello! How is your study block going today? How can I help you calibrate your focus?"
  }
];

export const useAICoachStore = create<AICoachStore>((set, get) => ({
  memory: defaultMemory,
  dailyScore: 87,
  chatHistory: [
    { id: "msg_1", sender: "coach", text: "Hello! 👋 I'm your ExamForge AI Coach. How can I help calibrate your study plan today?", timestamp: new Date(Date.now() - 600000).toISOString() }
  ],

  initializeCoach: (userName, targetExam, weakSubjects) => {
    const memory = {
      ...defaultMemory,
      userName,
      goal: targetExam,
      weakSubjects,
    };
    set({ memory });
    localStorage.setItem("examforge_ai_memory", JSON.stringify(memory));
  },

  updateDailyScore: (score) => {
    set({ dailyScore: score });
    localStorage.setItem("examforge_daily_score", JSON.stringify({ score, date: new Date().toISOString().split("T")[0] }));
  },

  sendChatMessage: (text) => {
    const userMsg: ChatMessage = {
      id: `chat_${Date.now()}_user`,
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };

    const nextHistory = [...get().chatHistory, userMsg];
    set({ chatHistory: nextHistory });
    localStorage.setItem("examforge_chat_history", JSON.stringify(nextHistory));

    // Evaluate simulated predefined reply
    setTimeout(() => {
      let replyText = "That's a great question. Break it down into smaller focus tasks, and concentrate on active recall revisions.";

      for (const rule of predefinedChatResponses) {
        if (rule.pattern.test(text)) {
          replyText = rule.reply;
          break;
        }
      }

      const coachMsg: ChatMessage = {
        id: `chat_${Date.now()}_coach`,
        sender: "coach",
        text: replyText,
        timestamp: new Date().toISOString()
      };

      const updatedHistory = [...get().chatHistory, coachMsg];
      set({ chatHistory: updatedHistory });
      localStorage.setItem("examforge_chat_history", JSON.stringify(updatedHistory));
    }, 700);
  },

  deleteChatMessage: (msgId) => {
    const updated = get().chatHistory.filter((m) => m.id !== msgId);
    set({ chatHistory: updated });
    localStorage.setItem("examforge_chat_history", JSON.stringify(updated));
  },

  editChatMessage: (msgId, newText) => {
    const updated = get().chatHistory.map((m) =>
      m.id === msgId ? { ...m, text: newText, isEdited: true } : m
    );
    set({ chatHistory: updated });
    localStorage.setItem("examforge_chat_history", JSON.stringify(updated));
  },

  clearChatHistory: () => {
    const initialMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "coach",
      text: "Hello! Let's start fresh. Ask me about your study plan or daily targets.",
      timestamp: new Date().toISOString()
    };
    set({ chatHistory: [initialMsg] });
    localStorage.setItem("examforge_chat_history", JSON.stringify([initialMsg]));
  },

  loadCoachData: () => {
    try {
      const storedMemory = localStorage.getItem("examforge_ai_memory");
      if (storedMemory) {
        set({ memory: JSON.parse(storedMemory) });
      }

      const storedScore = localStorage.getItem("examforge_daily_score");
      if (storedScore) {
        const parsed = JSON.parse(storedScore);
        set({ dailyScore: parsed.score });
      }

      const storedHistory = localStorage.getItem("examforge_chat_history");
      if (storedHistory) {
        set({ chatHistory: JSON.parse(storedHistory) });
      }
    } catch (e) {
      console.error("Failed to load coach metrics from localStorage", e);
    }
  }
}));
