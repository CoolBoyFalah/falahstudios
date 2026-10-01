import User from "../models/User";
import Client from "../models/Client";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/error-handler";
import { generateToken } from "../middleware/auth";
import { DEMO_CLIENT_CODE, ensureDemoWorkspace } from "./demo";

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
    const normalizedCode = accessCode.trim().toUpperCase().replace(/\s+/g, "");
    const parts = normalizedCode.split("-");

    if (parts.length !== 3 || parts[0] !== "FAL" || !parts[1] || !parts[2] || normalizedCode.length > 64) {
      throw new AppError("Invalid access code", 401);
    }

    const clientCode = parts[1];
    const secret = parts[2];

    // The public demo code also builds or refreshes the demo workspace.
    if (clientCode === DEMO_CLIENT_CODE) await ensureDemoWorkspace();

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
        currency: client.currency,
        isDemo: Boolean(client.isDemo),
      },
      token,
    };
  }

  /** One-click sign-in to the shared demo workspace. */
  async loginToDemo() {
    const client = await ensureDemoWorkspace();
    return {
      client: {
        id: client._id,
        name: client.name,
        slug: client.slug,
        clientCode: client.clientCode,
        currency: client.currency,
        isDemo: true,
      },
      token: generateToken("", "client", client._id.toString()),
    };
  }
}

export default new AuthService();