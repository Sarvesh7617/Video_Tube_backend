import { Router } from "express";
import { getLikedVideo,toggleCommentLike,toggleTweetLike,toggleVIdeoLike } from "../controllers/likes.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js"



const router=Router()


router.use(verifyJWT)


router.route("/toggle/v/:videoId").post(toggleVIdeoLike)


router.route("/toggle/c/:commentId").post(toggleCommentLike)


router.route("toggle/t/:tweetId").post(toggleTweetLike)


router.route("/video").get(getLikedVideo)



export default router;