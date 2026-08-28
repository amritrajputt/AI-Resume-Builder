"use client";

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
        <a className="brand" href="#top">resumio<span>.</span></a>
        <div className="nav-links" aria-label="Primary navigation">
          <a className="home-link" href="#top">Home</a>
          <a href="#templates">Browse templates</a>
          <a className="how-it-works-link" href="#features">How it works</a>
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
          <h1>Stop struggling with resumes.<br /><em>Let AI do the hard part.</em></h1>
          <p className="mb-2">From wording to formatting, our AI resume builder helps you create a polished resume that stands out in seconds.</p>
          <div className="hero-actions">
            {!isLoaded || isSignedIn ? (
              <button className="button button-primary" onClick={handleGetStarted}>Get started <span aria-hidden="true">↗</span></button>
            ) : (
              <button className="button button-primary" onClick={handleGetStarted}>Get started <span aria-hidden="true">↗</span></button>
            )}
          </div>
          <div className="proof-row">
            <div className="avatars"><span>R</span><span>J</span><span>A</span></div>
            <strong>Made for job seekers</strong> who want to stand out
            <i />
            <span className="proof-icon">✦</span><strong>Thoughtfully designed</strong>
          </div>
        </div>

        <div className="product-stage" aria-label="Resume builder preview">
          <div className="browser-window">
            <div className="browser-bar"><span className="traffic red" /><span className="traffic yellow" /><span className="traffic green" /><div className="address">resumio.ai</div><span>↗</span></div>
            <div className="preview-content">
              <div className="resume-paper">
                <div className="resume-name">Your Name</div>
                <div className="resume-role">Professional Resume</div>
                <div className="resume-line" />
                <div className="resume-columns"><div><small>WORK EXPERIENCE</small><h4>Your next opportunity</h4><p>Present your experience clearly with focused language and polished formatting.</p><p>Make your strengths easier for hiring teams to find.</p></div><div><small>RESUME STATUS</small><div className="score">Ready</div><div className="score-label">Ready to share</div></div></div>
              </div>
              <div className="ai-note"><span>✦</span><div><small>Ask Resumio AI</small><strong>Your experience was strong. The wording works!</strong></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="trusted" id="features"><span>Designed for modern<br />job seekers</span><b>Clear</b><b>Focused</b><b>Professional</b><b>Personal</b><b>Effective</b></section>
      <section className="bottom-tease" id="templates"><span className="sparkle">✦</span><strong>Build a resume you’re proud of.</strong><span>Fast, clear, and made to get noticed.</span></section>
    </main>
  );
}
