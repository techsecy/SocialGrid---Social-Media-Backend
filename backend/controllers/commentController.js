const Comment = require("../models/Comments");
const Post = require("../models/Post");
const User = require("../models/User");
const { CustomError } = require("../middlewares/error");

const createCommentController = async (req, res, next) => {
  const { postId, userId, text } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post Not Found", 404);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    const newComment = new Comment({
      user: userId,
      post: postId,
      text,
    });

    await newComment.save();
    post.comments.push(newComment._id);
    await post.save();
    res.status(200).json({
      msg: "You have commented on the post successfully",
      comment: newComment,
    });
  } catch (error) {
    next(error);
  }
};

// COMMENT REPLY CONTROLLER
const commentReplyController = async (req, res, next) => {
  const { commentId } = req.params;
  const { userId, text } = req.body;
  try {
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw new CustomError("No comment found", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const reply = {
      text,
      user: userId,
    };
    parentComment.replies.push(reply);
    await parentComment.save();
    res.status(200).json({ msg: "You have replied to a comment", reply });
  } catch (error) {
    next(error);
  }
};

// UPDATE COMMENT CONTROLLER
const updateCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;
  try {
    const commentToUpdate = await Comment.findById(commentId);
    if (!commentToUpdate) {
      throw new CustomError("There's not comment found to update", 404);
    }

    const updateComment = await Comment.findByIdAndUpdate(
      commentId,
      { text },
      { new: true }
    );
    res.status(200).json({ msg: "Comment Update Successfully", updateComment });
  } catch (error) {
    next(error);
  }
};

// UPDATE REPLY COMMENT CONTROLLER
const updateReplyCommentController = async (req, res, next) => {
  const { replyId, commentId } = req.params;
  const { text, userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }
    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1) {
      throw new CustomError("Replying comment not found", 404);
    }
    if (comment.replies[replyIndex].user.toString() !== userId) {
      throw new CustomError("You are not authorized", 404);
    }
    comment.replies[replyIndex].text = text;
    await comment.save();
    res.status(200).json({
      msg: "You have edited the reply successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

const populateUserDetails = async (comments) => {
  for (const comment of comments) {
    await comment.populate("user", "username fullName profilePicture");
    if (comment.replies.length > 0) {
      for (const reply of comment.replies) {
        await reply.populate("user", "username fullName profilePicture");
      }
    }
  }
};

// GET ALL POST COMMENT CONTROLLER
const getCommentsByPostController = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post not found", 404);
    }
    // Find the comment
    let comments = await Comment.find({ post: postId });
    // console.log("Raw comments:", comments);
    await populateUserDetails(comments);
    res.status(200).json({
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// COMMENT DELETE CONTROLLER
const deleteCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    // Verify the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }
    // Verify the user exists
    const user = await User.findById(userId);
    if (!comment) {
      throw new CustomError("User not found", 404);
    }

    // Find the post associated with the comment
    const post = await Post.findOne({ comments: commentId });
    if (!post) {
      throw new CustomError("Post not found", 404);
    }
    // Check if the requesting user is the owner of the comment and the post user itself
    if (
      comment.user.toString() !== userId && // Not the comment owner
      post.user.toString() !== userId // Not the post owner
    ) {
      throw new CustomError(
        "You are not authorized to delete this comment",
        403
      );
    }

    // Find comment and delete
    await Post.findOneAndUpdate(
      { comments: commentId },
      { $pull: { comments: commentId } },
      { new: true }
    );
    await comment.deleteOne();
    res.status(200).json({
      msg: "Comment has been deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// REPLY COMMENT DELETE CONTROLLER
const deleteReplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  const { userId } = req.body;
  try {
    // Verify the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }

    // Verify if the user exists or not
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    // Find the reply to delete in the replies array
    const reply = comment.replies.id(replyId);
    if (!reply) {
      throw new CustomError("Reply not found", 404);
    }

    comment.replies = comment.replies.filter((id) => {
      id.toString() !== replyId;
    });
    // Check if the user is authorized to delete the reply (check if they are the reply owner or the comment owner)
    if (
      reply.user.toString() !== userId &&
      comment.user.toString() !== userId
    ) {
      throw new CustomError("You are not authorized to delete this reply", 403);
    }
    await comment.save();
    res.status(200).json({
      msg: "Replied Comment Deleted Successully",
    });
  } catch (error) {
    next(error);
  }
};

// LIKE COMMENT CONTROLLER
const likeCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }

    if (comment.likes.includes(userId)) {
      throw new CustomError("You have already liked this comment", 400);
    }

    comment.likes.push(userId);
    await comment.save();
    res.status(200).json({
      msg: "Comment liked successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// DISLIKE COMMENT CONTROLLER
const dislikeCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }
    if (!comment.likes.includes(userId)) {
      throw new CustomError("Comment Already disliked", 400);
    }

    comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    await comment.save();
    res.status(200).json({
      msg: "Comment disliked successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// LIKE REPLY COMMENT CONTROLLER
const likeReplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }

    const replyComment = comment.replies.id(replyId);
    if (!replyComment) {
      throw new CustomError("Reply Comment not found", 404);
    }

    if (!Array.isArray(replyComment.likes)) {
      throw new CustomError("Invalid data structure for likes", 500);
    }

    if (replyComment.likes.includes(userId)) {
      throw new CustomError("You have already liked this reply", 400);
    }

    replyComment.likes.push(userId);
    await comment.save();
    res.status(200).json({
      msg: "Liked on reply successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// DISLIKE REPLY COMMENT CONTROLLER
const dislikeReplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }

    const replyComment = comment.replies.id(replyId);
    if (!replyComment) {
      throw new CustomError("Reply Comment not found", 404);
    }

    if (!Array.isArray(replyComment.likes)) {
      throw new CustomError("Invalid data structure for dislikes", 500);
    }

    if (!replyComment.likes.includes(userId)) {
      throw new CustomError("You have not liked this reply", 400);
    }

    replyComment.likes = replyComment.likes.filter(id => id.toString() !== userId);

    await comment.save();
    res.status(200).json({
      msg: "Disliked on reply successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
