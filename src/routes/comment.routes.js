import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { addComment, deleteComment, getVideoComment, updateComment } from "../controllers/comment.controller.js";




const router=Router();

router.use(verifyJWT,upload.none())      //none for no file expected and verifyjwt for unauthorize user not access commnet

router.route("/:videoId").get(getVideoComment)

router.route("/:videoId").post(addComment)

router.route("/comment/:commentId").patch(updateComment)

router.route("/comment/:commentId").delete(deleteComment)


export default router;