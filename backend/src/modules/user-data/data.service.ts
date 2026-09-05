import { db } from "../../db/client";
import { generationJobs, resumes, resumesPdfFile, resumesTexFile, users } from "../../db/schema";
import { and, eq, sql, type InferInsertModel } from "drizzle-orm";
import { ApiError } from "../../common/errors/ApiError";

type ResumeData = InferInsertModel<typeof resumes>;

export class DataService {
    static async getInternalUserId(userIdentifier?: string) {
        const idKey = userIdentifier?.trim() ? `ip:${userIdentifier.trim()}` : "ip:default";
        const email = `${idKey.replace(/[^a-zA-Z0-9]/g, "_")}@anonymous.local`;

        const [existing] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, idKey));

        if (existing) {
            return existing.id;
        }

        const [newUser] = await db
            .insert(users)
            .values({
                clerkId: idKey,
                name: "Guest User",
                email,
            })
            .onConflictDoNothing()
            .returning({ id: users.id });

        if (newUser) {
            return newUser.id;
        }

        const [found] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, idKey));

        if (!found) {
            throw ApiError.internalServerError("Could not initialize guest profile");
        }

        return found.id;
    }

    static async getData(clerkId: string) {
        const userId = await this.getInternalUserId(clerkId);
        const resumeList = await db
            .select()
            .from(resumes)
            .where(eq(resumes.userId, userId))
            .orderBy(sql`${resumes.updatedAt} DESC`);

        return resumeList;
    }

    static async getFormattedResumeForAI(clerkId: string, resumeId?: string) {
        const userId = await this.getInternalUserId(clerkId);
        const resumeList = await db
            .select()
            .from(resumes)
            .where(
                resumeId
                    ? and(eq(resumes.id, resumeId), eq(resumes.userId, userId))
                    : eq(resumes.userId, userId)
            )
            .orderBy(sql`${resumes.updatedAt} DESC`);

        if (resumeList.length === 0 || !resumeList[0]) {
            throw ApiError.notFound("No resume data found for this user. Please complete your profile details first.");
        }

        const targetResume = resumeList[0];

        const cleanData = {
            personalInfo: {
                name: targetResume.name,
                email: targetResume.email || null,
                phone: targetResume.phone || null,
                linkedin: targetResume.linkedin || null,
                github: targetResume.github || null,
                portfolio: targetResume.portfolio || null,
            },
            codingProfiles: targetResume.codingProfiles || [],
            skills: targetResume.skills || [],
            education: targetResume.education || [],
            experience: targetResume.experience || [],
            projects: targetResume.projects || [],
            certifications: targetResume.certifications || [],
            achievements: targetResume.achievements || [],
        };

        return [
            JSON.stringify(cleanData, null, 2)
        ];
    }

    static async saveData(data: Omit<ResumeData, "userId">, clerkId: string) {
        const userId = await this.getInternalUserId(clerkId);
        const [existing] = await db
            .select({ id: resumes.id })
            .from(resumes)
            .where(eq(resumes.userId, userId))
            .orderBy(sql`${resumes.updatedAt} DESC`);

        if (existing) {
            const [updatedResume] = await db
                .update(resumes)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(resumes.id, existing.id))
                .returning();
            return updatedResume;
        }

        const [newResume] = await db
            .insert(resumes)
            .values({ ...data, userId })
            .returning();
        if (!newResume) throw ApiError.internalServerError("Resume could not be saved");
        return newResume;
    }
    static async updateData(id: string, clerkId: string, data: Partial<ResumeData>) {
        const userId = await this.getInternalUserId(clerkId);
        const [updatedResume] = await db
            .update(resumes)
            .set(data)
            .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
            .returning();
        return updatedResume;
    }

    static async saveTexFile(resumeId: string, clerkId: string, texFile: string) {
        const userId = await this.getInternalUserId(clerkId);
        const [ownedResume] = await db
            .select({ id: resumes.id })
            .from(resumes)
            .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

        if (!ownedResume) {
            return undefined;
        }

        const [existing] = await db
            .select({ id: resumesTexFile.id })
            .from(resumesTexFile)
            .where(eq(resumesTexFile.resumeId, resumeId));

        if (existing) {
            const [updatedTexFile] = await db
                .update(resumesTexFile)
                .set({ texFile })
                .where(eq(resumesTexFile.resumeId, resumeId))
                .returning();
            return updatedTexFile;
        }

        const [savedTexFile] = await db
            .insert(resumesTexFile)
            .values({ resumeId, texFile })
            .returning();

        return savedTexFile;
    }

    static async savePdfFile(resumeId: string, clerkId: string, pdfFile: string) {
        const userId = await this.getInternalUserId(clerkId);
        const [ownedResume] = await db
            .select({ id: resumes.id })
            .from(resumes)
            .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

        if (!ownedResume) {
            return undefined;
        }

        const [existing] = await db
            .select({ id: resumesPdfFile.id })
            .from(resumesPdfFile)
            .where(eq(resumesPdfFile.resumeId, resumeId));

        if (existing) {
            const [updatedPdfFile] = await db
                .update(resumesPdfFile)
                .set({ pdfFile })
                .where(eq(resumesPdfFile.resumeId, resumeId))
                .returning();
            return updatedPdfFile;
        }

        const [savedPdfFile] = await db
            .insert(resumesPdfFile)
            .values({ resumeId, pdfFile })
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