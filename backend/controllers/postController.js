const Post = require("../models/Post")
const User = require("../models/User")
const { CustomError } = require("../middlewares/error");

// POST CREATION CONTROLLER
const createPostController = async(req, res, next) => {
    const {userId, caption} = req.body
    try {
        const user = await User.findById(userId);
        if(!user) {
            throw new CustomError("User not found", 404)
        }
        const newPost = new Post({
            user: userId,
            caption
        })

        await newPost.save()
        user.posts.push(newPost._id)
        await user.save()
        res.status(201).json({message: "Post Creation Successfully", post: newPost})
    } catch(error) {
        next(error)
    }
}


// URL GENERATION FOR FILE UPLOAD
const generateFileUrl = (filename) => {
    return process.env.URL+`/uploads/${filename}`
}

// POST CREATION WITH IMAGE CONTROLLER
const createPostWithImagesController = async(req, res,next) => {
    const {userId} = req.params
    const {caption} = req.body
    const files = req.files

    try {
        const user = await User.findById(userId)
        if(!user) {
            throw new CustomError("User not found", 404)
        }
        const imageUrls = files.map(file=>generateFileUrl(file.filename))
        const newPost = new Post({
            user: userId,
            caption,
            image: imageUrls
        })

        await newPost.save()
        user.posts.push(newPost._id)
        await user.save()
        res.status(201).json({
            message: "Post created successfully", post: newPost
        })
    } catch(error) {
        next(error)
    }
}

// UPDATE POST CONTROLLER
const updatePostController = async(req, res, next) => {
    const {postId} = req.params
    const {caption} =req.body
    try {
        const postToUpdate = await Post.findById(postId)
        if(!postToUpdate) {
            throw new CustomError("There's no found", 404)
        }
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { caption },
            { new: true }
        )

        await postToUpdate.save()
        return res.status(200).json({msg: "Post Update Successfully", post:updatedPost})
    } catch(error) {
        next(error)
    }
}

// GET ALL POST CONTROLLER
const getAllPostController = async(req, res, next) => {
    const {userId} = req.params
    try {
        const user = await User.findById(userId)
        if(!user) {
            throw new CustomError("User not found", 404)
        }
        const blockedUsersIds = user.blockList.map(id=>id.toString())

        const allPosts = await Post.find({user:{$nin: blockedUsersIds}}).populate("user", "username fullName profilePicture")
        res.status(200).json({posts: allPosts})

    } catch(error) {
        next(error)
    }
}


// GET USER POST CONTROLLER
const getUserPostController = async(req, res, next) => {
    const {userId} = req.params
    try {
        const user = await User.findById(userId)
        if(!user) {
            throw new CustomError("User not found", 404)
        }
        
        const userPosts = await Post.find({user:userId})
        res.status(200).json({posts: userPosts})

    } catch(error) {
        next(error)
    }
}

// POST DELETE CONTROLLER
const postDeleteController = async(req, res,next) => {
    const {postId} = req.params
    try {
        const postToDelete = await Post.findById(postId)
        if(!postToDelete) {
            throw new CustomError("Post not found", 404)
        }
        const user = await User.findById(postToDelete.user)
        if(!user) {
            throw new CustomError("User not found", 404)
        }
        user.posts = user.posts.filter(postId=>postId.toString()!==postToDelete._id.toString())
        await user.save()
        await postToDelete.deleteOne()

        res.status(200).json({msg: "Post Deleted Successfully"})
    } catch(error) {
        next(error)
    }
}

// LIKE POST CONTROLLER
const likePostController = async(req, res, next) => {
    const {postId} = req.params
    const {userId} = req.body
    const username = "ajay441"
    try {
        const post = await Post.findById(postId)
        if(!post) {
            throw new CustomError("Post not found", 404)
        }
        const user = await User.findById(userId)
        if(!user) {
            throw new CustomError("User not found", 404)
        }
        if(post.likes.includes(userId)) {
            throw new CustomError("You have already liked this post", 404)
        }
        post.likes.push(userId)
        await post.save()
        res.status(200).json({
            msg: `You have liked the post of ${username}`, post
        })
    } catch(error) {
        next(error)
    }
}

// DISLIKE POST CONTROLLER
const dislikePostController = async(req, res, next) => {
    const {postId} = req.params
    const {userId} = req.body
    const username = "ajay441"
    try {
        const post = await Post.findById(postId)
        if(!post) {
            throw new CustomError("Post not found", 404)
        }
        const user = await User.findById(userId)
        if(!user) {
            throw new CustomError("User not found", 404)
        }
        if(!post.likes.includes(userId)) {
            throw new CustomError("You have not liked this post", 404)
        }
        post.likes = post.likes.filter(id=>id.toString()!==userId)
        await post.save()
        res.status(200).json({
            msg: `You have disliked the post of ${username}`, post
        })
    } catch(error) {
        next(error)
    }
}


module.exports = {
    createPostController,
    createPostWithImagesController,
    updatePostController,
    getAllPostController,
    getUserPostController,
    postDeleteController,
    likePostController,
    dislikePostController
}