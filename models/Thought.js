import mongoose from "mongoose";

const thoughtSchema = new mongoose.Schema({
  message: {
    required: true,
    type: String,
    minlength: 5,
    maxlength: 140},
  hearts: {
    type: Number,
    default: 0},
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const Thought = mongoose.model("Thought", thoughtSchema)