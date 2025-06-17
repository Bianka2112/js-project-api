import { Router } from "express"
import { Thought } from "../models/Thought"
import { authenticateUser } from "./authRouter"

const thoughtsRouter = Router()

// GET ALL THOUGHTS
thoughtsRouter.get("/thoughts", async (req, res) => {
  
  try {
  const thoughts = await Thought.find()
  if (Thought.length === 0) {
    return res.status(404).json({
      success: false,
      response: [],
      message: "No thoughts available."
    })
  }
    res.status(200).json({
      success: true,
      response: thoughts,
      message: "thoughts available."
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "Failed to fetch thoughts."
    })
  }
})

// POST THOUGHT
thoughtsRouter.post("/thoughts", authenticateUser, async (req, res) => {
  const { message, hearts, createdAt } = req.body

  try {
    const newThought = await new Thought({ message, hearts, createdAt, createdBy: req.user._id }).save()

    res.status(201).json({
      success: true,
      response: newThought,
      message: "Thought posted successfully."
    })
  } catch (error){
    res.status(500).json({
      success: false,
      response: error,
      message: "Could not post thought"
    })
  }
})

export default thoughtsRouter