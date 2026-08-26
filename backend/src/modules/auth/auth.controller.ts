import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../common/responses/ApiResponses";

type AuthUserData = {
    id?: string;
    email_addresses?: Array<{ email_address?: string }>;
    first_name?: string;
    last_name?: string;
    email?: string;
};

type AuthWebhookBody = {
    type?: string;
    data?: AuthUserData;
    email?: string;
    first_name?: string;
    last_name?: string;
};

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = (req.body ?? {}) as AuthWebhookBody;
            const eventType = payload.type;
            const data: AuthUserData = payload.data ?? payload;

            if (eventType && eventType !== "user.created") {
                return res.status(200).json({
                    success: true,
                    message: `Event '${eventType}' received and acknowledged`,
                });
            }

            const email = data.email_addresses?.[0]?.email_address ?? data.email;
            const clerkId = data.id;
            const name = [data.first_name, data.last_name]
                .filter(Boolean)
                .join(" ") || "Unnamed user";

            if (!email || !clerkId) {
                console.warn("No email found in webhook payload");
                return res.status(200).json({
                    success: true,
                    message: "Webhook payload acknowledged, no user email present",
                });
            }

            const newUser = await AuthService.registerService({ clerkId, name, email });
            const response = ApiResponse.created(newUser, "User registered successfully");
            return res.status(response.statusCode).json(response);
        } catch (err) {
            next(err);
        }
    }
}