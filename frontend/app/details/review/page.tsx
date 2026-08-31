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
            setErrorMsg("Resume generation could not be completed. Please click Generate Resume to try again.");
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
        throw new Error("Unable to download preview.");
      }
    } catch (err: unknown) {
      setErrorMsg("Unable to load the compiled preview. Please try generating again.");
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setPdfUrl(null);
    setJobStatus("queued");

    try {
      const res = await saveResume();
      if (!res.ok) {
        throw new Error("Failed to save resume details.");
      }

      const json = await res.json();
      const savedResume = json.data;

      if (!savedResume?.id) {
        throw new Error("No resume ID returned from server.");
      }

      window.sessionStorage.setItem("resumio-saved-resume-id", savedResume.id);

      const token = await getToken();
      if (!token) {
        throw new Error("Please sign in to generate your resume.");
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
        throw new Error("Unable to start AI generation job.");
      }

      const genJson = await genRes.json();
      const createdJobId = genJson.data?.jobId;

      if (createdJobId) {
        setJobId(createdJobId);
        window.sessionStorage.setItem("resumio-saved-job-id", createdJobId);
      } else {
        throw new Error("Unable to initialize generation queue.");
      }
    } catch (err: unknown) {
      setIsGenerating(false);
      setErrorMsg("Unable to process your resume right now. Please try again in a few moments.");
    }
  };

  return (
    <div className="w-full max-w-2xl my-16 mr-20 space-y-6">
      <div className="border-b border-gray-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review &amp; Generate Resume</h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
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
                    : "bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
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
                    : "bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                }`}
              >
                View PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-neutral-900 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-sm flex items-start justify-between">
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

      {(() => {
        const expCount = Array.isArray(draft.experience) ? draft.experience.length : 0;
        const projCount = Array.isArray(draft.projects) ? draft.projects.length : 0;

        let message = "";
        let isOptimal = false;

        if (expCount === 0) {
          isOptimal = projCount >= 3;
          message = isOptimal
            ? `Fresher Profile (0 Exp): ${projCount} detailed projects added. Perfect to fill 1 full page!`
            : `Fresher Profile (0 Exp): ${projCount}/3–4 projects added. Adding 3–4 detailed projects with numbers & impact is recommended to fill 1 full page.`;
        } else if (expCount === 1) {
          isOptimal = projCount >= 3;
          message = isOptimal
            ? `1 Experience Profile: ${projCount} projects added. Perfect balance to fill 1 full page!`
            : `1 Experience Profile: ${projCount}/3 projects added. Adding at least 3 projects with metrics/impact is recommended to fill the page.`;
        } else if (expCount === 2) {
          isOptimal = projCount >= 2;
          message = isOptimal
            ? `2 Experiences Profile: ${projCount} projects added. Clean, balanced 1-page layout!`
            : `2 Experiences Profile: ${projCount}/2 projects added. Adding 2 projects with strong numbers/impact is recommended.`;
        } else {
          isOptimal = projCount >= 1;
          message = `Experienced Profile (${expCount} jobs): ${projCount} projects added. Ideal for keeping strictly to 1 page.`;
        }

        return (
          <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            isOptimal
              ? "bg-emerald-50/80 dark:bg-neutral-900 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
              : "bg-amber-50/90 dark:bg-neutral-900 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300"
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="text-base">{isOptimal ? "✨" : "💡"}</span>
              <span>{message}</span>
            </div>
            {!isOptimal && (
              <Link
                href="/details/projects"
                className="font-semibold text-amber-900 dark:text-amber-300 underline hover:text-amber-700 whitespace-nowrap ml-2"
              >
                + Add Projects
              </Link>
            )}
          </div>
        );
      })()}

      <div className="rounded-2xl border-2 border-blue-200 dark:border-neutral-800 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-neutral-50 dark:from-[#0f0f0f] dark:via-[#0a0a0a] dark:to-black p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">AI LaTeX Resume Engine</h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
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

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
            Custom Prompt / Target Role (Optional)
          </label>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="e.g. Focus on Backend &amp; Distributed Systems, high-density bullet points..."
            className="w-full rounded-lg border border-gray-300 dark:border-neutral-800 bg-white dark:bg-[#141414] px-3.5 py-2 text-xs text-gray-800 dark:text-neutral-200 outline-none focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-neutral-900"
          />
        </div>

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
                <span></span> Re-generate Resume
              </>
            ) : (
              <>
                <span></span> Generate Resume Now
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
              <span className="text-gray-700 dark:text-neutral-300 capitalize">
                {jobStatus === "queued" && "Queued in Inngest..."}
                {jobStatus === "generating" && "AI Generating LaTeX code..."}
                {jobStatus === "compiling" && "Sandboxed LaTeX Compilation..."}
                {jobStatus === "completed" && "Resume Ready!"}
                {jobStatus === "failed" && "Generation paused"}
              </span>
            </div>
          )}
        </div>
      </div>

      {pdfUrl && activeTab === "pdf" && (
        <div ref={pdfRef} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Compiled PDF Preview</h3>
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
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-3 py-2 border border-blue-200 dark:border-neutral-800 rounded-lg hover:bg-blue-50 dark:hover:bg-neutral-900 transition"
              >
                Dashboard →
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-md h-[780px]">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-none"
              title="Resume Preview"
            />
          </div>
        </div>
      )}

      {activeTab === "review" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            Resume Summary Details
          </h3>

          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f0f] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>👤</span> Personal Information
              </h4>
              <Link
                href="/details/personal-details"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-neutral-900 transition"
              >
                ✏ Edit
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-neutral-400">
              <div>
                <span className="font-semibold text-gray-800 dark:text-neutral-200">Full Name:</span>{" "}
                {draft.name || <span className="text-red-400 italic">Not set</span>}
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-neutral-200">Email:</span>{" "}
                {draft.email || <span className="text-red-400 italic">Not set</span>}
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-neutral-200">Phone:</span>{" "}
                {draft.phone || <span className="text-gray-400 dark:text-neutral-600">None</span>}
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-neutral-200">LinkedIn:</span>{" "}
                {draft.linkedin || <span className="text-gray-400 dark:text-neutral-600">None</span>}
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-neutral-200">GitHub:</span>{" "}
                {draft.github || <span className="text-gray-400 dark:text-neutral-600">None</span>}
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-neutral-200">Portfolio:</span>{" "}
                {draft.portfolio || <span className="text-gray-400 dark:text-neutral-600">None</span>}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f0f] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🎓</span> Education ({draft.education?.length || 0})
              </h4>
              <Link
                href="/details/education"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-neutral-900 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.education || draft.education.length === 0) ? (
              <p className="text-xs text-gray-400 dark:text-neutral-500 italic">No education items added.</p>
            ) : (
              <div className="space-y-2">
                {draft.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-[#141414] rounded-lg text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-neutral-200">
                        {edu.degree} - {edu.institution || "Institution name"}
                      </p>
                      <p className="text-gray-500 dark:text-neutral-400">Graduation Year: {edu.year || "N/A"}</p>
                    </div>
                    {edu.cgpa && (
                      <span className="bg-blue-100 dark:bg-neutral-800 text-blue-800 dark:text-blue-300 font-semibold px-2 py-0.5 rounded text-[11px]">
                        CGPA/Score: {edu.cgpa}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f0f] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>💼</span> Work Experience ({draft.experience?.length || 0})
              </h4>
              <Link
                href="/details/experience"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-neutral-900 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.experience || draft.experience.length === 0) ? (
              <p className="text-xs text-gray-400 dark:text-neutral-500 italic">No work experience added (optional).</p>
            ) : (
              <div className="space-y-3">
                {draft.experience.map((exp, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-[#141414] rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-gray-800 dark:text-neutral-200">
                      <span>{exp.role || "Role"} at {exp.company || "Company"}</span>
                      <span className="text-gray-500 dark:text-neutral-400 text-[11px]">
                        {exp.startDate} - {exp.currentlyWorking ? "Present" : exp.endDate || "N/A"}
                      </span>
                    </div>
                    {exp.location && <p className="text-gray-400 dark:text-neutral-500 text-[11px]">{exp.location}</p>}
                    {exp.description && (
                      <p className="text-gray-600 dark:text-neutral-300 whitespace-pre-line text-[11px] pt-1">
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

          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f0f] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🚀</span> Projects ({draft.projects?.length || 0})
              </h4>
              <Link
                href="/details/projects"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-neutral-900 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.projects || draft.projects.length === 0) ? (
              <p className="text-xs text-gray-400 dark:text-neutral-500 italic">No projects added.</p>
            ) : (
              <div className="space-y-3">
                {draft.projects.map((proj, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-[#141414] rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-gray-800 dark:text-neutral-200">
                      <span>{proj.title || `Project #${idx + 1}`}</span>
                      <div className="flex gap-2 text-[11px]">
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            GitHub ↗
                          </a>
                        )}
                        {proj.live && (
                          <a
                            href={proj.live}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 dark:text-green-400 hover:underline"
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
                            className="bg-blue-100 dark:bg-neutral-800 text-blue-800 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {proj.description && (
                      <p className="text-gray-600 dark:text-neutral-300 text-[11px] whitespace-pre-line">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f0f] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>⚡</span> Technical Skills ({draft.skills?.length || 0})
              </h4>
              <Link
                href="/details/skills"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-neutral-900 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.skills || draft.skills.length === 0) ? (
              <p className="text-xs text-gray-400 dark:text-neutral-500 italic">No skills added.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {draft.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-800 dark:text-neutral-200 text-xs px-2.5 py-1 rounded-md font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f0f] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>💻</span> Coding Profiles ({draft.codingProfiles?.length || 0})
              </h4>
              <Link
                href="/details/coding-profiles"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-neutral-900 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.codingProfiles || draft.codingProfiles.length === 0) ? (
              <p className="text-xs text-gray-400 dark:text-neutral-500 italic">No coding profiles added (optional).</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {draft.codingProfiles.map((cp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-gray-50 dark:bg-[#141414] rounded-lg text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-gray-800 dark:text-neutral-200">{cp.platform}</span>
                    <a
                      href={cp.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                    >
                      @{cp.username || "profile"} ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f0f] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🏆</span> Achievements &amp; Honors ({draft.achievements?.length || 0})
              </h4>
              <Link
                href="/details/achievements"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-neutral-900 transition"
              >
                ✏ Edit
              </Link>
            </div>
            {(!draft.achievements || draft.achievements.length === 0) ? (
              <p className="text-xs text-gray-400 dark:text-neutral-500 italic">No achievements added (optional).</p>
            ) : (
              <div className="space-y-2">
                {draft.achievements.map((ach, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-[#141414] rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-gray-800 dark:text-neutral-200">
                      <span>{ach.title}</span>
                      {ach.date && <span className="text-gray-400 dark:text-neutral-500 text-[11px]">{ach.date}</span>}
                    </div>
                    {ach.description && (
                      <p className="text-gray-600 dark:text-neutral-300 text-[11px]">{ach.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push("/details/achievements")}
              className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-medium px-3 py-2.5 cursor-pointer"
            >
              ← Back to Achievements
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span></span> Generate Resume with AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
