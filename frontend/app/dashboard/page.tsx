"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ThemeToggle } from "../theme-toggle";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

type GenerationJob = {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  errorMessage?: string;
};

export default function DashboardPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("queued");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const savedResumeId = window.sessionStorage.getItem("resumio-saved-resume-id");
    const savedJobId = window.sessionStorage.getItem("resumio-saved-job-id");
    if (savedResumeId) setResumeId(savedResumeId);
    if (savedJobId) setJobId(savedJobId);
  }, []);

  const triggerGeneration = async (resId?: string) => {
    const targetResumeId = resId || resumeId;
    if (!targetResumeId) return;

    setErrorMsg(null);
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/data/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId: targetResumeId,
          message: "Generate a polished single-page software engineer resume",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to trigger generation");
      }

      const data = await res.json();
      const createdJobId = data.data?.jobId;
      if (createdJobId) {
        setJobId(createdJobId);
        window.sessionStorage.setItem("resumio-saved-job-id", createdJobId);
        setJobStatus("queued");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${backendUrl}/data/generation/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const job: GenerationJob = json.data;
          setJobStatus(job.status);

          if (job.status === "completed") {
            clearInterval(interval);
            if (resumeId) {
              fetchPdf(resumeId);
            }
          } else if (job.status === "failed") {
            clearInterval(interval);
            setErrorMsg(job.errorMessage || "Resume compilation failed");
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [jobId, resumeId, getToken]);

  const fetchPdf = async (targetResumeId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/data/${targetResumeId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      }
    } catch (err) {
      console.error("Failed to load PDF:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="brand text-lg font-bold tracking-tight no-underline">
          resumio<span>.</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/details/personal-details"
            className="text-xs text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            ✏ Edit Details
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Your Resume</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Your details are saved. AI will generate and compile your LaTeX PDF resume.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerGeneration()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition shadow-xs"
            >
              Regenerate Resume
            </button>
            {pdfUrl && (
              <a
                href={pdfUrl}
                download="resume.pdf"
                className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
              >
                ⬇ Download PDF
              </a>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  jobStatus === "completed"
                    ? "bg-green-400"
                    : jobStatus === "failed"
                    ? "bg-red-400"
                    : "bg-blue-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  jobStatus === "completed"
                    ? "bg-green-500"
                    : jobStatus === "failed"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              />
            </span>
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-slate-200 capitalize">
                Status: {jobStatus}
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                {jobStatus === "completed"
                  ? "Your resume has been compiled and is ready!"
                  : jobStatus === "failed"
                  ? "There was an error generating your resume."
                  : "AI is crafting your LaTeX resume and compiling PDF..."}
              </p>
            </div>
          </div>
        </div>

        {pdfUrl ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm h-[750px]">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-none"
              title="Resume Preview"
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">📄</div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
              {jobStatus === "completed"
                ? "Loading PDF preview..."
                : "Resume compilation in progress"}
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 max-w-sm mx-auto">
              Please wait a few seconds while Inngest and LaTeX compile your document.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-blue-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Feature Request or Bug Report?</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Found an issue or want a new feature/template? Send an email directly.
              </p>
            </div>
          </div>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=amrit.createch@gmail.com&su=%5BResumio%20Feature%20Request%20/%20Bug%20Report%5D&body=Hi%20Amrit,%0A%0AI'd%20love%20to%20request%20the%20following%20feature%20or%20report%20a%20bug:%0A%0A"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition shadow-xs whitespace-nowrap flex items-center gap-1.5"
          >
            <span>✉️</span> Send Request / Bug Report
          </a>
        </div>
      </main>
    </div>
  );
}
