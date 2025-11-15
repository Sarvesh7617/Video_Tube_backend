import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { getChannelStats, getChannelVideo } from "../controllers/dashboard.controllers.js";



const router=Router()


router.use(verifyJWT)


router.route("/stats").get(getChannelStats)

router.route("/videos").get(getChannelVideo)


export default router;