// Importing the required modules and files
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const CustomError = require("../middlewares/error");

// Creating New Conversation Controller
const createNewConversationController = async (req, res, next) => {
  try {
    let newConversation;
    if (req.body.firstUser !== req.body.secondUser) {
      newConversation = new Conversation({
        participants: [req.body.firstUser, req.body.secondUser],
      });
    } else {
      throw new CustomError("Sender and Receiver can't be same", 400);
    }
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (error) {
    next(error);
  }
};


// GET CONVERSATION OF USER CONTROLLER
const getConversationOfUserController = async(req,res,next) => {
    try {
        const conversation = await Conversation.find({
            participants:{$in:[req.params.userId]}
        })
        res.status(200).json(conversation)
    } catch(error) {
        next(error)
    }
}

module.exports = {
  createNewConversationController,
  getConversationOfUserController,
};
