import mongoose from "mongoose"
import crypto from "crypto"

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: 2,
  },
   email: {
    type: String,
    unique: true,
   },
   password: {
    type: String,
    required: true,
   },
   accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
   }
})

export const User = mongoose.model("User", userSchema)