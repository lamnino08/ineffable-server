import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for the history of a video
export interface BoardgameVideoHistory {
  action: "create" | "update" | "delete";
  updated_by: number;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  timestamp?: Date;
}

// Define the interface for the video document
export interface BoardgameVideoDocument extends Document {
  video_id: number;
  histories: BoardgameVideoHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// History schema
const HistorySchema = new Schema<BoardgameVideoHistory>(
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
      type: Schema.Types.Mixed, // Mixed type allows flexible structure for changes
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Prevent automatic creation of _id for embedded documents
);

// Main schema for boardgame videos
const BoardgameVideoSchema = new Schema<BoardgameVideoDocument>(
  {
    video_id: {
      type: Number,
      required: true,
      unique: true,
    },
    histories: {
      type: [HistorySchema], // Array of embedded history documents
      default: [],
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create and export the model
export const BoardgameVideo: Model<BoardgameVideoDocument> = mongoose.model<BoardgameVideoDocument>(
  "BoardgameVideo",
  BoardgameVideoSchema
);
