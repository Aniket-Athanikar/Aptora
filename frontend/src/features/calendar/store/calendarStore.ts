import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: "exam" | "mock" | "personal";
  color?: "indigo" | "violet" | "emerald" | "red" | "amber" | "blue" | "gray";
}

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  removeEvent: (eventId: string) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: [
        { id: "e1", title: "Polity Mock Exam", date: "2026-07-20", type: "mock", color: "violet" },
        { id: "e2", title: "Target UPSC Prelims", date: "2026-07-28", type: "exam", color: "red" },
      ],
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (eventId, updates) => set((state) => ({
        events: state.events.map((e) => e.id === eventId ? { ...e, ...updates } : e)
      })),
      removeEvent: (eventId) => set((state) => ({ events: state.events.filter((e) => e.id !== eventId) })),
    }),
    {
      name: "examforge_calendar",
    }
  )
);
