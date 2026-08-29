import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../common/responses/ApiResponses";
import { ApiError } from "../../common/errors/ApiError";
import { getAuth } from "@clerk/express";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().optional(),
    email: z.string().email("Valid email is required"),
});

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const auth = getAuth(req);
            const clerkId = auth.userId;

            if (!clerkId) {
                throw ApiError.unauthorized("Authentication token or user ID missing");
            }

            const { name, email } = registerSchema.parse(req.body);
            const userName = name?.trim() || "Unnamed user";

            const newUser = await AuthService.registerService({ clerkId, name: userName, email });
            const response = ApiResponse.created(newUser, "User registered successfully");
            return res.status(response.statusCode).json(response);
        } catch (err) {
            next(err);
        }
    }
}