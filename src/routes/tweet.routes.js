import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controllers.js";




const router=Router();


router.use(verifyJWT,upload.none())


router.route("/").post(createTweet);


router.route("/:tweetId").patch(updateTweet)


router.route("/:tweetId").delete(deleteTweet)


router.route("/user/:userId").get(getUserTweets)



export default router;