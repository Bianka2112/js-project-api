import bcrypt from "bcryptjs"
import { Router } from "express"

import { User } from "../models/User"

const authRouter = Router()

// REGISTRATION ENDPOINT - ASSIGN ENCRYPTED TOKEN (CREATE)
authRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required"})
    }

    const salt = bcrypt.genSaltSync()
    const user = new User({ 
      username, 
      email: email || null , 
      password: bcrypt.hashSync(password, salt) })

    await user.save()

    res.status(200).json({
      message: "Signup success",
      success: true,
      id: user._id, 
      accessToken: user.accessToken})

  } catch(err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0]
        return res.status(409).json({
          success: false,
          message: `A user with that ${field} already exists.`,
        })
      } 
      if (err.errors) {
        const validationErrors = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({
          success: false,
          message: "Invalid input", 
          errors: validationErrors
        })
        }
      console.error(err) 
        res.status(500).json({
          success: false,
          message: "Unexpected server error."
        })
    }
})

// LOGIN ENDPOINT (FINDS USER)
authRouter.post("/login", async (req, res) => {
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
        message: "User successfully logged in",
        userId: user.id, 
        accessToken: user.accessToken
      })
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid password"
      })
  
  }} catch(err) {
    res.status(400).json({
      success: false,
      notFound: true})
  }
})

// MIDDLEWARE TO AUTH
export const authenticateUser = async (req, res, next) => {
  try {

    const token = req.header("Authorization")
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing. Please login to continue."
      })
    }

    const user = await User.findOne({ accessToken: token })
    if(!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login in again.",
        loggedOut: true
      })
    } 
      req.user = user
      next()
  } catch (err) {
      console.error("Authentication error", err)
      res.status(500).json({
        success: false,
        message: "Server error during authentication."
      })
  }
}

export default authRouter