import mongoose from "mongoose";

// Generic atomic-increment counter, used to mint sequential, human-friendly
// professional IDs (e.g. profileCode) without race conditions across
// concurrent signups.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 100000 },
});

export default mongoose.model("Counter", counterSchema);
