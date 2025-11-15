import {Playlists} from "../model/playlists.model.js"
import {Video} from "../model/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import mongoose from "mongoose"



const createPlaylist=asyncHandler(async(req,res)=>{
    const {name,description}=req.body


    if(!name && !description)
      throw new ApiError(400,"Name and description both are required")


    const playlist=await Playlists.create({
        name,
        description,
        owner:req.user?._id
    })


    if(!playlist)
    {
      console.error("Failed to create playlist", { name, description, owner: req.user?._id });
      throw new ApiError(500,"Failed to create playlist")
    }


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist is created sucessfully"
        )
      )
})




const updatePlaylist=asyncHandler(async(req,res)=>{
    const {name,description}=req.body

    const {playlistId}=req.params


    if(!mongoose.isValidObjectId(playlist))
      throw new ApiError(400,`Invalid ${playlistId}`)


    const playlist=await Playlists.findById(playlistId)


    if(!playlist)
      throw new ApiError(404,"Playlist not found")


    if(playlist.owner.toString()!==req.user?._id.toString())
      throw new ApiError(400,"Only owner can edit the playlist")


    const updatePlaylist=await Playlists.findByIdAndUpdate(
        playlist?._id,
        {
            $set:{
                name,
                description
            }
        },
        {new:true}
    )


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            updatePlaylist,
            "PlayList is update sucessfully"
        )
      )
})




const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params


    if(!mongoose.isValidObjectId(playlistId))
      throw new ApiError(400,`Invalid ${playlistId}`)


    const playlist=await Playlists.findById(playlistId)


    if(!playlist)
      throw new ApiError(404,"Playlist not found")


    if(playlist.owner.toString()!==req.user?._id.toString())
      throw new ApiError(400,"Only owner can delete the playlist")


    await Playlists.findByIdAndDelete(playlist?._id)


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {},
            "Playlist delete sucessfully"
        )
      )
})




const addVideoPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId))
      throw new ApiError(400,`Invalid ${playlistId} or ${videoId}`)


    const playlist=await Playlists.findById(playlistId)


    const video=await Video.findById(videoId)


    if(!playlist)
      throw new ApiError(404,"Playlist not found")


    if(!video)
      throw new ApiError(404,"Video not found")


    if(playlist.owner?._id.toString()  && video.owner?._id.toString()!==req.user?._id.toString())
      throw new ApiError(400,"Only owner can add video in their playlist")


    const addVideo=await Playlists.findByIdAndUpdate(

        playlistId?._id,
        {
            //this only add once
            $addToSet:{
                video:videoId
            }
        },
        {new:true}
    )
      

    if(!addVideo)
      throw new ApiError(400,"Failed to add video in their Playlist")


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            addVideo,
            "Add video in playlist sucessfully"
        )
      )
})




const removeVideoFromPlaylist=await asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId))
      throw new ApiError(400,`Invalid ${playlistId} or ${videoId}`)


    const playlist=await Playlists.findById(playlistId)

    const video=await Video.findById(videoId)


    if(!playlist)
      throw new ApiError(404,"Playlist not found")

    if(!video)
      throw new ApiError(404,"Video not found")


    if(playlist.owner?._id.toString() && video.owner?._id.toString()!==req.user?.id.toString())
      throw new ApiError(400,"Only owner can remove video from their playlist")


    const removeVideo=await Playlists.findByIdAndUpdate(
        playlistId?._id,
        {
            $pull:{
                video:videoId
            }
        },
        {new:true}
    )


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            removeVideo,
            "Remove video from playlist sucessfully"
        )
      )
})



const getPlaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params

    if(!mongoose.isValidObjectId(playlistId))
      throw new ApiError(400,`Invalid ${playlistId}`)


    const playlist=await Playlists.findById(playlistId)


    if(!playlist)
      throw new ApiError(404,"Playlist not found")


    const playlistVideo=await Playlists.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"video",
                localField:"video",
                foreignField:"_id",
                as:"videos"
            }
        },
        {
            $match:{
                "videos.isPublished":true
            }
        },
        {
            $lookup:{
                from:"user",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $addFields:{
                totalvideo:{
                    $size:"$videos"
                },
                totalviews:{
                    $sum:"$videos.views"
                },
                owner:{
                    $first:"owner"
                }
            }
        },
        {
            $project:{
                name:1,
                description:1,
                createdAt:1,
                updatedAt:1,
                totalvideo:1,
                totalviews:1,
                videos:{
                    _id:1,
                    "videoFile.url":1,
                    "thumbnail.url":1,
                    title:1,
                    description:1,
                    duration:1,
                    createdAt:1,
                    views:1
                },
                owner:{
                    username:1,
                    fullname:1,
                    "avatar.url":1
                }
            }
        }

    ])

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            playlistVideo,
            "Playlist fetched sucessfully"
        )
      )
})




const getUserPlaylists=asyncHandler(async(req,res)=>{
    const {userId}=req.params

    if(!mongoose.isValidObjectId(userId))
      throw new ApiError(400,`Invalid ${userId}`)

    
    const playlist=await Playlists.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videos"
            }
        },
        {
            $addFields:{
                totalvideo:{
                    $size:"$videos"
                },
                totalviews:{
                    $sum:"videos.views"
                }
            }
        },
        {
            $project:{
                _id:1,
                name:1,
                description:1,
                totalvideo:1,
                totalviews:1,
                updatedAt:1
            }
        }
    ])


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "User playlist is fetched sucessfully"
            )
        )
})



export {getPlaylistById,getUserPlaylists,removeVideoFromPlaylist,updatePlaylist,createPlaylist,deletePlaylist,addVideoPlaylist}