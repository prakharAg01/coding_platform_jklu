import mongoose from "mongoose";

const labSchema = new mongoose.Schema({
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  title: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
  deadline: { type: Date },
  isVisible: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Lab = mongoose.model("Lab", labSchema);
