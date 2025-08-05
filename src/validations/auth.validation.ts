import { body } from "express-validator";
import { isValidReferralCode } from "../utils/code-generator";

export const registerValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .trim(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),

  body("grade")
    .notEmpty()
    .withMessage("Grade is required")
    .isString()
    .withMessage("Grade must be a string")
    .trim(),

  body("school")
    .notEmpty()
    .withMessage("School is required")
    .isString()
    .withMessage("School must be a string")
    .trim(),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isString()
    .withMessage("Phone must be a string")
    .matches(/^\+?[0-9\s-]+$/)
    .withMessage("Invalid phone number format")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("major")
    .notEmpty()
    .withMessage("Major is required")
    .isString()
    .withMessage("Major must be a string")
    .trim(),

  body("interests")
    .isArray()
    .withMessage("Interests must be an array")
    .notEmpty()
    .withMessage("At least one interest is required"),

  body("interests.*")
    .isString()
    .withMessage("Each interest must be a string")
    .trim(),

  body("referral")
    .optional()
    .custom((value) => {
      if (value && !isValidReferralCode(value)) {
        throw new Error("Invalid referral code format");
      }
      return true;
    }),
];

export const loginValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];
