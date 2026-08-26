import { db } from "../../index";
import { resumes } from "../../db/schema";
import { and, eq, type InferInsertModel } from "drizzle-orm";

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
 }