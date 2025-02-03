import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for the history of a boardgame
export interface BoardgameHistory {
  action: "create" | "update" | "delete";
  updated_by: number;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  timestamp?: Date;
}

// Define the interface for the boardgame document
export interface BoardgameDocument extends Document {
  boardgame_id: number;
  histories: BoardgameHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// History schema
const HistorySchema = new Schema<BoardgameHistory>(
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
      type: Schema.Types.Mixed, 
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } 
);

// Main schema for boardgames
const BoardgameSchema = new Schema<BoardgameDocument>(
  {
    boardgame_id: {
      type: Number,
      required: true,
      unique: true,
    },
    histories: {
      type: [HistorySchema], 
      default: [],
    },
  },
  { timestamps: true }
);

// Create and export the model
export const Boardgame: Model<BoardgameDocument> = mongoose.model<BoardgameDocument>(
  "BoardgameHistory",
  BoardgameSchema
);
