"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn, openSignUp } = useClerk();
const router = useRouter();
const handleGetStarted = () => {
  if (!isLoaded) return;
  if (!isSignedIn) {
    openSignIn();
  } else {
    router.push("/details/personal-details");
  }
}

  return (
    <main className="site-shell">
      <nav className="topbar">
        <Link className="brand" href="#top">resumio<span>.</span></Link>
        <div className="nav-links" aria-label="Primary navigation">
          <Link className="home-link" href="#top">Home</Link>
          <Link className="templates-link" href="/browse-template">Templates</Link>
          <a className="how-it-works-link" href="#how-it-works">How it works</a>
        </div>
        <div className="nav-actions">
          {isSignedIn && <UserButton />}
          {isLoaded && !isSignedIn && (
            <button onClick={() => openSignIn()} className="text-button">Sign in</button>
          )}
          
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <h1 className="max-w-[560px] text-[clamp(4rem,5vw,7rem)] leading-[0.8] tracking-[-0.07em] text-slate-900">
            Stop struggling<br />with resumes.<br />
            <span className="text-slate-900">Let AI do the</span><br />
            <span className="text-slate-900">hard part.</span>
          </h1>

          <p className="mb-7 max-w-[540px] text-[1.1rem] leading-8 text-slate-600">
            From wording to formatting, our AI resume builder helps you create a polished resume that stands out in seconds.
          </p>

          <div className="hero-actions">
            <button className="button button-primary" onClick={handleGetStarted}>
              Get started <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="proof-row mt-8 flex items-center gap-4 text-sm text-slate-600">
            <div className="avatars flex -space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d88e5f] text-[10px] font-bold text-white">R</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7d9bc0] text-[10px] font-bold text-white">J</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d6d7d2] text-[10px] font-bold text-slate-700">A</span>
            </div>
            <span className="text-slate-600">
              <strong className="font-semibold text-slate-800">Made for job seekers</strong> who want to stand out
            </span>
            <i className="h-6 w-px bg-slate-200" />
            <span className="flex items-center gap-2 text-slate-600">
              <span className="text-blue-600">✦</span>
              <strong className="font-semibold text-slate-800">Thoughtfully designed</strong>
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
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Build your resume in 3 simple steps</h2>
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
            <div key={item.step} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                {item.step}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bottom-tease" id="templates"><span className="sparkle">✦</span><strong>Build a resume you’re proud of.</strong><span>Fast, clear, and made to get noticed.</span></section>

      <div className="pb-8 text-center text-sm font-medium text-slate-500">
        Made with love by <span className="font-semibold text-slate-700">Amrit</span>
      </div>
    </main>
  );
}
