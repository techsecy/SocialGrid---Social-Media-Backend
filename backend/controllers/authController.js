const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { CustomError } = require("../middlewares/error");

// Registration Controller
const registerController = async function (req, res, next) {
    try {
      const { password, username, email } = req.body;
  
      // Check if username or email already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
          throw new CustomError("Username or Email already exists!", 400)
      }
  
      // Hash password and save new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = bcrypt.hashSync(password, salt); // bcrypt.hashSync is synchronous
      const newUser = new User({ ...req.body, password: hashedPassword });
      const savedUser = await newUser.save();
  
      // Respond with the saved user
      res.status(201).json({
        savedUser,
      });
    } catch (error) {
      // Catch and handle any server errors
      next(error)
    }
  }

  // Login Controller
const loginController = async function (req, res, next) {
    try {
        let user;
        // Find user by email or username
        if (req.body.email) {
            user = await User.findOne({ email: req.body.email });
        } else {
            user = await User.findOne({ username: req.body.username });
        }

        // If user not found, return 404
        if (!user) {
            throw new CustomError("User not found!", 404)
        }

        // Match the password
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            throw new CustomError("Wrong Credentials", 401)
        }

        res.status(200).json({
            msg: "Logged in successfully",
        });
        
        // Creating JWT Token for authorization
        const {password,...data} = user._doc
        const token = jwt.sign({_id:user._id},process.env.JWT_SECRET, {expiresIn:process.env.JWT_EXPIRE})
        res.cookie("token", token).status(200).json(data)

    } catch (error) {
        // Handle server error
        next (error)
    }
}

// Logout Controller
const logoutController = async function(req, res) {
    try {
        res.clearCookie("token", {sameSite:"none", secure:true}).status(200).json("User Logged Out Successfully")
    } catch(error) {
        res.status(500).json({
            err: error
        })
    }
}

// Refetch controller
const refetchUserController = async function(req, res, next) {
    const token = req.cookies.token
    jwt.verify(token, process.env.JWT_SECRET, {}, async(err, data) => {
        // console.log(data)
        if(err) {
            throw new CustomError(err, 404)
        }
        try {
            const id = data._id
            const user = await User.findOne({_id:id})
            return res.status(200).json(user)
        } catch(error) {
            next(error)
        }
    })
    
}

module.exports = {
    registerController,
    loginController,
    logoutController,
    refetchUserController
}