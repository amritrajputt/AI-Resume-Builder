import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../common/responses/ApiResponses";
import { getAuth } from "@clerk/express";

type AuthUserData = {
    email_addresses?: Array<{ email_address?: string }>;
    first_name?: string;
    last_name?: string;
    email?: string;
};

type AuthWebhookBody = {
    name?: string;
    email?: string;
};

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = (req.body ?? {}) as AuthWebhookBody;
            const auth = getAuth(req);
            const clerkId = auth.userId;
            const email = payload.email;
            const name = payload.name?.trim() || "Unnamed user";

            if (!email || !clerkId) {
                return res.status(400).json({ success: false, message: "Name and email are required" });
            }

            const newUser = await AuthService.registerService({ clerkId, name, email });
            const response = ApiResponse.created(newUser, "User registered successfully");
            return res.status(response.statusCode).json(response);
        } catch (err) {
            next(err);
        }
    }
}