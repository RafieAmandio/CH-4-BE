import { Request, Response } from "express";
import { LoginInput, RegisterInput, AuthRequest } from "../types";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateToken } from "../utils/token";
import { sendSuccess, sendError } from "../utils/response";
import { generateUserCode } from "../utils/code-generator";
import prisma from "../config/database";

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: RegisterInput = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      sendError(
        res,
        "Registration failed",
        [{ field: "email", message: "Email already in use" }],
        400
      );
      return;
    }

    // Generate a unique code for the user
    const code = generateUserCode();

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name: userData.name,
        password: hashedPassword,
        grade: userData.grade,
        school: userData.school,
        phone: userData.phone,
        email: userData.email,
        major: userData.major,
        interests: userData.interests,
        referral: userData.referral || null,
        code,
      },
    });

    // Generate token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
    });

    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = newUser;

    sendSuccess(
      res,
      "User registered successfully",
      { user: userWithoutPassword, token },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    sendError(
      res,
      "Registration failed",
      [{ field: "server", message: "An error occurred during registration" }],
      500
    );
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginInput = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists and password is correct
    if (!user || !(await verifyPassword(password, user.password))) {
      sendError(
        res,
        "Login failed",
        [{ field: "credentials", message: "Invalid email or password" }],
        401
      );
      return;
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(
      res,
      "Login successful",
      { user: userWithoutPassword, token },
      200
    );
  } catch (error) {
    console.error("Login error:", error);
    sendError(
      res,
      "Login failed",
      [{ field: "server", message: "An error occurred during login" }],
      500
    );
  }
};

/**
 * Get the current user's profile
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      sendError(
        res,
        "Authentication required",
        [{ field: "auth", message: "User not authenticated" }],
        401
      );
      return;
    }

    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user;

    sendSuccess(
      res,
      "Profile retrieved successfully",
      userWithoutPassword,
      200
    );
  } catch (error) {
    console.error("Get profile error:", error);
    sendError(
      res,
      "Failed to retrieve profile",
      [
        {
          field: "server",
          message: "An error occurred while retrieving profile",
        },
      ],
      500
    );
  }
};
