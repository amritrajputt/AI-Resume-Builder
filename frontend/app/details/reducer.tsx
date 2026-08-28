"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type {
  EducationItem,
  ExperienceItem,
  ProjectItem,
  CodingProfileItem,
  AchievementItem,
} from "./resume-draft";

type ResumeData = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  skills: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  codingProfiles: CodingProfileItem[];
  certifications: unknown[];
  achievements: AchievementItem[];
};

const initialState: ResumeData = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  portfolio: "",
  skills: [],
  experience: [],
  projects: [],
  education: [
    {
      degree: "B.Tech",
      institution: "",
      year: "",
      cgpa: "",
    },
  ],
  codingProfiles: [],
  certifications: [],
  achievements: [],
};

type Action =
  | {
      type: "UPDATE_FIELD";
      field: keyof ResumeData;
      value: ResumeData[keyof ResumeData];
    }
  | {
      type: "RESET";
    };

function resumeReducer(state: ResumeData, action: Action): ResumeData {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

const ResumeContext = createContext<{
  resume: ResumeData;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, dispatch] = useReducer(resumeReducer, initialState);

  return (
    <ResumeContext.Provider value={{ resume, dispatch }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);

  if (!context) {
    throw new Error("useResume must be used inside ResumeProvider");
  }

  return context;
}