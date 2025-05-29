import cors from "cors"
import express from "express"

import thoughtsList from "./data/thoughtsList.json"

// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8000
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello !")
})

// Endpoint for all thought
app.get("/thoughts", (req, res) => {
  res.json(thoughtsList)
})

// Endpoint for one thought
app.get("/thoughts/:id", (req, res) => {
  
  console.log("req.params", req.params.id)

  const aThought = thoughtsList.find(t => t._id === req.params.id)

  if (!aThought) {
    return res.status(404).json({ error: "thought not found" })
  }

  res.json(aThought)
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
