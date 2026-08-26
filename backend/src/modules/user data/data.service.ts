import { db } from "../../index";
import { generationJobs, resumes, resumesPdfFile, resumesTexFile, users } from "../../db/schema";
import { and, eq, sql, type InferInsertModel } from "drizzle-orm";
import { ApiError } from "../../common/errors/ApiError";

type ResumeData = InferInsertModel<typeof resumes>;

export class DataService {
    static async getInternalUserId(clerkId: string) {
        const [user] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId));
        if (!user) throw ApiError.notFound("User profile not found");
        return user.id;
    }

    static async getData(clerkId: string) {
        const userId = await this.getInternalUserId(clerkId);
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

    static async saveData(data: Omit<ResumeData, "userId">, clerkId: string) {
        const userId = await this.getInternalUserId(clerkId);
        const [newResume] = await db
            .insert(resumes)
            .values({ ...data, userId })
            .returning();
        if (!newResume) throw ApiError.internalServerError("Resume could not be saved");
        return newResume;

    }
    static async updateData(id: string, userId: string, data: Partial<ResumeData>) {
        userId = await this.getInternalUserId(userId);
        const [updatedResume] = await db
            .update(resumes)
            .set(data)
            .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
            .returning();
        return updatedResume;
    }

    static async saveTexFile(resumeId: string, userId: string, texFile: string) {
        userId = await this.getInternalUserId(userId);
        const [ownedResume] = await db
            .select({ id: resumes.id })
            .from(resumes)
            .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

        if (!ownedResume) {
            return undefined;
        }

        const [savedTexFile] = await db.insert(resumesTexFile)
            .values({ resumeId, texFile })
            .onConflictDoUpdate({
                target: resumesTexFile.resumeId,
                set: { texFile },
                where: sql`${resumesTexFile.texFile} is distinct from ${texFile}`,
            })
            .returning();

        return savedTexFile;
    }

    static async savePdfFile(resumeId: string, userId: string, pdfFile: string) {
        userId = await this.getInternalUserId(userId);
        const [ownedResume] = await db
            .select({ id: resumes.id })
            .from(resumes)
            .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

        if (!ownedResume) {
            return undefined;
        }

        const [savedPdfFile] = await db.insert(resumesPdfFile)
            .values({ resumeId, pdfFile })
            .onConflictDoUpdate({
                target: resumesPdfFile.resumeId,
                set: { pdfFile },
            })
            .returning();

        return savedPdfFile;
    }

    static async createGenerationJob(resumeId: string, clerkId: string, message: string) {
        const userId = await this.getInternalUserId(clerkId);
        const [resume] = await db.select({ id: resumes.id }).from(resumes)
            .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));
        if (!resume) throw ApiError.notFound("Resume not found");
        const [job] = await db.insert(generationJobs).values({ resumeId, userId, message }).returning();
        if (!job) throw ApiError.internalServerError("Generation job could not be created");
        return job;
    }

    static async updateGenerationJob(id: string, status: string, errorMessage?: string) {
        const [job] = await db.update(generationJobs).set({
            status,
            errorMessage,
            updatedAt: new Date(),
            completedAt: status === "completed" || status === "failed" ? new Date() : undefined,
        }).where(eq(generationJobs.id, id)).returning();
        return job;
    }

    static async getGenerationJob(id: string, clerkId: string) {
        const userId = await this.getInternalUserId(clerkId);
        const [job] = await db.select().from(generationJobs)
            .where(and(eq(generationJobs.id, id), eq(generationJobs.userId, userId)));
        if (!job) throw ApiError.notFound("Generation job not found");
        return job;
    }

    static async getPdfFile(resumeId: string, clerkId: string) {
        const userId = await this.getInternalUserId(clerkId);
        const [file] = await db.select({ pdfFile: resumesPdfFile.pdfFile }).from(resumesPdfFile)
            .innerJoin(resumes, eq(resumesPdfFile.resumeId, resumes.id))
            .where(and(eq(resumesPdfFile.resumeId, resumeId), eq(resumes.userId, userId)));
        if (!file) throw ApiError.notFound("Compiled PDF not found");
        return Buffer.from(file.pdfFile, "base64");
    }
 }