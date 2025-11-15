import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {upload} from "../middlewares/multer.middlewares.js"
import { addVideoPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controllers.js";


const router=Router();


router.use(verifyJWT,upload.none())



router.route("/").post(createPlaylist)


router.route("/:playlistId").patch(updatePlaylist)


router.route("/:playlistId").delete(deletePlaylist)


router.route("/add/:playlistId/:videoId").patch(addVideoPlaylist)


router.route("/remove/:playlistId/:videoId").patch(removeVideoFromPlaylist)


router.route("/:playlistId").get(getPlaylistById)


router.route("/user/:userId").get(getUserPlaylists)



export default router;