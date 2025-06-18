import crypto from "crypto"
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: 2,
    trim: true,
  },
   email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      },
      message: props => `${props.value} is not a valid email address!`
    }
   },
   password: {
    type: String,
    required: true,
    minlength: 4,
   },
   accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
   }
})

export const User = mongoose.model("User", userSchema)