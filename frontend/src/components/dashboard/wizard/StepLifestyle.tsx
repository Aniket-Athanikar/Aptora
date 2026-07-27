import React from "react";
import * as LucideIcons from "lucide-react";
import { GoalData } from "@/types/goal.types";
import { CustomSelect } from "./CustomSelect";

interface StepLifestyleProps {
  draft: Partial<GoalData>;
  errors: Record<string, string>;
  stepStyles: Record<string, string>;
  updateWizardDraft: (payload: Partial<GoalData>) => void;
}

export function StepLifestyle({
  draft,
  errors,
  stepStyles,
  updateWizardDraft
}: StepLifestyleProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-black text-slate-650 uppercase block mb-3 pl-1">Preferred Study Time Slots</label>
            <div className="flex flex-wrap gap-2">
              {(["Morning", "Afternoon", "Night", "Weekend"] as const).map((slot) => {
                const active = draft.lifestyle?.slots?.includes(slot) || false;
                const SlotIcon = {
                  Morning: LucideIcons.Sun,
                  Afternoon: LucideIcons.CloudSun,
                  Night: LucideIcons.Moon,
                  Weekend: LucideIcons.Calendar
                }[slot];
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      const currentSlots = draft.lifestyle?.slots || [];
                      const nextSlots = active
                        ? currentSlots.filter((s) => s !== slot)
                        : [...currentSlots, slot];
                      updateWizardDraft({
                        lifestyle: { ...draft.lifestyle!, slots: nextSlots }
                      });
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] ${active
                        ? "bg-rose-600 text-white border-rose-600 shadow-md"
                        : "bg-white text-slate-700 border-slate-200 hover:border-rose-300"
                      }`}
                  >
                    {SlotIcon && <SlotIcon className="w-4 h-4" />}
                    <span>{slot}</span>
                  </button>
                );
              })}
            </div>
            {errors.slots && <p className="text-rose-500 text-[10px] font-black mt-2 pl-1">{errors.slots}</p>}
          </div>

          <CustomSelect
            label="Preferred Learning Device"
            value={draft.lifestyle?.preferredDevice || "Laptop & Tablet"}
            options={["Laptop & Tablet", "Desktop & Workstation", "Mobile Smartphone only", "Physical books/Printed notes"]}
            onChange={(val) => updateWizardDraft({
              lifestyle: { ...draft.lifestyle!, preferredDevice: val }
            })}
          />

          <CustomSelect
            label="Learning Environment"
            value={draft.lifestyle?.learningEnvironment || "Home Study Room (Quiet)"}
            options={["Home Study Room (Quiet)", "Public Library / Study Cafe", "College / University Lounge", "Co-working Space / Commute"]}
            onChange={(val) => updateWizardDraft({
              lifestyle: { ...draft.lifestyle!, learningEnvironment: val }
            })}
          />
        </div>

        <div className="space-y-5">
          <CustomSelect
            label="Internet Access / Availability"
            value={draft.lifestyle?.internetAvailability || "High-speed Wi-Fi (Continuous)"}
            options={["High-speed Wi-Fi (Continuous)", "Cellular Data / Limited access", "Offline / Intermittent sync only"]}
            onChange={(val) => updateWizardDraft({
              lifestyle: { ...draft.lifestyle!, internetAvailability: val }
            })}
          />

          <div>
            <label className="text-xs font-black text-slate-655 uppercase block mb-3 pl-1">Consistency Commits</label>
            <div className="grid grid-cols-2 gap-2.5">
              {["Everyday", "Weekdays Only", "Weekends Intensive", "Skip Festivals/Holidays"].map((item) => {
                const selected = draft.lifestyle?.consistency?.includes(item) || false;
                const CommitIcon = {
                  "Everyday": LucideIcons.Flame,
                  "Weekdays Only": LucideIcons.CalendarDays,
                  "Weekends Intensive": LucideIcons.Zap,
                  "Skip Festivals/Holidays": LucideIcons.Sparkles
                }[item as "Everyday" | "Weekdays Only" | "Weekends Intensive" | "Skip Festivals/Holidays"];
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      const currentCon = draft.lifestyle?.consistency || [];
                      const nextCon = selected
                        ? currentCon.filter((c) => c !== item)
                        : [...currentCon, item];
                      updateWizardDraft({
                        lifestyle: { ...draft.lifestyle!, consistency: nextCon }
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer hover:scale-[1.01] ${selected
                        ? "bg-rose-50/50 border-rose-300 text-rose-700 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-rose-300"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {CommitIcon && <CommitIcon className={`w-4.5 h-4.5 ${selected ? "text-rose-600 animate-pulse-subtle" : "text-slate-400"}`} />}
                      <span>{item}</span>
                    </div>
                    {selected && <LucideIcons.Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {errors.consistency && <p className="text-rose-500 text-[10px] font-black mt-2 pl-1">{errors.consistency}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
