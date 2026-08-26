import { db } from "../../index";
import { resumes } from "../../db/schema";
import { eq, type InferInsertModel } from "drizzle-orm";

type ResumeData = InferInsertModel<typeof resumes>;

export class DataService {
    static async saveData(data: ResumeData) {
        const [newResume] = await db
            .insert(resumes)
            .values(data)
            .returning();
        return newResume;

    }
    static async updateData(id: string, data: Partial<ResumeData>) {
        const [updatedResume] = await db
            .update(resumes)
            .set(data)
            .where(eq(resumes.id, id))
            .returning();
        return updatedResume;
    }
 }