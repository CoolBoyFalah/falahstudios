import { Request, Response } from "express";
import { asyncHandler, AppError } from "../utils/error-handler";
import AuthService from "../services/AuthService";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new AppError(
        "Email, password, and name are required",
        400
      );
    }

    const result = await AuthService.registerUser(
      email,
      password,
      name
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        "Email and password are required",
        400
      );
    }

    const result = await AuthService.loginUser(
      email,
      password
    );

    res.json({
      success: true,
      data: result,
    });
  });

  static access = asyncHandler(async (req: Request, res: Response) => {
    const { accessCode } = req.body;

    if (!accessCode) {
      throw new AppError("Access code is required", 400);
    }

    const result = await AuthService.loginWithAccessCode(
      accessCode
    );

    res.json({
      success: true,
      data: result,
    });
  });
}

export default AuthController;