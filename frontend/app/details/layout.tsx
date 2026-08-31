"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ResumeProvider } from "./reducer";
import { ResumeDraftProvider } from "./resume-draft";
import { ThemeToggle } from "../theme-toggle";

const steps = [
  { label: "Personal", href: "/details/personal-details", icon: "👤" },
  { label: "Education", href: "/details/education", icon: "🎓" },
  { label: "Experience", href: "/details/experience", icon: "💼" },
  { label: "Projects", href: "/details/projects", icon: "🚀" },
  { label: "Skills", href: "/details/skills", icon: "⚡" },
  { label: "Coding Profiles", href: "/details/coding-profiles", icon: "💻" },
  { label: "Achievements", href: "/details/achievements", icon: "🏆" },
  { label: "Review & Generate", href: "/details/review", icon: "✨" },
];

export default function DetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentIndex = steps.findIndex((s) => pathname.startsWith(s.href));

  return (
    <ResumeProvider>
      <ResumeDraftProvider>
        <div className="grid min-h-screen lg:grid-cols-[260px_1fr] bg-gray-50 dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
          <aside className="border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] flex flex-col px-5 py-7 max-lg:flex-row max-lg:items-center max-lg:gap-4 max-lg:border-b max-lg:border-r-0 max-lg:py-4 max-lg:overflow-x-auto">
            <div className="flex items-center justify-between gap-3 w-full shrink-0">
              <Link
                href="/"
                className="brand text-lg font-bold tracking-tight no-underline shrink-0"
              >
                resumio<span>.</span>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-neutral-100 dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-neutral-800 px-2.5 py-1 rounded-full"
                >
                  ← Home
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-neutral-500 uppercase tracking-widest mt-6 mb-5 max-lg:hidden">
              Build your resume
            </p>

            <nav className="flex flex-col gap-0.5 flex-1 max-lg:flex-row max-lg:gap-1 max-lg:ml-auto">
              {steps.map((step, i) => {
                const isActive = pathname.startsWith(step.href);
                const isDone = i < currentIndex;
                return (
                  <Link
                    key={step.href}
                    href={step.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] no-underline transition-all
                      max-lg:flex-col max-lg:gap-1 max-lg:text-[10px] max-lg:min-w-[56px] max-lg:text-center max-lg:px-2 max-lg:py-1.5
                      ${isActive
                        ? "bg-blue-50 dark:bg-neutral-900 text-blue-700 dark:text-blue-400 font-semibold"
                        : isDone
                          ? "text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-900/60"
                          : "text-gray-400 dark:text-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-900/60 hover:text-gray-600 dark:hover:text-neutral-300"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-lg text-sm shrink-0
                        ${isActive
                          ? "bg-blue-100 dark:bg-neutral-800 text-blue-700 dark:text-blue-400"
                          : isDone
                            ? "bg-green-50 dark:bg-neutral-900 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                        }
                      `}
                    >
                      {isDone ? (
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold">✓</span>
                      ) : (
                        step.icon
                      )}
                    </span>
                    <span className="whitespace-nowrap">{step.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 mt-auto border-t border-gray-100 dark:border-neutral-800 max-lg:hidden">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=amrit.createch@gmail.com&su=%5BResumio%20Resume%20Section%20Request%5D&body=Hi%20Amrit,%0A%0AI%20would%20like%20to%20request%20the%20following%20resume%20section%20(e.g.%20Publications,%20Volunteering,%20Coursework,%20Leadership):%0A%0A"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium py-1 px-1 rounded transition"
              >
                <span>➕</span> Request a New Section
              </a>
            </div>

            <div className="pt-3 flex items-center gap-3 max-lg:border-t-0 max-lg:pt-0 max-lg:mt-0 max-lg:ml-4">
              <div className="w-full bg-gray-100 dark:bg-neutral-900 rounded-full h-1.5 max-w-[120px] max-lg:w-16">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentIndex + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-gray-400 dark:text-neutral-500 whitespace-nowrap">
                {currentIndex + 1}/{steps.length}
              </span>
            </div>
          </aside>

          <main className="bg-gray-50/50 dark:bg-black flex flex-col items-center p-8 max-sm:p-5 overflow-y-auto">
            <div className="w-full max-w-4xl mb-4 flex items-center justify-start">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 px-3 py-1.5 rounded-full"
              >
                ← Back to Home
              </Link>
            </div>
            {children}
          </main>
        </div>
      </ResumeDraftProvider>
    </ResumeProvider>
  );
}