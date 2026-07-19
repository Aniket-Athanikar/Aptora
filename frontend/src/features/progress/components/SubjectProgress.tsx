import React from "react";
import { Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SubjectProgressData } from "../store/progressStore";

interface SubjectProgressProps {
  subjects: SubjectProgressData[];
  limit?: number;
  showLink?: boolean;
}

export function SubjectProgress({ subjects, limit, showLink = false }: SubjectProgressProps) {
  const displaySubjects = limit ? subjects.slice(0, limit) : subjects;

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < count ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
      />
    ));
  };

  const getStatusColor = (status: "Good" | "Needs Review" | "Weak") => {
    switch (status) {
      case "Good":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "Needs Review":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "Weak":
        return "bg-rose-50 text-rose-600 border border-rose-100";
    }
  };

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-black text-gray-900">Subject Coverage & Confidence</h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Track confidence and syllabus completion per area</p>
        </div>
        {showLink && (
          <Link
            href="/dashboard/progress/subjects"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5 group"
          >
            All Subjects <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displaySubjects.map((sub) => (
          <div
            key={sub.subject}
            className="p-4.5 rounded-2xl border border-gray-100 bg-gray-50/40 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-black text-gray-800">{sub.subject}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase">Confidence</span>
                  <div className="flex">{renderStars(sub.confidence)}</div>
                </div>
              </div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${getStatusColor(sub.revisionStatus)}`}>
                {sub.revisionStatus}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-gray-500">
                <span>Completion</span>
                <span>{sub.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    sub.completionPercentage > 75
                      ? "bg-indigo-600"
                      : sub.completionPercentage > 50
                      ? "bg-violet-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${sub.completionPercentage}%` }}
                />
              </div>
              <div className="text-[9px] text-gray-400 font-semibold mt-1">
                {sub.completedTasks} of {sub.totalTasks} syllabus subtopics completed
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
