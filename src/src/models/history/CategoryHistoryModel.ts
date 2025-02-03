import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for category history events
export interface CategoryHistory {
  action: "create" | "update" | "delete";
  updated_by: number;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  timestamp?: Date;
}

// Define the interface for the category document with history tracking
export interface CategoryDocument extends Document {
  category_id: number;
  histories: CategoryHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// History schema
const CategoryHistorySchema = new Schema<CategoryHistory>(
  {
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    updated_by: {
      type: Number,
      required: true,
    },
    changes: {
      type: Schema.Types.Mixed, // Store changes as a flexible object
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Avoid creating an _id for subdocuments
);

// Main schema for category history
const CategorySchema = new Schema<CategoryDocument>(
  {
    category_id: {
      type: Number,
      required: true,
      unique: true,
    },
    histories: {
      type: [CategoryHistorySchema], // Array of history events
      default: [],
    },
  },
  { timestamps: true }
);

// Create and export the model
export const CategoryHistoryModel: Model<CategoryDocument> = mongoose.model<CategoryDocument>(
  "CategoryHistory",
  CategorySchema
);
