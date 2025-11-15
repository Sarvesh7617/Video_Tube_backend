import mongoose from "mongoose"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Comment } from "../model/comment.model.js"
import {Likes} from "../model/likes.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"



const getVideoComment=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {page=1,limit=10}=req.query

    const video=await Video.findById(videoId)

    if(!video)
      throw new ApiError(404,"Video not found")


    const commentsAggregate=Comment.aggregate([
    {
        $match:{
            video:new mongoose.Types.ObjectId(videoId)
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
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"comment",
            as:"likes"
        }
    },
    {
        $addFields:{
            likesCount:{
                $size:"$likes"
            },
            owner:{
                $first:"$owner"      //first->bcu lookup return always array if single owner
            },
            isLiked:{
                $cond:{
                    if:{$in:[req.user?._id,$likes.likedBy]},
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
            createdAt:1,
            likesCount:1,
            owner:{
                username:1,
                fullname:1,
                "avatar.url":1
            },
            isLiked:1
        }
    }
])


const option={
    page:parseInt(page,10),
    limit:parseInt(limit,10)
}

const comment=await Comment.mongooseAggregatePaginate(
    commentsAggregate,
    option
);

return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comments fetched successfully"
        )
    )
})



// add a comment to video

const addComment=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {content}=req.body;

    if(!content)
      throw new ApiError(400,"Content is required")


    const video=await Video.findById(videoId)

    if(!video)
      throw new ApiError(404,"Video not found")


    const comment=await Comment.create({
        content,
        video:videoId,
        owner:req.user?._id
    })


    if(!comment)
      throw new ApiError(500,"Failed to add comment pls try again")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "Comment is added sucessfully"
            )
        )
})




const updateComment=asyncHandler(async(req,res)=>{
    const {content}=req.body
    const {commentId}=req.params

    if(!content)
      throw new ApiError(400,"Content is required")


    const comment=await Comment.findById(commentId)

    if(!comment)
      throw new ApiError(404,"Comment not found")


    // const comment=await Comment.create({
    //     content,
    //     video:videoId,
    //     owner:req.user?._id
    // })

    if(comment?.owner.toString()!==req.user?._id.toString())
      throw new ApiError(400,"Only comment owner can edit their comment")


    const updateComment=await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set:{
                content
            }
        },
        {new:true}
    )


    if(!updateComment)
      throw new ApiError(500,"Failed to updated Comment")


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updateComment,
                "Comment updated sucessfully"
            )
        )
})




const deleteComment=await asyncHandler(async(req,res)=>{
    const {commentId}=req.params

    const comment=await Comment.findById(commentId)

    if(!comment)
      throw new ApiError(404,"Comment not found")


    if(comment?.owner.toString()!==req.user?._id.toString())
      throw new ApiError(400,"Only comment owner can delete their comment")


    await Comment.findByIdAndDelete(commentId)


    await Likes.deleleMany({comment:commentId})


    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {commentId},
            "Comment delete sucessfully"
        )
      )
})




export {getVideoComment,addComment,updateComment,deleteComment}