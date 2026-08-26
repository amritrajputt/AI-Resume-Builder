import { db } from "../../index";
import { resumes, resumesPdfFile, resumesTexFile } from "../../db/schema";
import { and, eq, sql, type InferInsertModel } from "drizzle-orm";

type ResumeData = InferInsertModel<typeof resumes>;

export class DataService {
    static async getData(userId: string) {
        const resume = await db
            .select()
            .from(resumes)
            .where(eq(resumes.userId, userId));

        return resume.map((resume) =>
            Object.entries(resume)
                .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                .join("\n")
        );
    }

    static async saveData(data: ResumeData) {
        const [newResume] = await db
            .insert(resumes)
            .values(data)
            .returning();
        return newResume;

    }
    static async updateData(id: string, userId: string, data: Partial<ResumeData>) {
        const [updatedResume] = await db
            .update(resumes)
            .set(data)
            .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
            .returning();
        return updatedResume;
    }

    static async saveTexFile(userId: string, texFile: string) {
        const userResumes = await db
            .select({ id: resumes.id })
            .from(resumes)
            .where(eq(resumes.userId, userId));

        if (userResumes.length === 0) {
            return [];
        }

        return db.insert(resumesTexFile).values(
            userResumes.map(({ id: resumeId }) => ({ resumeId, texFile }))
        ).onConflictDoUpdate({
            target: resumesTexFile.resumeId,
            set: { texFile },
            where: sql`${resumesTexFile.texFile} is distinct from ${texFile}`,
        }).returning();
    }

    static async savePdfFile(userId: string, pdfFile: string) {
        const userResumes = await db
            .select({ id: resumes.id })
            .from(resumes)
            .where(eq(resumes.userId, userId));

        if (userResumes.length === 0) {
            return [];
        }

        return db.insert(resumesPdfFile).values(
            userResumes.map(({ id: resumeId }) => ({ resumeId, pdfFile }))
        ).returning();
    }
 }