const Story = require("../models/Story");
const User = require("../models/User");
const CustomError = require("../middlewares/error");

// STORY CREATION CONTROLLER
const createStoryController = async (req, res, next) => {
  const { userId } = req.params;
  const { text } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("No user found", 404);
    }

    let image = "";

    if (req.file) {
      image = process.env.URL + `/uploads/${req.file.filename}`;
    }

    const newStory = new Story({
      user: userId,
      image,
      text,
    });

    await newStory.save();
    res.status(200).json({
      msg: "Story created successfully",
      newStory,
    });
  } catch (error) {
    next(error);
  }
};

// CREATING GET ALL STORIES CONTROLLER
const getStoriesController = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const followingUsers = user.following;
    console.log(user.following); // Debug to check the following array

    const stories = await Story.find({
      user: { $in: followingUsers },
    }).populate("user", "fullName username profilePicture");
    res.status(200).json({
      msg: "Here's all stories",
      stories,
    });
  } catch (error) {
    next(error);
  }
};

// GET ONLY USER STORIES
const getUserOnlyStoryController = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    const stories = await Story.find({ user: userId }).populate(
      "user",
      "fullName username profilePicture"
    );
    res.status(200).json({
      msg: "Here's your stories",
      stories,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE SINGLE STORY CONTROLLER
const deleteSingleStoryController = async (req, res, next) => {
  const { storyId } = req.params;
  const { userId } = req.body;
  try {
    // Find the story to ensure it exists and to check ownership
    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ msg: "Story not found" });
    }

    // Check if the requesting user is the owner of the story
    if (story.user.toString() !== userId) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to delete this story" });
    }
    await Story.findByIdAndDelete(storyId);
    res.status(200).json({
      msg: "Story has been deleted",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE ALL STORIES CONTROLLER
const deleteAllStoriesController = async (req, res, next) => {
  const { userId } = req.params;
  // const { storyId } = req.body;
  try {
    // Find the user to ensure if user exists it or not
    // const user = await User.findById(userId);

    // if (!user) {
    //   throw new CustomError("User not found", 404);
    // }

    // // Find the story to ensure it exists and to check ownership
    // const story = await Story.findById(storyId);

    // if (!story) {
    //   return res.status(404).json({ msg: "Story not found" });
    // }
    // if (story.user.toString() !== userId) {
    //   throw new CustomError("You are not authorized to delete this story", 403);
    // }
    await Story.deleteMany({user: userId})
    res.status(200).json({
      msg: "All stories have been deleted successfully"
    })
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStoryController,
  getStoriesController,
  getUserOnlyStoryController,
  deleteSingleStoryController,
  deleteAllStoriesController,
};
