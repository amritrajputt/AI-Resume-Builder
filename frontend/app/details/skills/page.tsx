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
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Technical Skills</h2>
      <p className="text-sm text-gray-500 mb-6">
        Add programming languages, frameworks, libraries, and tools you know.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/details/coding-profiles");
        }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
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
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkills(skillInput)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Your Added Skills ({skillsList.length})
            </label>
            {skillsList.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No skills added yet. Select from the quick suggestions below or type your own.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-500 hover:text-blue-800 font-bold ml-1 text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-xs font-semibold text-gray-500 mb-2">
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
                    className={`text-xs px-2.5 py-1 rounded-md transition font-medium ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2.5"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/details/coding-profiles")}
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
