import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import { User } from "./models/User"
import { Thought } from "./models/Thought"
import thoughtsList from "./data/thoughtsList.json"

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

// MIDDLEWARE TO AUTH
const authenticateUser = async (req, res, next) => {
  const user = await User.findOne({accessToken: req.header("Authorization")})
  if(user) {
    req.user = user
    next()
  } else {
    res.status(401).json({loggedOut: true})
  }
}

// REGISTRATION ENDPOINT - ASSIGN ENCRYPTED TOKEN (CREATE)
app.post("/users", async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required"})
    }

    const salt = bcrypt.genSaltSync()
    const user = new User({ username, email, password: bcrypt.hashSync(password, salt) })
    await user.save()

    res.status(200).json({
      message: "Signup success",
      success: true,
      id: user._id, 
      accessToken: user.accessToken})
  } catch(err) {
      console.error(err)
      res.status(400).json({
        message: "Could not create user", 
        errors: err.errors})
    }
})

// LOGIN ENDPOINT (FINDS USER)
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body 

    const user = await User.findOne({ username: req.body.username })
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User does not exist"})
    }
    
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.status(201).json({
        success: true,
        message: "User logged in",
        userId: user.id, 
        accessToken: user.accessToken})
  }} catch(err) {
    res.status(400).json({
      success: false,
      notFound: true})
  }
})

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

// GET ALL THOUGHTS
app.get("/thoughts", async (req, res) => {
  
  try {
  const thoughts = await Thought.find()
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
