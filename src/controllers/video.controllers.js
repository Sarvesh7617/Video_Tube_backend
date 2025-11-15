import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Video} from "../model/video.model.js";
import {User} from "../model/user.model.js"
import {Likes} from "../model/likes.model.js"
import {Comment} from "../model/comment.model.js"
import {asyncHandler} from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import {uploadOncloudinary,deleteOnCloudinary} from "../utils/fileUpload.js";
import { socket } from "../app.js";
import path from "path";
import fs from "fs";



const getAllVideo=asyncHandler(async(req,res)=>{
    const {page=1,limit=10,query,sortBy,sortType,userId}=req.query


    console.log(userId)


    const pipeline=[]



    // for using Full Text based search u need to create a search index in mongoDB atlas
    // you can include field mapppings in search index eg.title, description, as well
    // Field mappings specify which fields within your documents should be indexed for text search.
    // this helps in seraching only in title, desc providing faster search results
    // here the name of search index is 'search-videos'


    if(query)
    {
        pipeline.push({
            $search:{
                index:"search-video",
                text:{
                    query,
                    path:["title","description"]
                }
            }
        })
    }


    if(userId)
    {
        if(!mongoose.isValidObjectId(userId))
          throw new ApiError(400,`Invalid ${userId}`)


        pipeline.push({
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        })
    }



    pipeline.push({
        $match:{
            isPublished:true
        }
    })



    //sortBy can be views, createdAt, duration
    //sortType can be ascending(-1) or descending(1)


    if(sortBy && sortType)
    {
        pipeline.push({
            $sort:{
                [sortBy]:sortType==="asc"?1:-1
            }
        })
    }
    else
      pipeline.push({
        $sort:{createdAt:-1}
    })



    pipeline.push(
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
                        "avatar.url":1
                    }
                  }
              ]
            }
        },
        {
            $unwind:"$ownerDetails"
        }
    )



    const aggregate = Video.aggregate(pipeline);


    const option={
        page:parseInt(page,10),
        limit:parseInt(limit,10)
    }



    const video = await Video.aggregatePaginate(aggregate, option);


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            video,
            "Video fetched sucessfully"
        )
      )
})




const publishAVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body


    if([title,description].some((field)=>field?.trim()===""))
      throw new ApiError(400,"Title and description both are required")



    const videoFilePath=req.files?.videoFile[0].path


    const thumbnailLocalPath = req.files?.thumbnail[0].path



    if(!videoFilePath)
      throw new ApiError(400,"Video file path is required")



    if(!thumbnailLocalPath)
      throw new ApiError(400,"thumbnail file path is required")


    socket.emit("tempPath", {
        videoFilePath,
        thumbnailLocalPath,
    });  


    let progress = 0;

    socket.emit('uploadProgress', {
       progress: (progress = 25) 
    });

    const videoFile = await uploadOncloudinary(videoFilePath);
    if (videoFile.success) {
        progress = progress === 25 ? 60 : 90;
        socket.emit('uploadProgress', { progress});
    }

    const thumbnail = await uploadOncloudinary(thumbnailLocalPath);
    if (thumbnail.success) {
        progress = progress === 25 ? 60 : 90;
        socket.emit('uploadProgress', { progress});
    }



    if (videoFile.success && thumbnail.success) {
        socket.emit('uploadProgress', { 
          progress: (progress = 100) 
        });
    }



    if(!videoFile)
      throw new ApiError(400,"Video file not found")


    if(!thumbnail)
      throw new ApiError(400,"Thumbnail not found")



    const video=await Video.create({
        title,
        description,
        duration:videoFile.duration,
        videoFile:{
            url:videoFile.url,
            public_id:videoFile.public_id
        },
        thumbnail:{
            url:thumbnail.url,
            public_id:thumbnail.public_id
        },
        owner:req.user?._id,
        isPublished:false
    })
    const videoUpload=await Video.findById(video._id)

    if(!videoUpload)
      throw new ApiError(500,"Video upload failed please try again")

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {
            video,
            progress
            },
            "Video uploaded sucessfully"
        )
      )
})



const cancelUpload = asyncHandler(async (req,_) => {
  const { videoFilePath, thumbnailPath } = req.body;

  
  if (videoFilePath && fs.existsSync(videoFilePath)) 
    fs.unlinkSync(videoFilePath);

  if (thumbnailPath && fs.existsSync(thumbnailPath))
    fs.unlinkSync(thumbnailPath);
});




const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params



    if(!mongoose.isValidObjectId(videoId))
      throw new ApiError(400,`Invalid ${videoId}`)


    if(!mongoose.isValidObjectId(req.user?._id))
      throw new ApiError(400,`Invalid ${req.user?._id}`)



    const video=await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
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
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $lookup:{
                            from:"subscription",
                            localField:"_id",
                            foreignField:"channel",
                            as:"subscribers"
                        }
                    },
                    {
                        $addFields:{
                            subscriberCount:{
                                $size:"$subscribers"
                            },
                            isSubscribed:{
                                $cond:{
                                    if:{$in:[req.user?._id,"subscribers.subscriber"]},
                                    then:true,
                                    else:false
                                }
                            }
                        }
                    },
                    {
                        $project:{
                            username:1,
                            "avatar.url":1,
                            subscriberCount:1,
                            isSubscribed:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                },
                owner:{
                    $first:"$owner"
                },
                isLiked:{
                  $cond:{
                      if:{$in:[req.user?._id,"$likes.likedBy"]},
                      then:true,
                      else:false
                  }
                }
            }
        },
        {
            $project:{
                "videoFile.url":1,
                title:1,
                description:1,
                views:1,
                createdAt:1,
                duration:1,
                comment:1,
                owner:1,
                likesCount:1,
                isLiked:1
            }
        }
    ])



    if(!video)
      throw new ApiError(500,"Failed to fetched video")


    // increment views if video fetched successfully

    await Video.findByIdAndUpdate(
        videoId,
        {
            $inc:{views:1}
        }
    )


     // add this video to user watch history

     await User.findByIdAndUpdate(
        req.user?._id,
        {
            $addToSet:{
                watchHistory:videoId
            }
        }
    )


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            video[0],
            "Video details fetched sucessfully"
        )
      )
})





const updateVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body

    const {videoId}=req.params


    if(!mongoose.isValidObjectId(videoId))
      throw new ApiError(400,`Invalid ${videoId}`)


    
    if(!(title && description))
      throw new ApiError(400,"Title and description both are required")



    const video=await Video.findById(videoId)



    if(!video)
      throw new ApiError(404,"Video not found")



    if(video?.owner.toString()!==req.user?._id.toString())
      throw new ApiError(400,"Only owner can edit their video")


    //deleting old thumbnail and updating with new one

    const thumbnailToDelete=video.thumbnail.public_id


    const thumbnailLocalPath=req.file?.path


    if(!thumbnailLocalPath)
      throw new ApiError(400,"Thumbnail is required")



    const thumbnail=await uploadOncloudinary(thumbnailLocalPath)


    if(!thumbnail)
      throw new ApiError(400,"Thumbnail not found")


    const updateVideo=await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail:{
                    url:thumbnail.url,
                    public_id:thumbnail.public_id
                }
            }
        },
        {new:true}
    )



    if(!updateVideo)
      throw new ApiError(500,"Failed to update video please try again")


    if(updateVideo)
      await deleteOnCloudinary(thumbnailToDelete)


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            updateVideo,
            "Video updated sucessfully"
        )
      )
})




const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params


    if(!mongoose.isValidObjectId(videoId))
      throw new ApiError(400,`Invalid ${videoId}`)


    const video=await Video.findById(videoId)


    if(!video)
      throw new ApiError(404,"Video not found")



    if(video?.owner.toString()!==req.user?._id.toString())
      throw new ApiError(400,"Only owner can delete their video")



    const videoDeleted=await Video.findByIdAndDelete(videoId)


    if(!videoDeleted)
      throw new ApiError(400,"Failed to delete video please try again")



    await deleteOnCloudinary(video.thumbnail.public_id)                                   // video model has thumbnail public_id stored in it->check videoModel
    await deleteOnCloudinary(video.videoFile.public_id,"video")                       // specify video while deleting video



    await Likes.deleteMany({video:videoId})


    await Comment.deleteMany({video:videoId})


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {},
            "video is deleted sucessfully"
        )
      )
})




const togglePublishStatus=asyncHandler(async(req,res)=>{
    const {videoId}=req.params


    if(!mongoose.isValidObjectId(videoId))
      throw new ApiError(400,`Invalid ${videoId}`)



    const video=await Video.findById(videoId)


    if(!video)
      throw new ApiError(404,"Video not found")


    if(video?.owner.toString()!==req.user?._id.toString())
      throw new ApiError(400,"Only owner can publish or unpublish their video")


    
    const toggleVideoPublish=await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished:!video.isPublished
            }
        },
        {new:true}
    )



    if(!toggleVideoPublish)
      throw new ApiError(500,"Failed to toggle video Publish please try again")



    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {isPublished:toggleVideoPublish.isPublished},
            "Video publish toggled sucessfully"
        )
      )
})






export {togglePublishStatus,cancelUpload,getAllVideo,publishAVideo,getVideoById,updateVideo,deleteVideo}