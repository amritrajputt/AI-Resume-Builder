import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { ApiError } from "../errors/ApiError";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    const auth = getAuth(req);

    if (!auth.isAuthenticated || !auth.userId) {
        return next(ApiError.unauthorized());
    }

    return next();
}