"use client";

import { useResumeDraft } from "../resume-draft";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

type GenerationJob = {
  id: string;
  status: "queued" | "generating" | "compiling" | "completed" | "failed";
  errorMessage?: string;
};

export default function ReviewPage() {
  const { draft, saveResume } = useResumeDraft();
  const { getToken } = useAuth();
  const router = useRouter();

  const [aiPrompt, setAiPrompt] = useState<string>(
    "Generate a polished, high-impact single-page software engineer resume"
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"review" | "pdf">("review");

  const pdfRef = useRef<HTMLDivElement | null>(null);

  // Poll generation status
  useEffect(() => {
    if (!jobId || jobStatus === "completed" || jobStatus === "failed") return;

    const interval = setInterval(async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(`${backendUrl}/data/generation/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const job: GenerationJob = json.data;
          setJobStatus(job.status);

          if (job.status === "completed") {
            setIsGenerating(false);
            clearInterval(interval);
            const savedResumeId = window.sessionStorage.getItem("resumio-saved-resume-id");
            if (savedResumeId) {
              await fetchPdf(savedResumeId, token);
              setActiveTab("pdf");
              setTimeout(() => {
                pdfRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 300);
            }
          } else if (job.status === "failed") {
            setIsGenerating(false);
            clearInterval(interval);
            setErrorMsg(job.errorMessage || "Resume generation or compilation failed");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, jobStatus, getToken]);

  const fetchPdf = async (targetResumeId: string, token: string) => {
    try {
      const res = await fetch(`${backendUrl}/data/${targetResumeId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        throw new Error("Could not download compiled PDF file.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setPdfUrl(null);
    setJobStatus("queued");

    try {
      // 1. Save Resume Details to backend
      const res = await saveResume();
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save resume details to database.");
      }

      const json = await res.json();
      const savedResume = json.data;

      if (!savedResume?.id) {
        throw new Error("No resume ID returned from server.");
      }

      window.sessionStorage.setItem("resumio-saved-resume-id", savedResume.id);

      // 2. Trigger Inngest AI generation
      const token = await getToken();
      if (!token) {
        throw new Error("You must be logged in to generate your resume.");
      }

      const genRes = await fetch(`${backendUrl}/data/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId: savedResume.id,
          message: aiPrompt.trim() || "Generate a polished software engineer resume",
        }),
      });

      if (!genRes.ok) {
        const genErr = await genRes.json().catch(() => ({}));
        throw new Error(genErr.message || "Failed to start AI generation job.");
      }

      const genJson = await genRes.json();
      const createdJobId = genJson.data?.jobId;

      if (createdJobId) {
        setJobId(createdJobId);
        window.sessionStorage.setItem("resumio-saved-job-id", createdJobId);
      } else {
        throw new Error("Generation job could not be initiated.");
      }
    } catch (err: unknown) {
      setIsGenerating(false);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred while generating.");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl my-16 mr-20 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review &amp; Generate Resume</h2>
            <p className="text-sm text-gray-500 mt-1">
              Verify your information, then click Generate to produce your ATS-optimized PDF resume.
            </p>
          </div>
          {pdfUrl && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("review")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === "review"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Review Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pdf")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === "pdf"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                View PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-500 hover:text-red-800 ml-3 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Generation Callout Card */}
      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-purple-50/50 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-base shadow-xs">
              ✨
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900">AI LaTeX Resume Engine</h3>
              <p className="text-xs text-gray-500">
                Powered by Inngest &amp; GPT-4o with sandboxed LaTeX compilation.
              </p>
            </div>
          </div>
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`${(draft.name || "Resume").replace(/\s+/g, "_")}_Resume.pdf`}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 shrink-0"
            >
              <span>⬇</span> Download PDF
            </a>
          )}
        </div>

        {/* Custom AI Prompt Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Custom Prompt / Target Role (Optional)
          </label>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="e.g. Focus on Backend &amp; Distributed Systems, high-density bullet points..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-800 outline-none focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Generate Button & Progress */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Generating &amp; Compiling...</span>
              </>
            ) : pdfUrl ? (
              <>
                <span>✨</span> Re-generate Resume
              </>
            ) : (
              <>
                <span>✨</span> Generate Resume Now
              </>
            )}
          </button>

          {jobStatus && (
            <div className="flex items-center gap-2 text-xs font-medium">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  jobStatus === "completed"
                    ? "bg-green-500"
                    : jobStatus === "failed"
                    ? "bg-red-500"
                    : "bg-blue-500 animate-ping"
                }`}
              />
              <span className="text-gray-700 capitalize">
                {jobStatus === "queued" && "Queued in Inngest..."}
                {jobStatus === "generating" && "AI Generating LaTeX code..."}
                {jobStatus === "compiling" && "Sandboxed LaTeX Compilation..."}
                {jobStatus === "completed" && "Resume Ready!"}
                {jobStatus === "failed" && "Compilation Failed"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PDF View when ready */}
      {pdfUrl && activeTab === "pdf" && (
        <div ref={pdfRef} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Compiled PDF Preview</h3>
            <div className="flex items-center gap-2">
              <a
                href={pdfUrl}
                download={`${(draft.name || "Resume").replace(/\s+/g, "_")}_Resume.pdf`}
                className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5"
              >
                <span>⬇</span> Download PDF
              </a>
              <Link
                href="/dashboard"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
              >
                Dashboard →
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-md h-[780px]">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-none"
              title="Resume Preview"
            />
          </div>
        </div>
      )}

      {/* Details Review Section */}
      {activeTab === "review" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Resume Summary Details
          </h3>

          {/* 1. Personal Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>👤</span> Personal Information
              </h4>
              <Link
                href="/details/personal-details"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
              >
                ✏ Edit
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <span className="font-semibold text-gray-800">Full Name:</span>{" "}
                {draft.name || <span className="text-red-400 italic">Not set</span>}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Email:</span>{" "}
                {draft.email || <span className="text-red-400 italic">Not set</span>}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Phone:</span>{" "}
                {draft.phone || <span className="text-gray-400">None</span>}
              </div>
              <div>
                <span className="font-semibold text-gray-800">LinkedIn:</span>{" "}
                {draft.linkedin || <span className="text-gray-400">None</span>}
              </div>
              <div>
                <span className="font-semibold text-gray-800">GitHub:</span>{" "}
                {draft.github || <span className="text-gray-400">None</span>}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Portfolio:</span>{" "}
                {draft.portfolio || <span className="text-gray-400">None</span>}
              </div>
            </div>
          </div>

          {/* 2. Education */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>🎓</span> Education ({draft.education?.length || 0})
              </h4>
              <Link
                href="/details/education"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.education || draft.education.length === 0) ? (
              <p className="text-xs text-gray-400 italic">No education items added.</p>
            ) : (
              <div className="space-y-2">
                {draft.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded-lg text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {edu.degree} - {edu.institution || "Institution name"}
                      </p>
                      <p className="text-gray-500">Graduation Year: {edu.year || "N/A"}</p>
                    </div>
                    {edu.cgpa && (
                      <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                        CGPA/Score: {edu.cgpa}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Work Experience */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>💼</span> Work Experience ({draft.experience?.length || 0})
              </h4>
              <Link
                href="/details/experience"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.experience || draft.experience.length === 0) ? (
              <p className="text-xs text-gray-400 italic">No work experience added (optional).</p>
            ) : (
              <div className="space-y-3">
                {draft.experience.map((exp, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-gray-800">
                      <span>{exp.role || "Role"} at {exp.company || "Company"}</span>
                      <span className="text-gray-500 text-[11px]">
                        {exp.startDate} - {exp.currentlyWorking ? "Present" : exp.endDate || "N/A"}
                      </span>
                    </div>
                    {exp.location && <p className="text-gray-400 text-[11px]">{exp.location}</p>}
                    {exp.description && (
                      <p className="text-gray-600 whitespace-pre-line text-[11px] pt-1">
                        {typeof exp.description === "string"
                          ? exp.description
                          : Array.isArray(exp.description)
                          ? (exp.description as string[]).join("\n")
                          : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Projects */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>🚀</span> Projects ({draft.projects?.length || 0})
              </h4>
              <Link
                href="/details/projects"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.projects || draft.projects.length === 0) ? (
              <p className="text-xs text-gray-400 italic">No projects added.</p>
            ) : (
              <div className="space-y-3">
                {draft.projects.map((proj, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-gray-800">
                      <span>{proj.title || `Project #${idx + 1}`}</span>
                      <div className="flex gap-2 text-[11px]">
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            GitHub ↗
                          </a>
                        )}
                        {proj.live && (
                          <a
                            href={proj.live}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            Live Demo ↗
                          </a>
                        )}
                      </div>
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 py-1">
                        {proj.technologies.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {proj.description && (
                      <p className="text-gray-600 text-[11px] whitespace-pre-line">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Skills */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>⚡</span> Technical Skills ({draft.skills?.length || 0})
              </h4>
              <Link
                href="/details/skills"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.skills || draft.skills.length === 0) ? (
              <p className="text-xs text-gray-400 italic">No skills added.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {draft.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-md font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 6. Coding Profiles */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>💻</span> Coding Profiles ({draft.codingProfiles?.length || 0})
              </h4>
              <Link
                href="/details/coding-profiles"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.codingProfiles || draft.codingProfiles.length === 0) ? (
              <p className="text-xs text-gray-400 italic">No coding profiles added (optional).</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {draft.codingProfiles.map((cp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-gray-50 rounded-lg text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-gray-800">{cp.platform}</span>
                    <a
                      href={cp.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-[11px]"
                    >
                      @{cp.username || "profile"} ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Achievements */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>🏆</span> Achievements &amp; Honors ({draft.achievements?.length || 0})
              </h4>
              <Link
                href="/details/achievements"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.achievements || draft.achievements.length === 0) ? (
              <p className="text-xs text-gray-400 italic">No achievements added (optional).</p>
            ) : (
              <div className="space-y-2">
                {draft.achievements.map((ach, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-gray-800">
                      <span>{ach.title}</span>
                      {ach.date && <span className="text-gray-400 text-[11px]">{ach.date}</span>}
                    </div>
                    {ach.description && (
                      <p className="text-gray-600 text-[11px]">{ach.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Bottom Footer */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push("/details/achievements")}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2.5"
            >
              ← Back to Achievements
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>✨</span> Generate Resume with AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
