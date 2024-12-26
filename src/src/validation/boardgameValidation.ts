import { Request, Response, NextFunction } from 'express';
import { z } from "zod"

export const boardgameCreateSchema = z.object({
    name: z.string().min(1, { message: "Name is required"}),
    BBGLink: z.string().url({ message: "Invalid Url "}).optional()
})

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
