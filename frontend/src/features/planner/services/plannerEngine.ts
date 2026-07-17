import { GoalData } from "@/types/goal.types";
import { StudyTask } from "../types/planner";

export const plannerEngine = {
  generateDailyTasks: (goal: GoalData, dateStr: string): StudyTask[] => {
    const tasks: StudyTask[] = [];
    const dailyHours = goal.timeline.dailyStudyHours || 4;
    const weakSubjects = goal.weaknesses.map((w) => w.subject);

    // Subjects database or fallback list
    const fallbackSubjects = ["General Studies", "Revision", "Practice Questions"];
    const subjectsToSchedule = weakSubjects.length > 0 ? weakSubjects : fallbackSubjects;

    // Distribute time slots
    const morningHours = Math.max(1, Math.floor(dailyHours * 0.4));
    const afternoonHours = Math.max(1, Math.floor(dailyHours * 0.3));
    const eveningHours = Math.max(1, dailyHours - morningHours - afternoonHours);

    // Morning Core Slot
    tasks.push({
      id: `${goal.id}_morning_${dateStr}`,
      goalId: goal.id,
      title: `${subjectsToSchedule[0] || "Core Subject"} Focus`,
      subject: subjectsToSchedule[0] || "General Studies",
      duration: morningHours * 60,
      date: dateStr,
      status: "pending",
      priority: "High",
      timeSlot: "08:00 AM",
    });

    // Afternoon Practice Slot
    tasks.push({
      id: `${goal.id}_afternoon_${dateStr}`,
      goalId: goal.id,
      title: `MCQ & PYQ Testing`,
      subject: subjectsToSchedule[1] || "Practice Exercises",
      duration: afternoonHours * 60,
      date: dateStr,
      status: "pending",
      priority: "Medium",
      timeSlot: "02:00 PM",
    });

    // Evening Revision Slot
    tasks.push({
      id: `${goal.id}_evening_${dateStr}`,
      goalId: goal.id,
      title: `Revision & Notes Consolidation`,
      subject: subjectsToSchedule[2] || subjectsToSchedule[0] || "Revision",
      duration: eveningHours * 60,
      date: dateStr,
      status: "pending",
      priority: "Low",
      timeSlot: "07:00 PM",
    });

    return tasks;
  },

  generateWeeklyPlan: (goal: GoalData): { day: string; subject: string; duration: number }[] => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const weakSubjects = goal.weaknesses.map((w) => w.subject);
    const dailyHours = goal.timeline.dailyStudyHours || 4;

    return days.map((day, index) => {
      // Cycle through subjects
      const subjectIndex = index % Math.max(1, weakSubjects.length);
      const subject = weakSubjects[subjectIndex] || "General Core studies";

      // Sunday is always mock test / revision
      if (day === "Sunday") {
        return { day, subject: "Mock Test Analysis & Revision", duration: dailyHours };
      }
      return { day, subject, duration: dailyHours };
    });
  }
};
