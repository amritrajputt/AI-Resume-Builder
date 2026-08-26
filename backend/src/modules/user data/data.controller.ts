import type { Request, Response, NextFunction } from "express";
import { resumeSchema } from "./zodSchema";
import { ApiResponse } from "../../common/responses/ApiResponses";
import { ApiError } from "../../common/errors/ApiError";
import { DataService } from "./data.service";
import { getAuth } from "@clerk/express";
import { inngest } from "../../inngest/client";
import * as z from "zod";
export class DataController {
    static async getData(req: Request, res: Response, next: NextFunction) {
        try {
            const auth = getAuth(req);
            if (!auth.isAuthenticated || !auth.userId) {
                throw ApiError.unauthorized();
            }

            const data = await DataService.getData(auth.userId);
            const response = ApiResponse.ok(data, "Data retrieved successfully");
            return res.status(response.statusCode).json(response);
        } catch (err) {
            next(err);
        }
    }

    static async saveData(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = resumeSchema.parse(req.body);
            const auth = getAuth(req);
            if (!auth.isAuthenticated || !auth.userId) {
                throw ApiError.unauthorized();
            }
            const savedResume = await DataService.saveData(validatedData, auth.userId);
            const response = ApiResponse.created(savedResume, "Data saved successfully");
            return res.status(response.statusCode).json(response);
        } catch (err) {
            next(err);
        }
    }

    static async updateData(req: Request, res: Response, next: NextFunction) {
        try {
            const resumeId = req.params.id;
            if (typeof resumeId !== "string") {
                throw ApiError.badRequest("A valid resume id is required");
            }
            const auth = getAuth(req);
            if (!auth.isAuthenticated || !auth.userId) {
                throw ApiError.unauthorized();
            }
            const validatedData = resumeSchema.partial().parse(req.body);
            const updatedResume = await DataService.updateData(resumeId, auth.userId, validatedData);
            if (!updatedResume) {
                throw ApiError.notFound("Resume not found");
            }
            const response = ApiResponse.ok(updatedResume, "Data updated successfully");
            return res.status(response.statusCode).json(response);
        } catch (err) {
            next(err);
        }
    }

    static async generate(req: Request, res: Response, next: NextFunction) {
        try {
            const auth = getAuth(req);
            if (!auth.isAuthenticated || !auth.userId) throw ApiError.unauthorized();
            const resumeId = z.string().uuid().parse(req.body.resumeId);
            const message = z.string().min(1).max(4000).parse(req.body.message);
            const job = await DataService.createGenerationJob(resumeId, auth.userId, message);
            await inngest.send({ name: "app/texcode", data: { jobId: job.id, resumeId, userId: auth.userId, message } });
            return res.status(202).json(ApiResponse.accepted({ jobId: job.id, status: job.status }, "Resume generation queued"));
        } catch (err) { next(err); }
    }

    static async getGenerationStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const auth = getAuth(req);
            if (!auth.isAuthenticated || !auth.userId) throw ApiError.unauthorized();
            if (typeof req.params.id !== "string") throw ApiError.badRequest("A valid generation id is required");
            const job = await DataService.getGenerationJob(req.params.id, auth.userId);
            return res.json(ApiResponse.ok(job, "Generation status retrieved"));
        } catch (err) { next(err); }
    }

    static async getPdf(req: Request, res: Response, next: NextFunction) {
        try {
            const auth = getAuth(req);
            if (!auth.isAuthenticated || !auth.userId) throw ApiError.unauthorized();
            if (typeof req.params.id !== "string") throw ApiError.badRequest("A valid resume id is required");
            const pdf = await DataService.getPdfFile(req.params.id, auth.userId);
            res.type("application/pdf").send(pdf);
        } catch (err) { next(err); }
    }
}