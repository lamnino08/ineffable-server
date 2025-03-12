import { Request, Response, NextFunction } from 'express';
import { z } from "zod"

export const boardgameCreateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  BBGLink: z.string().optional()
})

export const boardgameUpdateNameSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

export const boardgameUpdateBGGLinkSchema = z.object({
  BGGLink: z.string().url().min(1, { message: "Link is required" }),
});

export const boardgameUpdateShortcutSchema = z.object({
  shortcut: z.string().min(1, { message: "Shortcut is required" }),
});

export const boardgameUpdateDescriptionSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
});

export const boardgameUpdateImageSchema = z.object({
  url: z.string().min(1, { message: "Image is required" }),
});

export const boardgameUpdateNumberPlayersSchema = z.object({
  minPlayers: z
    .preprocess((value) => Number(value), z.number().min(1, { message: "Minimum players must be at least 1" })),
  maxPlayers: z
    .preprocess((value) => Number(value), z.number().min(1, { message: "Maximum players must be at least 1" })),
})
  .refine(
    (data) => data.maxPlayers >= data.minPlayers,
    {
      message: "Maximum players must be greater than or equal to minimum players",
      path: ["maxPlayers"],
    }
  );

export const boardgameUpdateDurationSchema = z.object({
  min: z
    .preprocess((value) => Number(value), z.number().min(1, { message: "Time play must be at least 1" })),
  max: z
    .preprocess((value) => Number(value), z.number().min(1, { message: "Time play must be at least 1" })),
})
  .refine(
    (data) => data.max >= data.min,
    {
      message: "Maximum time play must be greater than or equal to time play",
      path: ["max"],
    }
  );


export const boardgameUpdateAgeSchema = z.object({
  age: z
    .string()
    .min(1, { message: "Age is required" })
    .regex(/^[0-9]+$/, { message: "Age must be a number" }),
});

export const boardgameUpdateWeightSchema = z.object({
  weight: z
    .string()
    .min(1, { message: "Weight is required" })
    .regex(/^[0-9]+(\.[0-9]{1})?$/, { message: "Weight must be a number (1-5)" })
    .refine(value => parseFloat(value) >= 1 && parseFloat(value) <= 5, {
      message: "Weight must be between 1 and 5",
    }),
});

export const boardgameRuleSchema = z.object({
  title: z.string().min(1, { message: "Rule title is required" }),
  language: z.string().min(1, { message: "Language is required" }),
  link: z.string().min(1, { message: "File is required" }),
  type: z.enum(["file", "link"], { required_error: "Type is required" }),
  description: z.string().optional()
});

export const boardgameVideoTutorialSchema = z.object({
  title: z.string().min(1, { message: "Video title is required." }),
  language: z.string().min(1, { message: "Language is required" }),
  url: z
    .string()
    .url({ message: "A valid URL is required." })
    .regex(
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?[A-Za-z0-9_-]{11}(&.*)?$/,
      { message: "URL must be a valid YouTube video link." }
    ),
  description: z.string().optional(),
});

export const boardgameImageUploadSchema = z.object({
  images: z.array(
    z.object({
      url: z.string().min(1, ({ message: "Url is require" })),
    })
  ),
});

export const boardgameCategorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  img_url: z.string().min(1, { message: "Image is required" }),
  description: z.string().min(1, { message: "Category desciption is required." }),
});

export const boardgameCategoryAddToSchema = z.object({
  categoryId: z.number({ invalid_type_error: "Category IDs must be numbers." })
});

export const boardgameMechanicSchema = z.object({
  name: z.string().min(1, { message: "Mechanic name is required." }),
  img_url: z.string().min(1, { message: "Image is required" }),
  description: z.string().min(1, { message: "Mechanic desciption is required." }),
});

export const validate =
  (schema: z.ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        console.log(error);
        if (error instanceof z.ZodError) {
          res.status(400).json({
            errors: error.errors.map((err) => err.message),
          });
          return;
        }
        console.log(error);

        res.status(500).json({ error: "An unexpected error occurred" });
      }
    };

export const BoardgameRequestSchema = {
  create: { schema: boardgameCreateSchema },
  updateTitle: { schema: boardgameUpdateNameSchema },
  updateBBGLink: { Schema: boardgameUpdateBGGLinkSchema },
  updateShortcut: { schema: boardgameUpdateShortcutSchema },
  updateDescription: { schema: boardgameUpdateDescriptionSchema },
  updateAge: { schema: boardgameUpdateAgeSchema },
  updateWeight: { schema: boardgameUpdateWeightSchema },
  updateNumberPlayers: { schema: boardgameUpdateNumberPlayersSchema },
  updateDuration: { schema: boardgameUpdateDurationSchema },
  uploadAvatar: { schema: boardgameUpdateImageSchema },
  uploadBackground: { schema: boardgameUpdateImageSchema },
  rule: { schema: boardgameRuleSchema },
  video: { schema: boardgameVideoTutorialSchema },
  image: { schema: boardgameImageUploadSchema },
  category: { schema: boardgameCategorySchema },
  mechanic: { schema: boardgameMechanicSchema }
};
