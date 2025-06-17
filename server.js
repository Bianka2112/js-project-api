import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"

import thoughtsList from "./data/thoughtsList.json"
import { Thought } from "./models/Thought"
import authRouter, { authenticateUser } from "./routes/authRouter"
import thoughtsRouter from "./routes/thoughtsRouter"

// CONNECTION SETTINGS
const port = process.env.PORT || 8000
const app = express()

dotenv.config()
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/thoughts"
console.log("🔌 Connecting to MongoDB at:", mongoUrl)

mongoose.connect(mongoUrl, {
  autoIndex: true
})
.then(() => {
  console.log("🌱 Connected to DB:", mongoose.connection.db.databaseName);
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err)
})

app.use(cors())
app.use(express.json())

// MOUNT AUTH ROUTER
app.use("/users", authRouter)

// MOUNT THOUGHTS ROUTER
app.use("/", thoughtsRouter)

// SEED DATABASE 
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

// DELETE ONE THOUGHT
app.delete("/thoughts/:id", authenticateUser, async (req, res) => {
  
  try {
    const delThought = await Thought.findByIdAndDelete(req.params.id)
    
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

// UPDATE/EDIT THOUGHT
app.patch("/thoughts/:id", authenticateUser, async (req, res) => {

  const { id } = req.params
  const { editThought } = req.body
  
  try {
    const thought = await Thought.findByIdAndUpdate( id, { message: editThought }, { new: true, runValidators: true })
    
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
