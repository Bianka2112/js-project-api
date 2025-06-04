import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"

import thoughtsList from "./data/thoughtsList.json"

// CONNECTION SETTINGS
const port = process.env.PORT || 8000
const app = express()

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/thoughts"
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())

const thoughtSchema = new mongoose.Schema({
  _id: String,
  message: {
    type: String,
    minlength: 5,
    maxlength: 140},
  hearts: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
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

// Start defining routes here
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Hello Happy Thoughts API",
    endpoints: endpoints
  })
})

// Endpoint for all thoughts
// Query params to filter
app.get("/thoughts", async (req, res) => {
  const thoughts = await Thought.find()

try {
  if (thoughtsList.length === 0) {
    return res.status(404).json({
      success: false,
      response: null,
      message: "No thoughts available."
    })
  }
    res.status(200).json(thoughts)

  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "Failed to fetch thoughts."
    })
  }
})

// Endpoint for one thought
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
        message: "Failed to fetch thoughts."
      })
    }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
