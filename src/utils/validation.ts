import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sendError } from "./response";
import { Error } from "../types";

/**
 * Middleware to validate request data
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const validationErrors: Error[] = errors.array().map((error: any) => ({
    field: error.path,
    message: error.msg,
  }));

  sendError(res, "Validation Error", validationErrors, 400);
};
