import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {Tweets} from "../model/tweets.model.js"
import mongoose from "mongoose";



const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body


    if(!content)
      throw new ApiError(400,"Content is required")


    const tweet=await Tweets.create({
        content,
        owner:req.user?._id
    })



    if(!tweet)
      throw new ApiError(500,"Failed to create tweet please try again")


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet is created sucessfully"
        )
      )
})




const updateTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body
    const {tweetId}=req.params;


    if(!content)
      throw new ApiError(400,"Content is required")


    if(!mongoose.isValidObjectId(tweetId))
      throw new ApiError(400,`Invalid ${tweetId}`)



    const tweet=await Tweets.findById(tweetId)


    if(!tweet)
      throw new ApiError(404,"Tweet not found")



    if(tweet?.owner.toString()!==req.user?._id.toString())
      throw new ApiError(400,"Only owner can edit their content")


    const updateTweet=await Tweets.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content,
            }
        },
        {new:true}
    )


    if(!updateTweet)
      throw new ApiError(500,"Failed to update tweet")


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            updateTweet,
            "Tweet is updated sucessfully"
        )
      )

})




const deleteTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params


    if(!mongoose.isValidObjectId(tweetId))
      throw new ApiError(400,`Invalid ${tweetId}`)



    const tweet=await Tweets.findById(tweetId)


    if(!tweet)
      throw new ApiError(404,"Tweet not found")



    if(tweet?.owner.toString()!==req.user?._id.toString())
      throw new ApiError(400,"Only owner can delete their tweet")



    await Tweets.findByIdAndUpdate(tweetId)



    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            tweetId,
            "Tweet delete sucessfully"
        )
      )
})



const getUserTweets=asyncHandler(async(req,res)=>{
    const {userId}=req.params


    if(!mongoose.isValidObjectId(userId))
      throw new ApiError(400,`Invalid ${userId}`)



    const tweet=await Tweets.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likedDetails",
                pipeline:[
                    {
                        $project:{
                            likedBy:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likedDetails"
                },
                ownerDetails:{
                    $first:"$ownerDetails"
                },
                isLiked:{
                    $cond:{
                        if:{$in:[req.user?._id,"$likedDetails.likedBy"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                content:1,
                ownerDetails:1,
                likesCount:1,
                createdAt:1,
                isLiked:1
            }
        }
    ])



    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet fetched sucessfully"
        )
      )
})



export {createTweet,getUserTweets,deleteTweet,updateTweet}