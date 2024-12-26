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
 } from '@/utils/auth'

// Handle user sign-up
export const handleSignUp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, username } = req.body;

    if (await isEmailRegistered(email)) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    if (await isUsernameRegistered(username)) {
      return res.status(400).json({ message: "Username is already taken." });
    }
    const email_hash = hashEmail(email);
    const password_hash = await hashPassword(password);

    await createUser({ email_hash, password_hash, username });

    await markEmailAsRegistered(email);
    await markUsernameAsRegistered(username);

    return res.status(201).json({ message: 'Sign-up successful. Please log in to continue' });
  } catch (error) {
    console.log("[Signup]", error);
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Handle user login
export const handleLogin = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("LOGIN REQUEST");
    const { email, password } = req.body;

    if (!(await isEmailRegistered(email))) {
      return res.status(400).json({ message: "Email is not registered." });
    }

    const emailHash = hashEmail(email);
    const user = await getUserByEmail(emailHash);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h',
    });

    return res.json({
      token,
      email: email,
      username: user.username,
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
      return res.status(400).json({ error: "Token is required." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number; role: string };

    // Fetch the user by ID from the token
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return user information
    return res.status(200).json({
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("[Validate Token]", error);

    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
