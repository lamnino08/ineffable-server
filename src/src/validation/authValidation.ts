import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Validation schema for sign-up
export const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
});

// Validation schema for login
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// Validation middleware function
export const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body); 
      next(); 
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          errors: error.errors.map((err) => err.message),
        });
        return; 
      }

      res.status(500).json({ error: "An unexpected error occurred" });
    }
  };
