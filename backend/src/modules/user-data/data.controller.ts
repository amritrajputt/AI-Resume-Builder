import type { Request, Response, NextFunction } from "express";
import { resumeSchema } from "./zodSchema";
import { ApiResponse } from "../../common/responses/ApiResponses";
import { ApiError } from "../../common/errors/ApiError";
import { DataService } from "./data.service";
import { inngest } from "../../inngest/client";
import * as z from "zod";

function getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.trim().length > 0) {
        const first = forwarded.split(",")[0];
        if (first) return first.trim();
    }
    return (
        req.ip ||
        req.socket.remoteAddress ||
        (req.connection as { remoteAddress?: string } | undefined)?.remoteAddress ||
        "127.0.0.1"
    );
}

export class DataController {
    

    static async getData(req: Request, res: Response, next: NextFunction) {
        try {
            const clientIp = getClientIp(req);
            const data = await DataService.getData(clientIp);
            const response = ApiResponse.ok(data, "Data retrieved successfully");
            return res.status(response.statusCode).json(response);
        } catch (err) {
            next(err);
        }
    }

    static async saveData(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = resumeSchema.parse(req.body);
            const clientIp = getClientIp(req);
            const savedResume = await DataService.saveData(validatedData, clientIp);
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
            const clientIp = getClientIp(req);
            const validatedData = resumeSchema.partial().parse(req.body);
            const updatedResume = await DataService.updateData(resumeId, clientIp, validatedData);
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
            const clientIp = getClientIp(req);
            const resumeId = z.string().uuid().parse(req.body.resumeId);
            const message = z.string().min(1).max(4000).parse(req.body.message);
            const job = await DataService.createGenerationJob(resumeId, clientIp, message);
            await inngest.send({ name: "app/texcode", data: { jobId: job.id, resumeId, userId: clientIp, message } });
            return res.status(202).json(ApiResponse.accepted({ jobId: job.id, status: job.status }, "Resume generation queued"));
        } catch (err) { next(err); }
    }

    static async getGenerationStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const clientIp = getClientIp(req);
            if (typeof req.params.id !== "string") throw ApiError.badRequest("A valid generation id is required");
            const job = await DataService.getGenerationJob(req.params.id, clientIp);
            return res.json(ApiResponse.ok(job, "Generation status retrieved"));
        } catch (err) { next(err); }
    }

    static async getPdf(req: Request, res: Response, next: NextFunction) {
        try {
            const clientIp = getClientIp(req);
            if (typeof req.params.id !== "string") throw ApiError.badRequest("A valid resume id is required");
            const pdf = await DataService.getPdfFile(req.params.id, clientIp);
            res.type("application/pdf").send(pdf);
        } catch (err) { next(err); }
    }
}