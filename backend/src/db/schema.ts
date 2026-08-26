import { pgTable, text, jsonb, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});




export type CodingProfile = {
    platform: string;
    username: string;
    url: string;
};

export type Experience = {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string[];
};

export type Project = {
    title: string;
    description: string;
    technologies: string[];
    github?: string;
    live?: string;
};

export type Certification = {
    name: string;
    issuer: string;
    date?: string;
    url?: string;
};

export type Achievement = {
    title: string;
    description?: string;
    date?: string;
};

export type Education = {
    institution: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
};

export const resumes = pgTable("resumes", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
        }),

    name: varchar("name", { length: 150 }).notNull(),

    phone: varchar("phone", { length: 20 }),

    email: varchar("email", { length: 255 }),

    linkedin: varchar("linkedin", { length: 500 }),

    github: varchar("github", { length: 500 }),

    portfolio: varchar("portfolio", { length: 500 }),

    codingProfiles: jsonb("coding_profiles")
        .$type<CodingProfile[]>()
        .default([]),

    experience: jsonb("experience")
        .$type<Experience[]>()
        .default([]),

    projects: jsonb("projects")
        .$type<Project[]>()
        .default([]),

    certifications: jsonb("certifications")
        .$type<Certification[]>()
        .default([]),

    achievements: jsonb("achievements")
        .$type<Achievement[]>()
        .default([]),

    education: jsonb("education")
        .$type<Education[]>()
        .default([]),

    skills: jsonb("skills")
        .$type<string[]>()
        .default([]),

    generatedTex: text("generated_tex"),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
});

export const resumesTexFile = pgTable("resumes_tex_file", {
    id: uuid("id").primaryKey().defaultRandom(),

    resumeId: uuid("resume_id")
        .notNull()
        .references(() => resumes.id, {
            onDelete: "cascade",
        }),

    texFile: text("tex_file").notNull(),
});

export const resumesPdfFile = pgTable("resumes_pdf_file", {
    id: uuid("id").primaryKey().defaultRandom(),

    resumeId: uuid("resume_id")
        .notNull()
        .references(() => resumes.id, {
            onDelete: "cascade",
        }),

    pdfFile: text("pdf_file").notNull(),
});