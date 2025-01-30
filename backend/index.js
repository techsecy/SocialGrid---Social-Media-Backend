const express = require('express')
const connectToDb = require('./database/db')
const app = express()
const dotenv = require('dotenv')
const authRoute = require('./routes/auth')
const userRoute = require('./routes/users')
const postRoute = require('./routes/posts')
const commentRoute = require("./routes/comments")
const storyRoute = require("./routes/stories")
const conversationRoute = require("./routes/conversations")
const path = require("path")
const cookieParser = require("cookie-parser")
const {errorHandler} = require('./middlewares/error')


dotenv.config()
app.use(express.json())
app.use(cookieParser())
app.use(errorHandler)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use("/api/post", postRoute)
app.use("/api/comment", commentRoute)
app.use("/api/story", storyRoute)
app.use("/api/conversation", conversationRoute)





app.listen(process.env.PORT, () => {
    connectToDb()
    console.log('App is Running')
})