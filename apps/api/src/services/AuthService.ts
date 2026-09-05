import User from "../models/User";
import Client from "../models/Client";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/error-handler";
import { generateToken } from "../middleware/auth";

export class AuthService {
  async registerUser(
    email: string,
    password: string,
    name: string,
    clientId?: string
  ) {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    const user = new User({
      email,
      password,
      name,
      clientId,
    });

    await user.save();

    const token = generateToken(
      user._id.toString(),
      user.role,
      clientId
    );

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId,
      },
      token,
    };
  }

  async loginUser(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isActive) {
      throw new AppError("Account is inactive", 403);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken(
      user._id.toString(),
      user.role,
      user.clientId?.toString()
    );

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId,
      },
      token,
    };
  }

  async loginWithAccessCode(accessCode: string) {
    const normalizedCode = accessCode.trim().toUpperCase();
    const parts = normalizedCode.split("-");

    if (parts.length !== 3 || parts[0] !== "FAL") {
      throw new AppError("Invalid access code", 401);
    }

    const clientCode = parts[1];
    const secret = parts[2];

    const client = await Client.findOne({
      clientCode,
      isActive: true,
    }).select("+accessCodeHash");

    if (!client) {
      throw new AppError("Invalid access code", 401);
    }

    const isValid = await bcrypt.compare(
      secret,
      client.accessCodeHash
    );

    if (!isValid) {
      throw new AppError("Invalid access code", 401);
    }

    const token = generateToken(
      "",
      "client",
      client._id.toString()
    );

    return {
      client: {
        id: client._id,
        name: client.name,
        slug: client.slug,
        clientCode: client.clientCode,
      },
      token,
    };
  }
}

export default new AuthService();