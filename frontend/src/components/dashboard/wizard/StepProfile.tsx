import React from "react";
import { Upload } from "lucide-react";
import { GoalData } from "@/types/goal.types";
import { CustomSelect } from "./CustomSelect";
import { AVATAR_OPTIONS } from "./constants";
import { useProfile } from "@/contexts";
import { getAvatarUrl } from "@/lib/avatar";

interface StepProfileProps {
  draft: Partial<GoalData>;
  errors: Record<string, string>;
  stepStyles: Record<string, string>;
  updateWizardDraft: (payload: Partial<GoalData>) => void;
}

export function StepProfile({
  draft,
  errors,
  stepStyles,
  updateWizardDraft
}: StepProfileProps) {
  const { profile } = useProfile();
  const displayAvatar = getAvatarUrl(profile?.avatar_url);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`md:col-span-1 flex flex-col items-center gap-4 p-6 rounded-3xl justify-center border ${stepStyles.cardBg}`}>
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-500 to-teal-550 blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Avatar"
                className="relative w-24 h-24 rounded-full border-4 border-white object-cover bg-white shadow-md"
              />
            ) : (
              <div className="relative w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-[#6D4AFF] to-purple-500 text-white flex items-center justify-center font-black text-3xl shadow-md uppercase">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : (draft.profile?.fullName ? draft.profile.fullName.charAt(0).toUpperCase() : "?")}
              </div>
            )}
          </div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-center">Aspirant Profile</label>

          <label className={`flex items-center gap-1.5 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md hover:-translate-y-0.5 ${stepStyles.btnBg}`}>
            <Upload className="w-3.5 h-3.5" /> Upload
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    updateWizardDraft({
                      profile: { ...draft.profile!, avatar: reader.result as string }
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        <div className="md:col-span-2 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-600 uppercase pl-1">Full Name</label>
              <input
                type="text"
                value={draft.profile?.fullName || ""}
                onChange={(e) => updateWizardDraft({
                  profile: { ...draft.profile!, fullName: e.target.value }
                })}
                className={`border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-semibold ${stepStyles.focusBorder}`}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-red-500 text-xs pl-1">{errors.fullName}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-600 uppercase pl-1">Age</label>
              <input
                type="number"
                min="16"
                max="40"
                value={draft.profile?.age || 21}
                onChange={(e) => updateWizardDraft({
                  profile: { ...draft.profile!, age: parseInt(e.target.value) || 21 }
                })}
                className={`border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-semibold ${stepStyles.focusBorder}`}
              />
              {errors.age && <p className="text-red-500 text-xs pl-1">{errors.age}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect
              label="Education / Degree"
              value={draft.profile?.education || "Bachelor of Arts"}
              options={["Bachelor of Technology", "Bachelor of Science", "Bachelor of Arts", "Bachelor of Comerce", "Master of Business Admin", "High School", "Any Diploma", "Others"]}
              onChange={(val) => updateWizardDraft({
                profile: { ...draft.profile!, education: val }
              })}
              focusClass={stepStyles.focusBorder}
              activeClass={stepStyles.badgeBg}
            />

            <CustomSelect
              label="Stream"
              value={draft.profile?.stream || "Arts & Humanities"}
              options={["Science & Technology", "Arts & Humanities", "Commerce & Accounts", "Medical & Health"]}
              onChange={(val) => updateWizardDraft({
                profile: { ...draft.profile!, stream: val }
              })}
              focusClass={stepStyles.focusBorder}
              activeClass={stepStyles.badgeBg}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-black text-slate-600 uppercase pl-1">Target Exam City</label>
              <input
                type="text"
                value={draft.profile?.city || ""}
                onChange={(e) => updateWizardDraft({
                  profile: { ...draft.profile!, city: e.target.value }
                })}
                className={`border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-semibold ${stepStyles.focusBorder}`}
                placeholder="e.g. Delhi, Mumbai"
              />
              {errors.city && <p className="text-red-500 text-xs pl-1 font-bold">{errors.city}</p>}
            </div>

            <CustomSelect
              label="Occupation"
              value={draft.profile?.occupation || "Full-time Aspirant"}
              options={["Full-time Aspirant", "Working Professional", "College Student"]}
              onChange={(val) => updateWizardDraft({
                profile: { ...draft.profile!, occupation: val }
              })}
              focusClass={stepStyles.focusBorder}
              activeClass={stepStyles.badgeBg}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect
              label="Gender"
              value={draft.profile?.gender || "Male"}
              options={["Male", "Female", "Other"]}
              onChange={(val) => updateWizardDraft({
                profile: { ...draft.profile!, gender: val }
              })}
              focusClass={stepStyles.focusBorder}
              activeClass={stepStyles.badgeBg}
            />

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-black text-slate-600 uppercase pl-1">Phone Number</label>
              <input
                type="text"
                value={draft.profile?.phone || ""}
                onChange={(e) => updateWizardDraft({
                  profile: { ...draft.profile!, phone: e.target.value }
                })}
                className={`border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-semibold ${stepStyles.focusBorder}`}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confidence and syllabus coverage */}
      <div className={`p-6 rounded-3xl border grid grid-cols-1 md:grid-cols-2 gap-6 ${stepStyles.cardBg}`}>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between pl-1">
            <label className={`text-xs font-extrabold uppercase ${stepStyles.accentText}`}>Syllabus Covered (%): {draft.profile?.syllabusPercent || 0}%</label>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={draft.profile?.syllabusPercent || 0}
              onChange={(e) => updateWizardDraft({
                profile: { ...draft.profile!, syllabusPercent: parseInt(e.target.value) }
              })}
              className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between pl-1">
            <label className={`text-xs font-extrabold uppercase ${stepStyles.accentText}`}>Current Confidence Level: {draft.profile?.currentConfidence || 3}/5</label>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="5"
              value={draft.profile?.currentConfidence || 3}
              onChange={(e) => updateWizardDraft({
                profile: { ...draft.profile!, currentConfidence: parseInt(e.target.value) }
              })}
              className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
