import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../errors/ApiError";

export const errorHandler: ErrorRequestHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
        });
    }

    console.error("Unhandled Error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return res.status(500).json({
        success: false,
        statusCode: 500,
        message,
    });
};