"use client";

import { useResumeDraft, CodingProfileItem } from "../resume-draft";
import { useRouter } from "next/navigation";

const PLATFORM_PRESETS = [
  { name: "LeetCode", prefix: "https://leetcode.com/u/" },
  { name: "Codeforces", prefix: "https://codeforces.com/profile/" },
  { name: "CodeChef", prefix: "https://www.codechef.com/users/" },
  { name: "GeeksforGeeks", prefix: "https://auth.geeksforgeeks.org/user/" },
  { name: "HackerRank", prefix: "https://www.hackerrank.com/profile/" },
  { name: "Kaggle", prefix: "https://www.kaggle.com/" },
  { name: "Other", prefix: "https://" },
];

export default function CodingProfilesPage() {
  const { draft, updateDraft } = useResumeDraft();
  const router = useRouter();

  const profilesList: CodingProfileItem[] = Array.isArray(draft.codingProfiles)
    ? draft.codingProfiles
    : [];

  const handleFieldChange = (
    index: number,
    field: keyof CodingProfileItem,
    value: string
  ) => {
    const updated = profilesList.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateDraft({ codingProfiles: updated });
  };

  const handleAddProfile = () => {
    const newProfile: CodingProfileItem = {
      platform: "LeetCode",
      username: "",
      url: "",
    };
    updateDraft({ codingProfiles: [...profilesList, newProfile] });
  };

  const handleRemoveProfile = (index: number) => {
    const updated = profilesList.filter((_, i) => i !== index);
    updateDraft({ codingProfiles: updated });
  };

  return (
    <div className="w-full max-w-xl my-20 mr-50">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Coding Profiles</h2>
      <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
        Add your competitive programming and coding platform profiles (optional).
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/details/achievements");
        }}
        className="space-y-6"
      >
        {profilesList.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] p-8 text-center">
            <p className="text-sm text-gray-600 dark:text-neutral-300 font-medium mb-1">
              No coding profiles added yet
            </p>
            <p className="text-xs text-gray-400 dark:text-neutral-500 mb-4">
              Add LeetCode, Codeforces, HackerRank, etc., to showcase problem-solving expertise.
            </p>
            <button
              type="button"
              onClick={handleAddProfile}
              className="bg-blue-50 dark:bg-neutral-900 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-neutral-800 text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
            >
              + Add Coding Profile
            </button>
          </div>
        )}

        {profilesList.map((item, index) => {
          const isKnownPlatform = PLATFORM_PRESETS.some(
            (p) => p.name === item.platform
          );
          const platformSelectValue = isKnownPlatform ? item.platform : "Other";

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
                    {item.platform || `Profile #${index + 1}`}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveProfile(index)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-neutral-900 transition cursor-pointer"
                >
                  ✕ Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                    Platform *
                  </label>
                  <select
                    value={platformSelectValue}
                    onChange={(e) => {
                      const selected = e.target.value;
                      handleFieldChange(
                        index,
                        "platform",
                        selected === "Other" ? "" : selected
                      );
                    }}
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    {PLATFORM_PRESETS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  {!isKnownPlatform && (
                    <input
                      type="text"
                      required
                      placeholder="Enter platform name"
                      value={item.platform}
                      onChange={(e) =>
                        handleFieldChange(index, "platform", e.target.value)
                      }
                      className="w-full mt-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. your_handle"
                    value={item.username || ""}
                    onChange={(e) =>
                      handleFieldChange(index, "username", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                  Profile URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://leetcode.com/u/your_handle"
                  value={item.url}
                  onChange={(e) =>
                    handleFieldChange(index, "url", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          );
        })}

        {profilesList.length > 0 && (
          <button
            type="button"
            onClick={handleAddProfile}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-neutral-900/60 text-gray-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+</span> Add Another Profile
          </button>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/details/skills")}
            className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-medium px-3 py-2.5 cursor-pointer"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/details/achievements")}
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
