"use client";

import { useResumeDraft } from "../resume-draft";
import { useRouter } from "next/navigation";

export default function PersonalDetails() {
  const { draft, updateDraft } = useResumeDraft();
  const router = useRouter();

  return (
    <div className="w-full max-w-xl my-20 mr-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Personal Details</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your contact info and social profiles.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/details/education");
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. John Doe"
            value={draft.name}
            onChange={(e) => updateDraft({ name: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. alex@example.com"
              value={draft.email}
              onChange={(e) => updateDraft({ email: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +1 (555) 000-0000"
              value={draft.phone || ""}
              onChange={(e) => updateDraft({ phone: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">LinkedIn</label>
          <input
            type="url"
            placeholder="https://linkedin.com/in/username"
            value={draft.linkedin || ""}
            onChange={(e) => updateDraft({ linkedin: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">GitHub</label>
          <input
            type="url"
            placeholder="https://github.com/username"
            value={draft.github || ""}
            onChange={(e) => updateDraft({ github: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Portfolio</label>
          <input
            type="url"
            placeholder="https://yourportfolio.com"
            value={draft.portfolio || ""}
            onChange={(e) => updateDraft({ portfolio: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition"
          >
            Save & Continue →
          </button>
          <button
            type="button"
            onClick={() => router.push("/details/education")}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5"
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}