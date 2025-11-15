import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {upload} from "../middlewares/multer.middlewares.js"
import { deleteVideo, getAllVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo,cancelUpload } from "../controllers/video.controllers.js";




const router=Router();



router.route("/").get(getAllVideo)


router.route("/").post(
    verifyJWT,
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),publishAVideo)




router.route("/v/:videoId").get(verifyJWT,getVideoById)

router.route("/cancel-upload").delete(cancelUpload);

router.route("/cancel-upload").post(cancelUpload);

router.route("/v/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateVideo)


router.route("/v/:videoId").delete(verifyJWT,deleteVideo)



router.route("/toggle/publish/:videoId").patch(verifyJWT,togglePublishStatus)



export default router;