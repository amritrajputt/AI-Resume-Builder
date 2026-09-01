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

  return (
    <div className="w-full max-w-xl my-20 mr-50">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Projects</h2>
      <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
        Highlight your best personal, open-source, or academic projects.
      </p>

      <div className="mb-6 rounded-2xl border border-blue-200 dark:border-neutral-800 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 dark:from-[#0f0f0f] dark:via-[#0f0f0f] dark:to-black p-4 shadow-xs flex items-start gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shrink-0 mt-0.5">
          💡
        </div>
        <div className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
          <p className="font-semibold text-neutral-900 dark:text-white mb-0.5">
            Smart 1-Page Layout Tip
          </p>
          {experienceCount === 0 && (
            <span>
              With <strong className="text-blue-700 dark:text-blue-400 font-semibold">0 work experience</strong>, we recommend adding <strong className="text-blue-700 dark:text-blue-400 font-semibold">3–4 detailed projects</strong> with numbers &amp; measurable impact (scale, % speedup, users) to fill your 1-page resume completely. (Currently: <span className={projectCount >= 3 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>{projectCount}/3–4 added</span>)
            </span>
          )}
          {experienceCount === 1 && (
            <span>
              With <strong className="text-blue-700 dark:text-blue-400 font-semibold">1 work experience</strong>, put <strong className="text-blue-700 dark:text-blue-400 font-semibold">at least 3 detailed projects</strong> with numbers &amp; impact to fill the 1-page layout nicely. (Currently: <span className={projectCount >= 3 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>{projectCount}/3 added</span>)
            </span>
          )}
          {experienceCount === 2 && (
            <span>
              With <strong className="text-blue-700 dark:text-blue-400 font-semibold">2 work experiences</strong>, adding <strong className="text-blue-700 dark:text-blue-400 font-semibold">2 projects</strong> with strong numbers &amp; impact provides the perfect 1-page balance. (Currently: <span className={projectCount >= 2 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>{projectCount}/2 added</span>)
            </span>
          )}
          {experienceCount >= 3 && (
            <span>
              With <strong className="text-blue-700 dark:text-blue-400 font-semibold">{experienceCount} work experiences</strong>, include <strong className="text-blue-700 dark:text-blue-400 font-semibold">1–2 projects</strong> to ensure everything fits cleanly on 1 page without spilling over. (Currently: <span className={projectCount >= 1 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>{projectCount}/2 added</span>)
            </span>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-indigo-200 dark:border-indigo-950/70 bg-indigo-50/50 dark:bg-[#0c0f1d] p-4 text-xs text-neutral-700 dark:text-neutral-300">
        <p className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
          <span>🚀</span> How to give enough details for AI to generate 4–5 solid points in numbers:
        </p>
        <ul className="list-disc list-inside space-y-1 text-[11.5px] text-neutral-600 dark:text-neutral-300 mt-1.5 ml-1">
          <li><strong>Architecture &amp; Core Tech:</strong> What you built, frameworks, databases, and microservices/queues used.</li>
          <li><strong>Key Features &amp; APIs:</strong> Real-time WebSockets, REST/GraphQL APIs, Auth (JWT/OAuth), or async workers.</li>
          <li><strong>Quantified Impact &amp; Numbers:</strong> Scale/users (e.g. 5k+ users), latency reduction (e.g. 40% faster), cache hit rate (95%+), or TPS.</li>
          <li><strong>Deployment &amp; Quality:</strong> Docker containers, CI/CD pipelines, unit test coverage, or cloud hosting (AWS/Vercel).</li>
        </ul>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/details/skills");
        }}
        className="space-y-6"
      >
        {projectsList.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] p-8 text-center">
            <p className="text-sm text-gray-600 dark:text-neutral-300 font-medium mb-1">
              No projects added yet
            </p>
            <p className="text-xs text-gray-400 dark:text-neutral-500 mb-4">
              Add projects to showcase your technical skills and building capability.
            </p>
            <button
              type="button"
              onClick={handleAddProject}
              className="bg-blue-50 dark:bg-neutral-900 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-neutral-800 text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              + Add Project
            </button>
          </div>
        )}

        {projectsList.map((item, index) => (
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
                  {item.title || `Project #${index + 1}`}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveProject(index)}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-neutral-900 transition"
              >
                ✕ Remove
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Real-Time Collaborative Canvas"
                value={item.title}
                onChange={(e) =>
                  handleFieldChange(index, "title", e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
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
                  className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddTech(index)}
                  className="bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-xs font-medium px-3 py-2 rounded-lg transition shrink-0"
                >
                  Add
                </button>
              </div>

              {(item.technologies || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1 bg-blue-50 dark:bg-neutral-900 text-blue-700 dark:text-blue-400 text-xs px-2.5 py-1 rounded-md font-medium border border-blue-100 dark:border-neutral-800"
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
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                Project Description &amp; Technical Details (Provide details so AI can create 4–5 solid bullet points) *
              </label>
              <textarea
                rows={4}
                required
                placeholder={`Describe the system architecture, key features, and impact with numbers. For example:\n• Built real-time collaborative canvas with Next.js, Node.js, and Redis pub/sub\n• Implemented WebSocket engine handling 5k+ concurrent users with <50ms latency\n• Optimized PostgreSQL queries with composite indexing, cutting query times by 45%\n• Packaged into Docker container with CI/CD pipeline achieving 99.9% uptime`}
                value={item.description}
                onChange={(e) =>
                  handleFieldChange(index, "description", e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 resize-y font-mono leading-relaxed"
              />
              <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1.5 leading-normal">
                💡 <strong>Pro Tip:</strong> Include technical details (stack, APIs, database, caching) and quantified metrics (e.g. 10k+ users, 40% speedup, 50ms latency). The AI will synthesize <strong>4–5 solid, quantified LaTeX bullet points</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={item.github || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "github", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  placeholder="https://myproject.com"
                  value={item.live || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "live", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        {projectsList.length > 0 && (
          <button
            type="button"
            onClick={handleAddProject}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-neutral-900/60 text-gray-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>+</span> Add Another Project
          </button>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/details/experience")}
            className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-medium px-3 py-2.5"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/details/skills")}
              className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 px-3 py-2.5"
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
