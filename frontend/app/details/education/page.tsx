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
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Education Details</h2>
      <p className="text-sm text-gray-500 mb-6">
        Add your academic qualifications (max 2 entries: e.g. B.Tech, M.Tech, 12th).
      </p>

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
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {index === 0 ? "Primary Education" : "Secondary Education"}
                  </h3>
                </div>

                {educationList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(index)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
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
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
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
                      className="w-full mt-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
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
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Passing / Graduation Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024 or 2020 - 2024"
                    value={item.year}
                    onChange={(e) => handleFieldChange(index, "year", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    CGPA / Percentage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8.5 CGPA or 85%"
                    value={item.cgpa}
                    onChange={(e) => handleFieldChange(index, "cgpa", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
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
            className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 text-gray-600 hover:text-blue-600 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>+</span> Add Another Education (Max 2)
          </button>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/details/personal-details")}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2.5"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/details/experience")}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5"
            >
              Skip
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition"
            >
              Save &amp; Continue →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}