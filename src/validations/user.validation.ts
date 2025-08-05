import { body, param, query } from "express-validator";

export const getUserValidation = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isString()
    .withMessage("User ID must be a string"),
];

export const updateUserValidation = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isString()
    .withMessage("User ID must be a string"),

  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim(),

  body("grade")
    .optional()
    .isString()
    .withMessage("Grade must be a string")
    .trim(),

  body("school")
    .optional()
    .isString()
    .withMessage("School must be a string")
    .trim(),

  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be a string")
    .matches(/^\+?[0-9\s-]+$/)
    .withMessage("Invalid phone number format")
    .trim(),

  body("major")
    .optional()
    .isString()
    .withMessage("Major must be a string")
    .trim(),

  body("interests")
    .optional()
    .isArray()
    .withMessage("Interests must be an array"),

  body("interests.*")
    .optional()
    .isString()
    .withMessage("Each interest must be a string")
    .trim(),
];

export const deleteUserValidation = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isString()
    .withMessage("User ID must be a string"),
];

export const listUsersValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive number")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
    .trim(),

  query("sortBy")
    .optional()
    .isString()
    .withMessage("Sort by must be a string")
    .isIn(["name", "email", "grade", "school", "createdAt"])
    .withMessage("Invalid sort field")
    .trim(),

  query("sortOrder")
    .optional()
    .isString()
    .withMessage("Sort order must be a string")
    .isIn(["asc", "desc"])
    .withMessage('Sort order must be "asc" or "desc"')
    .trim(),
];
