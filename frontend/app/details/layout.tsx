"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ResumeProvider } from "./reducer";
import { ResumeDraftProvider } from "./resume-draft";

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
        <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="border-r border-gray-200 bg-white flex flex-col px-5 py-7 max-lg:flex-row max-lg:items-center max-lg:gap-4 max-lg:border-b max-lg:border-r-0 max-lg:py-4 max-lg:overflow-x-auto">
            <div className="flex items-center justify-between gap-3 w-full shrink-0">
              <Link
                href="/"
                className="brand text-lg font-bold tracking-tight no-underline shrink-0"
              >
                resumio<span>.</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-full"
              >
                ← Home
              </Link>
            </div>

            <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-6 mb-5 max-lg:hidden">
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
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : isDone
                          ? "text-gray-500 hover:bg-gray-50"
                          : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-lg text-sm shrink-0
                        ${isActive
                          ? "bg-blue-100"
                          : isDone
                            ? "bg-green-50"
                            : "bg-gray-100"
                        }
                      `}
                    >
                      {isDone ? (
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      ) : (
                        step.icon
                      )}
                    </span>
                    <span className="whitespace-nowrap">{step.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Progress footer */}
            <div className="border-t border-gray-100 pt-4 mt-auto flex items-center gap-3 max-lg:border-t-0 max-lg:pt-0 max-lg:mt-0 max-lg:ml-4">
              <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-[120px] max-lg:w-16">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentIndex + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-gray-400 whitespace-nowrap">
                {currentIndex + 1}/{steps.length}
              </span>
            </div>
          </aside>

          {/* Main */}
          <main className="bg-gray-50/50 flex flex-col items-center p-8 max-sm:p-5 overflow-y-auto">
            <div className="w-full max-w-4xl mb-4 flex items-center justify-start">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors bg-white border border-slate-200 shadow-sm hover:bg-slate-50 px-3 py-1.5 rounded-full"
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