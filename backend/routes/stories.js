const express = require("express");
const router = express.Router();
const {
  createStoryController,
  getStoriesController,
  getUserOnlyStoryController,
  deleteSingleStoryController,
  deleteAllStoriesController,
} = require("../controllers/storyController");
const upload = require("../middlewares/upload");

// CREATE STORY ROUTE
router.post("/create/:userId", upload.single("image"), createStoryController);

// GET ALL STORIES ROUTE
router.get("/all/:userId", getStoriesController);

// GET USER STORIES
router.get("/userStory/:userId", getUserOnlyStoryController);

// SINGLE STORY DELETE ROUTE
router.delete("/deleteStory/:storyId", deleteSingleStoryController);

// ALL STORY DELET ROUTE
router.delete("/delete/stories/:userId", deleteAllStoriesController);

module.exports = router;
