const express = require("express")
const router = express.Router()
const upload = require("../middlewares/upload")
const {createPostController,createPostWithImagesController,updatePostController,getAllPostController,getUserPostController,postDeleteController,likePostController,dislikePostController} = require("../controllers/postController")

// POST CREATION ROUTE
router.post("/create", createPostController)

// POST CREATION ROUTE WITH IMAGE
router.post("/create/:userId", upload.array("images", 5), createPostWithImagesController)

// UPDATE PSOT ROUTE
router.put("/update/:postId", updatePostController)

// GET ALL POSTS ROUTE
router.get("/getPost/:userId", getAllPostController)

// GET USER POSTS ROUTE
router.get("/userPost/:userId", getUserPostController)

// DELETE POST ROUTE
router.delete("/deletePost/:postId", postDeleteController)

// LIKE POST ROUTE
router.post("/like/:postId", likePostController)

// DISLIKE POST ROUTE
router.post("/dislike/:postId", dislikePostController)

module.exports = router

