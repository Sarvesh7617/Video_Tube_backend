import { Router } from "express";
import { changeCurrentPassword,getWatchHistory, getCurrentUser, getUserChannelProfile, loginUser, logoutUser, refreshAccessToken, registration, updateAccountDetails, updateUserAvatar, updateUsercoverImage } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middlewares.js';
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router=Router()

router.route('/register').post(upload.fields([
    {
        name:'avatar',
        maxCount:1
    },
    {
        name:'coverImage',
        maxCount:1
    }
]),registration)



router.route('/login').post(loginUser)


router.route('/logout').post(verifyJWT,logoutUser)


router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").post(verifyJWT,changeCurrentPassword)

router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/update-cover-image").patch(verifyJWT,upload.single("coverImage"),updateUsercoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/watch-History").get(verifyJWT,getWatchHistory)

export default router;
