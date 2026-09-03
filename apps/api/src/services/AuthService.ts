import User from "../models/User";
import { AppError } from "../utils/error-handler";
import { generateToken } from "../middleware/auth";

export class AuthService {
  async registerUser(email: string, password: string, name: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    const user = new User({
      email,
      password,
      name,
    });

    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async loginUser(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken(user._id.toString(), user.role);

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }
}

export default new AuthService();
