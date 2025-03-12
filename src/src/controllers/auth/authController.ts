import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser, getUserById } from '@/models/userModel';
import {
  isEmailRegistered,
  hashEmail,
  hashPassword,
  markEmailAsRegistered,
  isUsernameRegistered,
  markUsernameAsRegistered
} from '@/services/redis/auth'
import { date } from 'zod';
// Handle user sign-up
export const handleSignUp = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("SIGNUP REQUEST");
    const { email, password, username } = req.body;

    if (await isEmailRegistered(email)) {
      return res.status(400).json({ message: req.t("auth.sign-up.email-exist") });
    }

    if (await isUsernameRegistered(username)) {
      return res.status(400).json({ message: req.t("auth.sign-up.username-exist") });
    }
    const email_hash = hashEmail(email);
    const password_hash = await hashPassword(password);

    await createUser({ email_hash, password_hash, username });

    await markEmailAsRegistered(email);
    await markUsernameAsRegistered(username);

    return res.status(201).json({ message: req.t("auth.sign-up.success") });
  } catch (error) {
    console.log("[Signup]", error);
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Handle user login
export const handleLogin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!(await isEmailRegistered(email))) {
      return res.status(400).json({ message: req.t("auth.sign-in.email-not-registed") });
    }

    const emailHash = hashEmail(email);
    const user = await getUserByEmail(emailHash);
    if (!user) {
      return res.status(401).json({ message: req.t("auth.sign-in.user-not-found") });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: req.t("auth.sign-in.invalid-credentical") });
    }

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '24h',
    });

    return res.json({
      data: {
        token,
        email: email,
        username: user.username,
        role: user.role,
      }
    });
  } catch (error) {
    console.log("[Login]", error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const validateToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(200).json({
        success: true,
        message: "Token require.",
        data: {
          id: 0,
          username: null,
          role: null,
          isAuthenticated: false,
        }
      });

    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "User not found.",
        data: {
          id: 0,
          username: null,
          role: null,
          isAuthenticated: false,
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid.",
      data: {
        id: user.user_id,
        username: user.username,
        role: user.role,
        isAuthenticated: true,
      }
    });
  } catch (error) {
    console.error("[Validate Token]", error);

    return res.status(200).json({
      success: true,
      message: "Invalid or expired token.",
      data: {
        id: 0,
        username: null,
        role: null,
        isAuthenticated: false,
      }
    });
  }
};
