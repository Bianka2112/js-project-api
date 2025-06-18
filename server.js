import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"

import thoughtsList from "./data/thoughtsList.json"
import { Thought } from "./models/Thought"
import authRouter, { authenticateUser } from "./routes/authRouter"
import thoughtsRouter from "./routes/thoughtsRouter"
import usersRouter from "./routes/usersRouter"

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

// MOUNT ROUTES
app.use("/auth", authRouter)
app.use("/thoughts", thoughtsRouter)
app.use("/users", usersRouter)

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
    usage: "Visit /thoughts to get all thoughts, or see the list below for all available endpoints.",
    endpoints: endpoints
  })
})


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
