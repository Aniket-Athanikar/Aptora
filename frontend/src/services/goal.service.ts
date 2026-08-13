import { GoalData, HistorySnapshot, WizardState } from "@/types/goal.types";
import { apiClient } from "./api-client";

type WorkspaceDto = {
  id: number;
  target_exam: string;
  exam_category: string;
  created_at: string;
  updated_at: string;
};

type ProfileDto = {
  avatar: string | null;
  full_name: string;
  age: number;
  education: string;
  stream: string;
  city: string;
  occupation: string;
  gender: string | null;
  phone: string | null;
  syllabus_percent: number;
  current_confidence: number;
};

type TimelineDto = {
  exam_date: string;
  daily_study_hours: number;
};

type LifestyleDto = {
  preferred_device: string;
  learning_environment: string;
  internet_availability: string;
  consistency_commit: string;
};

type SlotDto = {
  time_slot: "Morning" | "Afternoon" | "Night" | "Weekend";
};

type ModeDto = {
  learning_mode: string;
};

type GapDto = {
  subject: string;
  confidence: number;
  difficulty: "Easy" | "Medium" | "Hard";
};

export interface WorkspaceState {
  activeGoal: GoalData | null;
  wizardState: WizardState | null;
  history: HistorySnapshot[];
}

const optional = async <T>(request: Promise<T>): Promise<T | null> => {
  try {
    return await request;
  } catch {
    return null;
  }
};

function daysRemaining(examDate: string) {
  return Math.max(
    0,
    Math.ceil((new Date(examDate).getTime() - Date.now()) / 86_400_000)
  );
}

function toGoal(
  workspace: WorkspaceDto,
  profile: ProfileDto,
  timeline: TimelineDto,
  lifestyle: LifestyleDto,
  slots: SlotDto[],
  modes: ModeDto[],
  gaps: GapDto[]
): GoalData {
  const remainingDays = daysRemaining(timeline.exam_date);

  const risk =
    timeline.daily_study_hours >= 11
      ? "High"
      : timeline.daily_study_hours >= 8
      ? "Moderate"
      : "Low";

  return {
    id: String(workspace.id),
    targetExam: workspace.target_exam,
    examCategory: workspace.exam_category,

    profile: {
      fullName: profile.full_name,
      avatar: "",
      age: profile.age,
      education: profile.education,
      stream: profile.stream,
      city: profile.city,
      occupation: profile.occupation,
      gender: profile.gender || "",
      phone: profile.phone || "",
      syllabusPercent: profile.syllabus_percent,
      currentConfidence: profile.current_confidence,
    },

    timeline: {
      examDate: timeline.exam_date,
      dailyStudyHours: timeline.daily_study_hours,
      remainingDays,
      burnoutRisk: risk,
      difficulty: "Medium",
      successPrediction: Math.min(
        95,
        Math.max(
          35,
          profile.current_confidence * 15 +
            timeline.daily_study_hours * 3
        )
      ),
    },

    lifestyle: {
      slots: slots.map((s) => s.time_slot),
      dailyHours: timeline.daily_study_hours,
      preferredDevice: lifestyle.preferred_device,
      learningEnvironment: lifestyle.learning_environment,
      internetAvailability: lifestyle.internet_availability,
      consistency: [lifestyle.consistency_commit],
    },

    preferences: modes.map((m) => m.learning_mode),

    weaknesses: gaps.map((gap) => ({
      ...gap,
      weaknessScore: Math.round((6 - gap.confidence) * 20),
      priority:
        gap.confidence <= 2
          ? "High"
          : gap.confidence === 3
          ? "Medium"
          : "Low",
      aiRecommendation: `Reinforce study loops for ${gap.subject}`,
    })),

    createdAt: workspace.created_at,
    updatedAt: workspace.updated_at,
  };
}

let inFlightWorkspacePromise: Promise<WorkspaceState> | null = null;

export const goalService = {
  async getWorkspace(): Promise<WorkspaceState> {
    if (inFlightWorkspacePromise) {
      return inFlightWorkspacePromise;
    }

    inFlightWorkspacePromise = (async () => {
      try {
        const workspace = await optional(
          apiClient.get<WorkspaceDto>("/workspace")
        );

        if (!workspace) {
          return {
            activeGoal: null,
            wizardState: null,
            history: [],
          };
        }

        const [
          profile,
          timeline,
          lifestyle,
          slots,
          modes,
          gaps,
        ] = await Promise.all([
          optional(apiClient.get<ProfileDto>("/profile/")),
          optional(apiClient.get<TimelineDto>("/timeline/")),
          optional(apiClient.get<LifestyleDto>("/lifestyle/")),
          optional(apiClient.get<SlotDto[]>("/study-slots/")),
          optional(apiClient.get<ModeDto[]>("/learning-modes/")),
          optional(apiClient.get<GapDto[]>("/gap-analysis/")),
        ]);

        if (!profile || !timeline || !lifestyle) {
          return {
            activeGoal: null,
            wizardState: null,
            history: [],
          };
        }

        return {
          activeGoal: toGoal(
            workspace,
            profile,
            timeline,
            lifestyle,
            slots || [],
            modes || [],
            gaps || []
          ),
          wizardState: null,
          history: [],
        };
      } finally {
        setTimeout(() => {
          inFlightWorkspacePromise = null;
        }, 1500);
      }
    })();

    return inFlightWorkspacePromise;
  },

  async saveActiveGoal(
    goal: GoalData,
    _changeDescription?: string
  ): Promise<WorkspaceState> {
    const existing = await optional(
      apiClient.get<WorkspaceDto>("/workspace")
    );

    const workspacePayload = {
      target_exam: goal.targetExam,
      exam_category: goal.examCategory,
    };

    await (existing
      ? apiClient.put("/workspace", workspacePayload)
      : apiClient.post("/workspace", workspacePayload));

    const profilePayload = {
      full_name: goal.profile.fullName,
      age: goal.profile.age,
      education: goal.profile.education,
      stream: goal.profile.stream,
      city: goal.profile.city,
      occupation: goal.profile.occupation,
      gender: goal.profile.gender || "",
      phone: goal.profile.phone || "",
      syllabus_percent: goal.profile.syllabusPercent,
      current_confidence: goal.profile.currentConfidence,
    };

    const timelinePayload = {
      exam_date: goal.timeline.examDate,
      daily_study_hours: goal.timeline.dailyStudyHours,
    };

    const lifestylePayload = {
      preferred_device: goal.lifestyle.preferredDevice,
      learning_environment: goal.lifestyle.learningEnvironment,
      internet_availability: goal.lifestyle.internetAvailability,
      consistency_commit:
        goal.lifestyle.consistency[0] || "Everyday",
    };

    const [profile, timeline, lifestyle] = await Promise.all([
      optional(apiClient.get<ProfileDto>("/profile/")),
      optional(apiClient.get<TimelineDto>("/timeline/")),
      optional(apiClient.get<LifestyleDto>("/lifestyle/")),
    ]);

    await Promise.all([
      profile
        ? apiClient.put("/profile/", profilePayload)
        : apiClient.post("/profile/", profilePayload),

      timeline
        ? apiClient.put("/timeline/", timelinePayload)
        : apiClient.post("/timeline/", timelinePayload),

      lifestyle
        ? apiClient.put("/lifestyle/", lifestylePayload)
        : apiClient.post("/lifestyle/", lifestylePayload),
    ]);

    await Promise.all([
      apiClient.put("/study-slots/", {
        study_slots: goal.lifestyle.slots,
      }),

      apiClient.put("/learning-modes/", {
        learning_modes: goal.preferences,
      }),

      apiClient.put("/gap-analysis/", {
        subjects: goal.weaknesses.map(
          ({ subject, confidence, difficulty }) => ({
            subject,
            confidence,
            difficulty,
          })
        ),
      }),
    ]);

    return this.getWorkspace();
  },

  async deleteActiveGoal(): Promise<WorkspaceState> {
    await apiClient.delete("/workspace");

    return {
      activeGoal: null,
      wizardState: null,
      history: [],
    };
  },

  async restoreVersion(): Promise<WorkspaceState> {
    return this.getWorkspace();
  },

  async deleteHistoryVersion(): Promise<WorkspaceState> {
    return this.getWorkspace();
  },
};