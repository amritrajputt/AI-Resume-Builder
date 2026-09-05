"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export default function Home() {
  const router = useRouter();

  const [featureCategory, setFeatureCategory] = useState("Resume Section Request");
  const [featureDescription, setFeatureDescription] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [sentFeedback, setSentFeedback] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleGetStarted = () => {
    router.push("/details/personal-details");
  };

  const getMailData = () => {
    const subject = `[Resumio] ${featureCategory}`;
    const body = `Hi Amrit,\n\nI want to submit the following ${featureCategory.toLowerCase()}:\n\nDetails:\n${featureDescription || "(Describe your request here)"}\n\nFrom: ${userEmail || "A Resumio User"}`;
    return { subject, body };
  };

  const handleSendFeatureRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureDescription.trim()) return;

    const { subject, body } = getMailData();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=amrit.createch@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    setSentFeedback(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("amrit.createch@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <main className="site-shell">
      <nav className="topbar">
        <Link className="brand" href="#top">resumio<span>.</span></Link>
        <div className="nav-links" aria-label="Primary navigation">
          <Link className="home-link" href="#top">Home</Link>
          <Link className="templates-link" href="/browse-template">Templates</Link>
          <a className="how-it-works-link" href="#how-it-works">How it works</a>
          <a className="feature-link text-blue-600 dark:text-blue-400 font-medium" href="#feature-request">Feature / Bug Report 💡</a>
        </div>
        <div className="nav-actions">
          <ThemeToggle />
          <Link href="/details/personal-details" className="button button-primary text-xs py-2 px-3.5">
            Get Started ↗
          </Link>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <h1 className="max-w-[560px] text-[clamp(4rem,5vw,7rem)] leading-[0.8] tracking-[-0.07em] text-neutral-900 dark:text-white">
            Stop struggling<br />with resumes.<br />
            <span>Let AI do the</span><br />
            <span>hard part.</span>
          </h1>

          <p className="mb-7 max-w-[540px] text-[1.1rem] leading-8 text-neutral-600 dark:text-neutral-400">
            From wording to formatting, our AI resume builder helps you create a polished resume that stands out in seconds.
          </p>

          <div className="hero-actions">
            <button className="button button-primary" onClick={handleGetStarted}>
              Get started <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="proof-row mt-8 flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="avatars flex -space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d88e5f] text-[10px] font-bold text-white">R</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7d9bc0] text-[10px] font-bold text-white">J</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d6d7d2] text-[10px] font-bold text-neutral-700">A</span>
            </div>
            <span>
              <strong className="font-semibold text-neutral-800 dark:text-neutral-200">Made for job seekers</strong> who want to stand out
            </span>
            <i className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />
            <span className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">✦</span>
              <strong className="font-semibold text-neutral-800 dark:text-neutral-200">Thoughtfully designed</strong>
            </span>
          </div>
        </div>

        <div className="product-stage" aria-label="Resume preview">
          <Image
            src="/resume-preview.webp"
            alt="AI Resume Builder ATS Preview"
            width={860}
            height={820}
            priority
            className="h-auto w-full max-w-[560px] rounded-2xl object-contain drop-shadow-xl transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>
      </section>

      <section className="trusted" id="features">
        <span>Designed for modern<br />job seekers</span>
        <b>Clear</b>
        <b>Focused</b>
        <b>Professional</b>
        <b>Personal</b>
        <b>Effective</b>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">Build your resume in 3 simple steps</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Tell us about you',
              text: 'Add your experience, skills, projects, and education in a guided flow.',
            },
            {
              step: '02',
              title: 'Choose a template',
              text: 'Pick a style that matches your target role and personal brand.',
            },
            {
              step: '03',
              title: 'Generate & refine',
              text: 'Let AI polish your language and export a resume ready to share.',
            },
          ].map((item) => (
            <div key={item.step} className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f0f] p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-full bg-blue-50 dark:bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-neutral-800">
                {item.step}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-neutral-900 dark:text-white">{item.title}</h3>
              <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="feature-request" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-100 dark:border-neutral-800 bg-gradient-to-b from-blue-50/70 via-white to-neutral-50 dark:from-[#0f0f0f] dark:via-[#0a0a0a] dark:to-black p-8 sm:p-12 shadow-sm text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 dark:bg-neutral-900 px-3.5 py-1 text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-4 border border-blue-200 dark:border-neutral-800">
            <span>💡</span> Feature Request &amp; Bug Report
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Request a Feature or Report a Bug
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
            Found an issue, need a specific LaTeX template, or have an idea to improve Resumio? Send me an email directly.
          </p>

          <form onSubmit={handleSendFeatureRequest} className="mt-8 max-w-lg mx-auto space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Type
              </label>
              <select
                value={featureCategory}
                onChange={(e) => setFeatureCategory(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Resume Section Request">📄 Resume Section Request (e.g. Publications, Volunteer, Custom)</option>
                <option value="Feature Request">✨ Feature Request</option>
                <option value="Bug Report">🐛 Bug Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Your Email (Optional, for a response)
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder={
                  featureCategory === "Bug Report"
                    ? "Describe what went wrong and how to reproduce it..."
                    : featureCategory === "Resume Section Request"
                    ? "What section would you like to see added (e.g. Publications, Volunteering, Leadership, Coursework, Certifications)?"
                    : "Describe the feature you'd like to see added..."
                }
                value={featureDescription}
                onChange={(e) => setFeatureDescription(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
              />
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>✉️</span> Send via Gmail
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
                <span>Or mail directly: <strong className="text-neutral-800 dark:text-neutral-200 font-mono">amrit.createch@gmail.com</strong></span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedEmail ? "✓ Copied!" : "📋 Copy Email"}
                </button>
              </div>
            </div>

            {sentFeedback && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold text-center pt-2">
                ✓ Opening your email composer! If it didn&apos;t open, copy the email above.
              </p>
            )}
          </form>
        </div>
      </section>

      <section className="bottom-tease" id="templates">
        <span className="sparkle">✦</span>
        <strong>Build a resume you’re proud of.</strong>
        <span>Fast, clear, and made to get noticed.</span>
      </section>

      <div className="pb-8 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400 flex flex-col items-center gap-2">
        <div>
          Made with love by <span className="font-semibold text-neutral-700 dark:text-neutral-300">Amrit</span>
        </div>
        <div className="text-xs text-neutral-400 dark:text-neutral-500">
          Got ideas or questions?{" "}
          <a
            href="mailto:amrit.createch@gmail.com?subject=Resumio%20Feedback"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            amrit.createch@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
}
