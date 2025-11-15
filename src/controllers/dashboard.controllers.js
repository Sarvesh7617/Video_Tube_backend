import {asyncHandler} from "../utils/asyncHandler.js"
import { Subscription } from "../model/subscription.model.js";
import { Video } from "../model/video.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";





const getChannelStats=asyncHandler(async(req,res)=>{

    const user=req.user?._id


    const totalSubscribers=await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(user)
            }
        },
        {
            $group:{
                _id:null,
                subscriberCount:{
                    $sum:1
                }
            }
        }
    ])


    const video=await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(user)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $project:{
                _id:null,
                totalLikes:{
                    $sum:"$likes"
                },
                totalView:"$views",
                totalVideos:1
            }
        },
        {
            $group:{
                _id:null,
                totalLikes:{
                    $sum:"$totalLikes"
                },
                totalView:{
                    $sum:"$totalViews"
                },
                totalVideos:{
                    $sum:1
                }
            }
        }
    ])


    const channelStats={
        totalSubscribers:totalSubscribers[0]?.subscriberCount || 0,
        totalLikes:video[0]?.totalLikes || 0,
        totalView:video[0]?.totalView || 0,
        totalVideos:video[0]?.totalVideos || 0
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channelStats,
                "Channel stats fetched sucessfully"
            )
        )
})



const getChannelVideo=asyncHandler(async(req,res)=>{
    const user=req.user?.id


    const video=await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(user)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $addFields:{
                createdAt:{
                    $dateToParts:{date:"$createdAt"}
                },
                likesCount:{
                    $size:"$likes"
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
                _id:1,
                "videoFile.url":1,
                "thumbnail":1,
                title:1,
                description:1,
                createdAt:{
                    year:1,
                    month:1,
                    day:1,
                },
                isPublished:1,
                likesCount:1
            }
        }
    ])


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Channel video fetched sucessfully"
            )
        )
})



export {getChannelStats,getChannelVideo};