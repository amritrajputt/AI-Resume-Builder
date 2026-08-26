import { Router } from "express";
import { AuthController } from "./auth.controller";
import { requireAuth } from "../../common/middleware.ts/auth.middleware";

export const authRouter = Router();
authRouter.post("/register", requireAuth, AuthController.register);

