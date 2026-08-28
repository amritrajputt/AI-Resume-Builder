"use client";

import { useResumeDraft, AchievementItem } from "../resume-draft";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export default function AchievementsPage() {
  const { draft, updateDraft, saveResume } = useResumeDraft();
  const { getToken } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const achievementsList: AchievementItem[] = Array.isArray(draft.achievements)
    ? draft.achievements
    : [];

  const handleFieldChange = (
    index: number,
    field: keyof AchievementItem,
    value: string
  ) => {
    const updated = achievementsList.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateDraft({ achievements: updated });
  };

  const handleAddAchievement = () => {
    const newAchievement: AchievementItem = {
      title: "",
      description: "",
      date: "",
    };
    updateDraft({ achievements: [...achievementsList, newAchievement] });
  };

  const handleRemoveAchievement = (index: number) => {
    const updated = achievementsList.filter((_, i) => i !== index);
    updateDraft({ achievements: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/details/review");
  };

  return (
    <div className="w-full max-w-xl my-20 mr-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Achievements & Honors</h2>
      <p className="text-sm text-gray-500 mb-6">
        Add notable achievements, hackathon wins, contest ranks, or awards (optional).
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        {achievementsList.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-600 font-medium mb-1">
              No achievements added yet
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Stand out by highlighting competitive programming ranks, hackathons, or scholarships.
            </p>
            <button
              type="button"
              onClick={handleAddAchievement}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              + Add Achievement
            </button>
          </div>
        )}

        {achievementsList.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 relative"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {index + 1}
                </span>
                <h3 className="text-sm font-semibold text-gray-800">
                  {item.title || `Achievement #${index + 1}`}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveAchievement(index)}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
              >
                ✕ Remove
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Achievement Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Winner - Smart India Hackathon 2024"
                value={item.title}
                onChange={(e) =>
                  handleFieldChange(index, "title", e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Description / Impact
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Built an AI triage model for rural healthcare out of 500+ participating teams."
                value={item.description || ""}
                onChange={(e) =>
                  handleFieldChange(index, "description", e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Date / Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oct 2024"
                  value={item.date || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "date", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        {achievementsList.length > 0 && (
          <button
            type="button"
            onClick={handleAddAchievement}
            className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 text-gray-600 hover:text-blue-600 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>+</span> Add Another Achievement
          </button>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/details/coding-profiles")}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2.5"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition shadow-sm"
          >
            Review & Generate Resume →
          </button>
        </div>
      </form>
    </div>
  );
}
