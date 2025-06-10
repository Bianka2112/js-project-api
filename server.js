import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"
import dotenv from "dotenv"

import thoughtsList from "./data/thoughtsList.json"

// CONNECTION SETTINGS
const port = process.env.PORT || 8000
const app = express()

dotenv.config()
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/thoughts"
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())

// MONGOOSE METHODS
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

const Thought = mongoose.model("Thought", thoughtSchema)

if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await Thought.deleteMany({})
    thoughtsList.forEach(thought => {
      new Thought(thought).save()
    })
  }
  seedDatabase()
}

// ENDPOINTS DOC
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Hello Happy Thoughts API",
    endpoints: endpoints
  })
})

// GET ALL THOUGHTS
app.get("/thoughts", async (req, res) => {
  const thoughts = await Thought.find()

try {
  if (thoughtsList.length === 0) {
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

// GET ONE THOUGHT
app.get("/thoughts/:id", async (req, res) => {

  const aThought = await Thought.findById(req.params.id)

  try {
    if (!aThought) {
      return res.status(404).json({ error: "thought not found" })
      }

    res.status(200).json(aThought)

    } catch (error) {
      res.status(500).json({
        success: false,
        response: error,
        message: "Failed to find this thought."
      })
    }
})

// POST THOUGHT
app.post("/thoughts", async (req, res) => {
  const { message, hearts, createdAt } = req.body

  try {
    const newThought = await new Thought({ message, hearts, createdAt }).save()

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

// DELETE ONE THOUGHT
app.delete("/thoughts/:id", async (req, res) => {
  
  const delThought = await Thought.findByIdAndDelete(req.params.id)
  
  try {
    if (!delThought) {
     return res.status(404).json({ error: "This thought not found" })
    }
      res.status(201).json({
        success: true,
        response: delThought,
        message: "Thought deleted successfully."
    })
  } catch (error){
    res.status(500).json({
      success: false,
      response: error,
      message: "Could not delete thought"
    })
  }
})

// UPDATE THOUGHT
app.patch("/thoughts/:id", async (req, res) => {

  const { id } = req.params
  const { editThought } = req.body
  
  const thought = await Thought.findByIdAndUpdate( id, { message: editThought }, { new: true, runValidators: true })
  
  try {
    if (!thought) {
     return res.status(404).json({ error: "This thought not found, no update possible." })
    }
      res.status(201).json({
        success: true,
        response: thought,
        message: "Thought updated successfully."
    })
  } catch (error){
    res.status(500).json({
      success: false,
      response: error,
      message: "Could not update thought"
    })
  }
})

// POST A LIKE
app.post("/thoughts/:id/like", async (req, res) => {

  const { _id } = req.params
  
  const thought = await Thought.findByIdAndUpdate( _id, { $inc: { hearts: 1 } }, { new: true, runValidators: true })
  
  try {
    if (!thought) {
     return res.status(404).json({ error: "This thought not found, no update possible." })
    }
      res.status(201).json({
        success: true,
        response: thought,
        message: "New like added."
    })
  } catch (error){
    res.status(500).json({
      success: false,
      response: error,
      message: "Could not update likes."
    })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
