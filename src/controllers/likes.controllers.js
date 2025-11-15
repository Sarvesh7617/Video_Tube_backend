import mongoose from "mongoose";
import {Likes} from "../model/likes.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleVIdeoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params

    if(!mongoose.isValidObjectId(videoId))
      throw new ApiError(404,`Invalid ${videoId}`)


    const likedAlready=await Likes.findOne({
        video:videoId,
        likedBy:req.user?._id
    })

    if(likedAlready)
    {
      await Likes.findByIdAndDelete(likedAlready?._id)


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {isLiked:false}
            )
        )
    }
    
    await Likes.create({
        video:videoId,
        likedBy:req.user?._id
    })


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {isLiked:true}
            )
        )
})




const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    

    if(!isValidObjectId(commentId))
      throw new ApiError(400,`Invalid ${commentId}`)


    const likedAlready=await Comment.findOne({
        comment:commentId,
        likedBy:req.user?._id
    })


    if(likedAlready)
    {
        await Comment.findByIdAndDelete(likedAlready?._id)


        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {isLiked:false}
                )
            )
    }


    await Comment.create({
        comment:commentId,
        likedBy:req.user?._id
    })


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {isLiked:true}
            )
        )
})





const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params

    if(!isValidObjectId(tweetId))
      throw new ApiError(400,`Invalid ${tweetId}`)


    const likedAlready=await Likes.findOne({
        tweet:tweetId,
        likedBy:req.user?._id
    })


    if(likedAlready)
    {
        await Likes.findByIdAndDelete(likedAlready?._id)


        return res
          .status(200)
          .json(
            new ApiResponse(
                200,
                {isLiked:false}
            )
          )
    }



    await Likes.create({
        tweet:tweetId,
        likedBy:req.user?._id
    })

    return res
      .status(200)
      .json(
          new ApiResponse(
            200,
            {isLiked:true}
          )
      )
})




const getLikedVideo=asyncHandler(async(req,res)=>{

    const likedVideoAggregate=await Likes.aggregate([
        {
            $match:{
                likedBy:req.user?._id
            }
        },
        {
            $lookup:{
                from:"video",
                localField:"video",
                foreignField:"_id",
                as:"likedVideo",
                pipeline:[
                    {
                        $lookup:{
                            from:"user",
                            localField:"owner",
                            foreignField:"_id",
                            as:"ownerDetails"
                        }
                    },
                    {
                        $unwind:"$ownerDetails"
                    }
                ]
            }
        },
        {
            $unwind:"$likedVideo"
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                _id:0,
                likedVideo:{
                   _id:1,
                    "videoFile.url":1,
                    "thumbnail.url":1,
                    owner:1,
                    title:1,
                    description:1,
                    view:1,
                    duration:1,
                    createdAt:1,
                    isPublished:1,
                    ownerDetails:{
                        username:1,
                        fullname:1,
                        "avatar.url":1
                    }
                }
            }
        }
    ])


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            likedVideoAggregate,
            "Liked video fetched sucessfully"
        )
      )
})



export {toggleCommentLike,toggleTweetLike,toggleVIdeoLike,getLikedVideo}