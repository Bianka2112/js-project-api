import { Router } from "express"

import { Thought } from "../models/Thought"
import { authenticateUser } from "./authRouter"

const usersRouter = Router()

// GET USER DETAILS
usersRouter.get("/me", authenticateUser, async (req, res) => {
  const user = req.user
  res.json({
    success: true,
    user: {
      username: user.username,
      email: user.email,
      id: user.id
    }
  })
})

// GET USER THOUGHTS
usersRouter.get("/my-thoughts", authenticateUser, async (req, res) => {
  const userId = req.user._id
  const thoughts = await Thought.find({ createdBy: userId })
  res.json({
    success: true,
    response: thoughts
  })
})

export default usersRouter