import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js"



const router=Router();


router.use(verifyJWT)

router.route("/c/:channelId").post(toggleSubscription)

router.route("/c/:channelId").get(getUserChannelSubscribers)


router.route("/u/:subscriberId").get(getSubscribedChannels)


export default router;