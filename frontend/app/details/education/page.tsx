"use client";

import { useResumeDraft, EducationItem } from "../resume-draft";
import { useRouter } from "next/navigation";

const DEGREE_PRESETS = ["B.Tech", "M.Tech", "12th"] as const;

export default function Education() {
  const { draft, updateDraft } = useResumeDraft();
  const router = useRouter();

  const educationList: EducationItem[] =
    Array.isArray(draft.education) && draft.education.length > 0
      ? draft.education
      : [{ degree: "B.Tech", institution: "", year: "", cgpa: "" }];

  const handleFieldChange = (
    index: number,
    field: keyof EducationItem,
    value: string
  ) => {
    const updated = educationList.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateDraft({ education: updated });
  };

  const handleAddEducation = () => {
    if (educationList.length < 2) {
      const nextDegree = educationList.some((e) => e.degree === "B.Tech")
        ? "12th"
        : "B.Tech";
      const updated = [
        ...educationList,
        { degree: nextDegree, institution: "", year: "", cgpa: "" },
      ];
      updateDraft({ education: updated });
    }
  };

  const handleRemoveEducation = (index: number) => {
    if (educationList.length > 1) {
      const updated = educationList.filter((_, i) => i !== index);
      updateDraft({ education: updated });
    }
  };

  return (
    <div className="w-full max-w-xl my-20 mr-50">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Education Details</h2>
      <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
        Add your academic qualifications (max 2 entries: e.g. B.Tech, M.Tech, 12th).
      </p>

      <div className="mb-6 rounded-2xl border border-blue-200 dark:border-neutral-800 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 dark:from-[#0f0f0f] dark:via-[#0f0f0f] dark:to-black p-4 shadow-xs flex items-start gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shrink-0 mt-0.5">
          💡
        </div>
        <div className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
          <p className="font-semibold text-neutral-900 dark:text-white mb-0.5">
            Smart Education Recommendation
          </p>
          <span>
            For a clean 1-page ATS resume, mention your <strong className="text-blue-700 dark:text-blue-400 font-semibold">current degree (e.g. B.Tech/M.Tech)</strong> or a <strong className="text-blue-700 dark:text-blue-400 font-semibold">maximum of 2 education entries</strong> (e.g. College &amp; 12th). Avoid listing 10th grade or middle school. (Currently: <span className={educationList.length <= 2 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>{educationList.length}/2 entries</span>)
          </span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/details/experience");
        }}
        className="space-y-6"
      >
        {educationList.map((item, index) => {
          const isPreset = DEGREE_PRESETS.some((preset) => preset === item.degree);
          const degreeSelectValue = isPreset ? item.degree : "Other";

          return (
            <div
              key={index}
              className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f0f] p-5 shadow-xs space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-neutral-800 text-blue-700 dark:text-blue-400 text-xs font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
                    {index === 0 ? "Primary Education" : "Secondary Education"}
                  </h3>
                </div>

                {educationList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(index)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-neutral-900 transition cursor-pointer"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                    Degree / Qualification *
                  </label>
                  <select
                    value={degreeSelectValue}
                    onChange={(e) => {
                      const selected = e.target.value;
                      handleFieldChange(
                        index,
                        "degree",
                        selected === "Other" ? "" : selected
                      );
                    }}
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="M.Tech">M.Tech (Master of Technology)</option>
                    <option value="12th">12th (Senior Secondary / High School)</option>
                    <option value="Other">Other (Custom)</option>
                  </select>

                  {!isPreset && (
                    <input
                      type="text"
                      required
                      placeholder="Enter degree name (e.g. BCA, B.Sc)"
                      value={item.degree}
                      onChange={(e) => handleFieldChange(index, "degree", e.target.value)}
                      className="w-full mt-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                    University / College / School *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      item.degree === "12th"
                        ? "e.g. DPS / CBSE Board"
                        : "e.g. IIT Kharagpur / University Name"
                    }
                    value={item.institution}
                    onChange={(e) => handleFieldChange(index, "institution", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                    Passing / Graduation Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024 or 2020 - 2024"
                    value={item.year}
                    onChange={(e) => handleFieldChange(index, "year", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                    CGPA / Percentage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8.5 CGPA or 85%"
                    value={item.cgpa}
                    onChange={(e) => handleFieldChange(index, "cgpa", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {educationList.length < 2 && (
          <button
            type="button"
            onClick={handleAddEducation}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-neutral-900/60 text-gray-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+</span> Add Another Education (Max 2)
          </button>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/details/personal-details")}
            className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-medium px-3 py-2.5 cursor-pointer"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/details/experience")}
              className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 px-3 py-2.5 cursor-pointer"
            >
              Skip
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition cursor-pointer"
            >
              Save & Continue →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}