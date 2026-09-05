"use client";

import { createContext, startTransition, useContext, useEffect, useState } from "react";

export type DegreeType = "B.Tech" | "M.Tech" | "12th" | string;

export type EducationItem = {
  degree: string;
  institution: string;
  year: string;
  cgpa: string;
};

export type ExperienceItem = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  currentlyWorking?: boolean;
  location?: string;
  description: string;
};

export type ProjectItem = {
  title: string;
  description: string;
  technologies: string[];
  github?: string;
  live?: string;
};

export type CodingProfileItem = {
  platform: string;
  username: string;
  url: string;
};

export type AchievementItem = {
  title: string;
  description?: string;
  date?: string;
};

export type ResumeDraft = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  skills: string[];
  codingProfiles: CodingProfileItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: unknown[];
  achievements: AchievementItem[];
  education: EducationItem[];
};

const emptyDraft: ResumeDraft = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  portfolio: "",
  skills: [],
  codingProfiles: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
  education: [
    {
      degree: "B.Tech",
      institution: "",
      year: "",
      cgpa: "",
    },
  ],
};

const storageKey = "resumio-resume-draft";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

const ResumeDraftContext = createContext<{
  draft: ResumeDraft;
  updateDraft: (changes: Partial<ResumeDraft>) => void;
  saveResume: () => Promise<Response>;
} | null>(null);

export function ResumeDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<ResumeDraft>(emptyDraft);

  useEffect(() => {
    const savedDraft = window.sessionStorage.getItem(storageKey);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft) as Partial<ResumeDraft>;
        const sanitizedEducation =
          Array.isArray(parsedDraft.education) && parsedDraft.education.length > 0
            ? parsedDraft.education
            : emptyDraft.education;

        const sanitizedExperience: ExperienceItem[] = Array.isArray(parsedDraft.experience)
          ? parsedDraft.experience.map((exp: any) => ({
              ...exp,
              description: Array.isArray(exp?.description)
                ? exp.description.filter(Boolean).join("\n")
                : typeof exp?.description === "string"
                ? exp.description
                : "",
            }))
          : [];

        startTransition(() =>
          setDraft({
            ...emptyDraft,
            ...parsedDraft,
            education: sanitizedEducation,
            experience: sanitizedExperience,
            projects: Array.isArray(parsedDraft.projects) ? parsedDraft.projects : [],
            skills: Array.isArray(parsedDraft.skills) ? parsedDraft.skills : [],
            codingProfiles: Array.isArray(parsedDraft.codingProfiles) ? parsedDraft.codingProfiles : [],
            achievements: Array.isArray(parsedDraft.achievements) ? parsedDraft.achievements : [],
          })
        );
      } catch {
        window.sessionStorage.removeItem(storageKey);
      }
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft]);

  const updateDraft = (changes: Partial<ResumeDraft>) => {
    setDraft((currentDraft) => ({ ...currentDraft, ...changes }));
  };

  const saveResume = async () => {
    const payload = {
      ...draft,
      phone: draft.phone || undefined,
      linkedin: draft.linkedin || undefined,
      github: draft.github || undefined,
      portfolio: draft.portfolio || undefined,
      education: draft.education.filter(
        (e) => e.degree.trim() || e.institution.trim()
      ),
      projects: draft.projects.filter(
        (p) => p.title.trim() || p.description.trim() || (p.technologies && p.technologies.length > 0)
      ),
      experience: draft.experience.filter(
        (exp) => exp.company.trim() || exp.role.trim() || exp.description.trim()
      ),
      codingProfiles: draft.codingProfiles.filter(
        (cp) => cp.platform.trim() || cp.url.trim()
      ),
      achievements: draft.achievements.filter(
        (ach) => ach.title.trim()
      ),
    };

    return fetch(`${backendUrl}/data/savedetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  };

  return (
    <ResumeDraftContext.Provider value={{ draft, updateDraft, saveResume }}>
      {children}
    </ResumeDraftContext.Provider>
  );
}

export function useResumeDraft() {
  const context = useContext(ResumeDraftContext);
  if (!context) {
    throw new Error("useResumeDraft must be used inside ResumeDraftProvider");
  }
  return context;
}
