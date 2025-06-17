import bcrypt from "bcryptjs"
import { User } from "../models/User"
import { Router } from "express"

const authRouter = Router()

// REGISTRATION ENDPOINT - ASSIGN ENCRYPTED TOKEN (CREATE)
authRouter.post("/", async (req, res) => {
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
        res.status(409).json({
          success: false,
          message: `A user with that ${field} already exists.`,
        })
      } else {
        console.error(err)
        res.status(400).json({
          success: false,
          message: "Could not create user", 
          errors: err.errors
        })
        }
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
  const user = await User.findOne({accessToken: req.header("Authorization")})
  if(user) {
    req.user = user
    next()
  } else {
    res.status(401).json({loggedOut: true})
  }
}

export default authRouter