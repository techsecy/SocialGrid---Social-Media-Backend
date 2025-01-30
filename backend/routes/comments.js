const express = require("express");
const router = express.Router();
const {
  createCommentController,
  commentReplyController,
  updateCommentController,
  updateReplyCommentController,
  getCommentsByPostController,
  deleteCommentController,
  deleteReplyCommentController,
  likeCommentController,
  dislikeCommentController,
  likeReplyCommentController,
  dislikeReplyCommentController
} = require("../controllers/commentController");
// CREATE COMMENT ROUTE
router.post("/create", createCommentController);

// COMMENT REPLY ROUTE
router.post("/reply/:commentId", commentReplyController);

// UPDATE COMMENT ROUTE
router.put("/update/:commentId", updateCommentController);

// UPDATE REPLY COMMENT ROUTE
router.put(
  "/updateReplyComment/:commentId/replies/:replyId",
  updateReplyCommentController
);

// GET ALL POTS COMMENT ROUTE
router.get("/post/:postId", getCommentsByPostController);

// COMMENT DELETE ROUTE
router.delete("/deleteComment/:commentId", deleteCommentController);

// DELETE REPLY COMMENT
router.delete(
  "/deleteReplyComment/:commentId/replies/:replyId",
  deleteReplyCommentController
);

// LIKE A COMMENT
router.post("/likeComment/:commentId", likeCommentController);

// DISLIKE A COMMENT
router.post("/dislikeComment/:commentId", dislikeCommentController);

// LIKE REPLY COMMENT ROUTE
router.post("/:commentId/replies/like/:replyId", likeReplyCommentController);

// DISLIKE REPLY COMMENT ROUTE
router.post("/:commentId/replies/dislike/:replyId", dislikeReplyCommentController);
module.exports = router;
