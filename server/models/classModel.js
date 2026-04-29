import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true },
  year: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  section: { type: String, required: true },
  joinCode: { type: String, required: true, unique: true },
  joiningOpen: { type: Boolean, default: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

// Compound index for fast student enrollment lookups
classSchema.index({ students: 1 });

export const Class = mongoose.model("Class", classSchema);
