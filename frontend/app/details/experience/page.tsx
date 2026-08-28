"use client";

import { useResumeDraft, ExperienceItem } from "../resume-draft";
import { useRouter } from "next/navigation";

export default function ExperiencePage() {
  const { draft, updateDraft } = useResumeDraft();
  const router = useRouter();

  const experienceList: ExperienceItem[] = Array.isArray(draft.experience)
    ? draft.experience
    : [];

  const handleFieldChange = (
    index: number,
    field: keyof ExperienceItem,
    value: unknown
  ) => {
    const updated = experienceList.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateDraft({ experience: updated });
  };

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    };
    updateDraft({ experience: [...experienceList, newExp] });
  };

  const handleRemoveExperience = (index: number) => {
    const updated = experienceList.filter((_, i) => i !== index);
    updateDraft({ experience: updated });
  };

  return (
    <div className="w-full max-w-xl my-20 mr-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Work Experience</h2>
      <p className="text-sm text-gray-500 mb-6">
        Add your internships, full-time jobs, or freelance work (optional).
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/details/projects");
        }}
        className="space-y-6"
      >
        {experienceList.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-600 font-medium mb-1">
              No experience added yet
            </p>
            <p className="text-xs text-gray-400 mb-4">
              If you have internships or work experience, add them below. Otherwise, you can skip this step.
            </p>
            <button
              type="button"
              onClick={handleAddExperience}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              + Add Experience
            </button>
          </div>
        )}

        {experienceList.map((item, index) => (
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
                  {item.role || item.company
                    ? `${item.role || "Role"} at ${item.company || "Company"}`
                    : `Experience #${index + 1}`}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveExperience(index)}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
              >
                ✕ Remove
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Microsoft, Startup XYZ"
                  value={item.company}
                  onChange={(e) =>
                    handleFieldChange(index, "company", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Job Role / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer Intern"
                  value={item.role}
                  onChange={(e) =>
                    handleFieldChange(index, "role", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remote, Bengaluru"
                  value={item.location || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "location", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Start Date *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jun 2024"
                  value={item.startDate}
                  onChange={(e) =>
                    handleFieldChange(index, "startDate", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  type="text"
                  disabled={item.currentlyWorking}
                  placeholder={item.currentlyWorking ? "Present" : "e.g. Aug 2024"}
                  value={item.currentlyWorking ? "Present" : item.endDate || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "endDate", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`curr-${index}`}
                checked={!!item.currentlyWorking}
                onChange={(e) => {
                  const checked = e.target.checked;
                  handleFieldChange(index, "currentlyWorking", checked);
                  if (checked) {
                    handleFieldChange(index, "endDate", "Present");
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`curr-${index}`}
                className="text-xs text-gray-600 select-none cursor-pointer"
              >
                I currently work here
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Key Responsibilities / Description
              </label>
              <textarea
                rows={4}
                placeholder="Describe your role, key responsibilities, technologies used, and what you built or accomplished (our AI will format these into high-impact bullet points)..."
                value={
                  typeof item.description === "string"
                    ? item.description
                    : Array.isArray(item.description)
                    ? (item.description as string[]).join("\n")
                    : ""
                }
                onChange={(e) =>
                  handleFieldChange(index, "description", e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 resize-y"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Provide your raw notes or summary — our AI will automatically generate and polish your bullet points.
              </p>
            </div>
          </div>
        ))}

        {experienceList.length > 0 && (
          <button
            type="button"
            onClick={handleAddExperience}
            className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 text-gray-600 hover:text-blue-600 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>+</span> Add Another Experience
          </button>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/details/education")}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2.5"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/details/projects")}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5"
            >
              Skip
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition"
            >
              Save & Continue →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
