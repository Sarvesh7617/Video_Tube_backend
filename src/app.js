import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {Server} from 'socket.io'; 
import http from 'http';
const app=express()



app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))



app.use(express.json({limit:"16kb"}))                //for json file accept
app.use(express.urlencoded({extended:true,limit:"16kb"}))        //image url accept from cloudinary
app.use(express.static("public"))                    // if image store in public folder
app.use(cookieParser())                              //for server acccess or set the user browser cookies

const server = http.createServer(app);
const socket=new Server(server,{
    cors: {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
})



// routes import

import userRouter from './routes/user.routes.js'
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import likesRouter from "./routes/likes.routes.js"
import healthcheckRouter from "./routes/heathcheck.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import commentRouter from "./routes/comment.routes.js"

//routes desination
app.use('/api/v1/users',userRouter)
app.use('/api/v1/videos',videoRouter)
app.use('/api/v1/tweets',tweetRouter)
app.use('/api/v1/subscriptions',subscriptionRouter)
app.use('/api/v1/playlist',playlistRouter)
app.use('/api/v1/likes',likesRouter)
app.use('/api/v1/healthcheck',healthcheckRouter)
app.use('/api/v1/dashboard',dashboardRouter)
app.use('/api/v1/comment',commentRouter)


export {app,server,socket};