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
thoughtsRouter.post("/", authenticateUser, async (req, res) => {
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
      response: error.message,
      message: "Could not post thought"
    })
  }
})


// DELETE THOUGHT
thoughtsRouter.delete("/:id", authenticateUser, async (req, res) => {
  
  try {
    const delThought = await Thought.findByIdAndDelete({ _id: req.params.id, createdBy: req.user._id })
    
    if (!delThought) {
     return res.status(404).json({ 
      success: false,
      message: "Not found or authorized" 
    })
    }
      res.status(200).json({
        success: true,
        response: delThought,
        message: "Thought deleted successfully."
    })
  } catch (error){
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Could not delete thought"
    })
  }
})

// UPDATE/EDIT THOUGHT
thoughtsRouter.patch("/:id", authenticateUser, async (req, res) => {
  const { editThought } = req.body
  if (!editThought || editThought.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "editThought is required to update the post."
    })
  }
  
  try {
    const thought = await Thought.findByIdAndUpdate({ _id: req.params.id, createdBy: req.user._id },
      { message: editThought }, 
      { new: true, runValidators: true })
    
    if (!thought) {
     return res.status(404).json({ 
      success: false,
      message: "Not found, no update possible." 
    })
    }
      res.status(200).json({
        success: true,
        response: thought,
        message: "Thought updated successfully."
    })
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        errors: error.errors,
        message: "Validation failed",
      })
    }
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Server error - try again later."
    })
  }
})

// POST A LIKE
thoughtsRouter.post("/:id/like", async (req, res) => {

  const { id } = req.params
  
  try {
    const thought = await Thought.findByIdAndUpdate( id, { $inc: { hearts: 1 } }, { new: true, runValidators: true })
    
    if (!thought) {
     return res.status(404).json({ error: "This thought not found, no update possible." })
    }
      res.status(201).json({
        success: true,
        response: thought,
        message: "New like added."
    })
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        errors: error.errors,
        message: "Validation failed",
      })
    }
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Server error - try again later."
    })
  }
})

export default thoughtsRouter
