import type { Request, Response, NextFunction } from "express";
import { resumeSchema } from "./zodSchema";
import { ApiResponse } from "../../common/responses/ApiResponses";
import { ApiError } from "../../common/errors/ApiError";
import { DataService } from "./data.service";
import { clerkMiddleware, getAuth } from '@clerk/express'
export class DataController {
    static async saveData(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = resumeSchema.parse(req.body);
            const auth = getAuth(req)
            if (!auth.isAuthenticated) {
                ApiError.unauthorized("Unauthorized");
                return
            }
            const savedResume = await DataService.saveData({ ...validatedData, userId: auth.userId });
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
            const validatedData = resumeSchema.partial().parse(req.body);
            const updatedResume = await DataService.updateData(resumeId, validatedData);
            const response = ApiResponse.ok(updatedResume, "Data updated successfully");
            return res.status(response.statusCode).json(response);
        } catch (err) {
            next(err);
        }
    }
}