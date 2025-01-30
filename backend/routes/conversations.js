// Importing required modules
const express = require("express")
const router = express.Router()
const {createNewConversationController,getConversationOfUserController} = require("../controllers/conversationController")

// New Conversation
router.post("/create", createNewConversationController)

// GET CONVERSATION OF USER ROUTE
router.get("/:userId", getConversationOfUserController)
// Exportation
module.exports = router