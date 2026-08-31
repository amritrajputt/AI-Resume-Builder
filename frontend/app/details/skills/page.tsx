"use client";

import { useResumeDraft } from "../resume-draft";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTED_SKILLS = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Git & GitHub",
  "REST APIs",
  "TailwindCSS",
  "GraphQL",
  "AWS",
  "Linux",
  "Data Structures & Algorithms",
];

export default function SkillsPage() {
  const { draft, updateDraft } = useResumeDraft();
  const router = useRouter();
  const [skillInput, setSkillInput] = useState("");

  const skillsList: string[] = Array.isArray(draft.skills) ? draft.skills : [];

  const handleAddSkills = (raw: string) => {
    if (!raw.trim()) return;
    const splitSkills = raw
      .split(/[,+]/)
      .map((s) => s.trim())
      .filter((s) => s && !skillsList.includes(s));

    if (splitSkills.length > 0) {
      updateDraft({ skills: [...skillsList, ...splitSkills] });
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateDraft({ skills: skillsList.filter((s) => s !== skillToRemove) });
  };

  const handleToggleSuggestion = (skill: string) => {
    if (skillsList.includes(skill)) {
      handleRemoveSkill(skill);
    } else {
      updateDraft({ skills: [...skillsList, skill] });
    }
  };

  return (
    <div className="w-full max-w-xl my-20 mr-50">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Technical Skills</h2>
      <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
        Add programming languages, frameworks, libraries, and tools you know.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/details/coding-profiles");
        }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f0f] p-5 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
              Add Skills (Type and press Enter or comma)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Next.js, Docker, Java, PostgreSQL..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddSkills(skillInput);
                  }
                }}
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkills(skillInput)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shrink-0 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-2">
              Your Added Skills ({skillsList.length})
            </label>
            {skillsList.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-neutral-500 italic">
                No skills added yet. Select from the quick suggestions below or type your own.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-neutral-900 border border-blue-200 dark:border-neutral-800 text-blue-800 dark:text-blue-400 text-xs font-medium px-3 py-1.5 rounded-lg"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-500 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-bold ml-1 text-sm leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-neutral-800 pt-4">
            <label className="block text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">
              ⚡ Quick Suggestions (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SKILLS.map((suggestion) => {
                const isSelected = skillsList.includes(suggestion);
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleToggleSuggestion(suggestion)}
                    className={`text-xs px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {isSelected ? `✓ ${suggestion}` : `+ ${suggestion}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/details/projects")}
            className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-medium px-3 py-2.5 cursor-pointer"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/details/coding-profiles")}
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
