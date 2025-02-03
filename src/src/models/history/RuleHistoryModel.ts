import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for History
interface History {
  action: "create" | "update" | "delete";
  updated_by: number;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  timestamp?: Date;
}

// Define the interface for Rule
export interface RuleDocument extends Document {
  rule_id: number;
  histories: History[];
  createdAt: Date;
  updatedAt: Date;
}

// History schema
const HistorySchema = new Schema<History>(
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

const RuleSchema = new Schema<RuleDocument>(
  {
    rule_id: {
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

const Rule: Model<RuleDocument> = mongoose.model<RuleDocument>("RuleHistory", RuleSchema);

export default Rule;
