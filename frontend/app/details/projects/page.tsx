"use client";

import { useResumeDraft, ProjectItem } from "../resume-draft";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProjectsPage() {
  const { draft, updateDraft } = useResumeDraft();
  const router = useRouter();
  const [techInputs, setTechInputs] = useState<Record<number, string>>({});

  const projectsList: ProjectItem[] = Array.isArray(draft.projects)
    ? draft.projects
    : [];

  const handleFieldChange = (
    index: number,
    field: keyof ProjectItem,
    value: unknown
  ) => {
    const updated = projectsList.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateDraft({ projects: updated });
  };

  const handleAddProject = () => {
    const newProj: ProjectItem = {
      title: "",
      description: "",
      technologies: [],
      github: "",
      live: "",
    };
    updateDraft({ projects: [...projectsList, newProj] });
  };

  const handleRemoveProject = (index: number) => {
    const updated = projectsList.filter((_, i) => i !== index);
    updateDraft({ projects: updated });
  };

  const handleAddTech = (index: number) => {
    const inputVal = (techInputs[index] || "").trim();
    if (!inputVal) return;

    const currentTechs = projectsList[index]?.technologies || [];
    const newTechs = inputVal
      .split(/[,+]/)
      .map((t) => t.trim())
      .filter((t) => t && !currentTechs.includes(t));

    if (newTechs.length > 0) {
      handleFieldChange(index, "technologies", [...currentTechs, ...newTechs]);
    }
    setTechInputs((prev) => ({ ...prev, [index]: "" }));
  };

  const handleRemoveTech = (projIndex: number, techToRemove: string) => {
    const currentTechs = projectsList[projIndex]?.technologies || [];
    handleFieldChange(
      projIndex,
      "technologies",
      currentTechs.filter((t) => t !== techToRemove)
    );
  };

  const experienceCount = Array.isArray(draft.experience) ? draft.experience.length : 0;
  const projectCount = projectsList.length;
  const isFresher = experienceCount === 0;

  return (
    <div className="w-full max-w-xl my-20 mr-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Projects</h2>
      <p className="text-sm text-gray-500 mb-4">
        Highlight your best personal, open-source, or academic projects.
      </p>

      {/* Smart Page Density Suggestion */}
      <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 p-4 shadow-xs flex items-start gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shrink-0 mt-0.5">
          💡
        </div>
        <div className="text-xs leading-relaxed text-slate-700">
          <p className="font-semibold text-slate-900 mb-0.5">
            Smart 1-Page Layout Tip
          </p>
          {isFresher ? (
            <span>
              Since you have <strong className="text-blue-700 font-semibold">0 work experience</strong>, we recommend adding at least <strong className="text-blue-700 font-semibold">3 detailed projects</strong> to fill your 1-page resume perfectly. (Currently: <span className={projectCount >= 3 ? "text-emerald-700 font-bold" : "text-amber-600 font-bold"}>{projectCount}/3 added</span>)
            </span>
          ) : (
            <span>
              For profiles with work experience, adding <strong className="text-blue-700 font-semibold">2 strong projects</strong> is recommended to fill 1 page cleanly. (Currently: <span className={projectCount >= 2 ? "text-emerald-700 font-bold" : "text-amber-600 font-bold"}>{projectCount}/2 added</span>)
            </span>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/details/skills");
        }}
        className="space-y-6"
      >
        {projectsList.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-600 font-medium mb-1">
              No projects added yet
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Add projects to showcase your technical skills and building capability.
            </p>
            <button
              type="button"
              onClick={handleAddProject}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              + Add Project
            </button>
          </div>
        )}

        {projectsList.map((item, index) => (
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
                  {item.title || `Project #${index + 1}`}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveProject(index)}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
              >
                ✕ Remove
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PRRabbit - Automated AI Code Reviewer"
                value={item.title}
                onChange={(e) =>
                  handleFieldChange(index, "title", e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Technologies Used (comma separated or enter)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Next.js, TypeScript, PostgreSQL, Tailwind"
                  value={techInputs[index] || ""}
                  onChange={(e) =>
                    setTechInputs((prev) => ({
                      ...prev,
                      [index]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddTech(index);
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddTech(index)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg transition shrink-0"
                >
                  Add
                </button>
              </div>

              {(item.technologies || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-medium"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(index, tech)}
                        className="text-blue-400 hover:text-blue-600 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Description / Bullets *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe what the project does, problems solved, and measurable impact (e.g. Built automated webhook triggers, indexed 10k+ PR diffs...)"
                value={item.description}
                onChange={(e) =>
                  handleFieldChange(index, "description", e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={item.github || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "github", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  placeholder="https://myproject.com"
                  value={item.live || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "live", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        {projectsList.length > 0 && (
          <button
            type="button"
            onClick={handleAddProject}
            className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 text-gray-600 hover:text-blue-600 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>+</span> Add Another Project
          </button>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/details/experience")}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2.5"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/details/skills")}
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
