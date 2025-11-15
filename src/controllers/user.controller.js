import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../model/user.model.js';
import {uploadOncloudinary} from '../utils/fileUpload.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateAccessandRefreshtoken=async(userId)=>{
  try{
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}
  }
  catch{
   throw new ApiError(500,"Something went wrong while generate access and refresh token") 
  }
}

const registration=asyncHandler(async(req,res)=>{
   //get user detail from frontend
   //validate
   //check if user already exist:username,email
   //check image,check avatar
   //upload them to cloudinary
   //create user object-create entry in db
   //remove password and refresh token from response
   //check for user create
   //return response


   const {fullname,email,password,username}=req.body

    if([fullname,email,username,password].some((field)=>field?.trim()==""))
      throw new ApiError(400,"All field are required");


    const existUser=await User.findOne({$or:[{username},{email}]})

    if(existUser)
      throw new ApiError(400,"User with email or username already exist")

    const avatarLocalPath=req.files?.avatar[0]?.path
    
    // const coverLocalPathh=req.files?.coverImage[0]?.path

    let coverLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
      coverLocalPath=req.files.coverImage[0].path

    // console.log("Avatar local path:", avatarLocalPath);
    if(!avatarLocalPath)
      throw new ApiError(400,"Avatar file is required")

    const avatar=await uploadOncloudinary(avatarLocalPath)
    const coverImage=await uploadOncloudinary(coverLocalPath)

    // console.log("Avatar:", avatar); // after uploadOncloudinary
    if(!avatar)
      throw new ApiError(400,"Avatar file is required")


    const user=await User.create({
        fullname,avatar:avatar.url,coverImage:coverImage?.url || "",email,password,username:username.toLowerCase()
    })

    const checkUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!checkUser)
      throw new ApiError(500,"Something went wrong while registering the user")

    return res.status(201).json(
        new ApiResponse(200,checkUser,"User register successfully")
    )
})





const loginUser=asyncHandler(async(req,res)=>{
  //req.body->data
  //username or email
  //check user exist
  //password check
  //access token or refresh token generate
  //send coookies


  const {email,username,password}=req.body;

  if (!username && !email)
    throw new ApiError(400,"username or email is required")

                              //if both
  // if (!username || !email))
  //   throw new ApiError(404,"username and email is required")

  const user=await User.findOne({
    $or:[{username},{email}]
  })


  if(!user)
    throw new ApiError(404,"User does not exist")
  
  const isPasswordValid = await user.isPasswordCorrect(password);

  
  if(!isPasswordValid)
    throw new ApiError(401,"Invalid user Credentials")

  const {accessToken,refreshToken}=await generateAccessandRefreshtoken(user._id);


  const loggedInUser=await User.findById(user._id).select("-password -refreshToken")


  const option={
    httpOnly:true,
    secure:true,
    sameSite: "None"   // for cross-site cookie (frontend & backend different domains)
  }


  return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
      new ApiResponse(
      200,
      {
        user:loggedInUser,accessToken,refreshToken
      },
      "User logging successfully",
    )
  )
})


const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshToken:1    //this remove the field from document 
      }
    },
    {
      new:true
    }
  )

  const option={
    httpOnly:true,
    secure:true,
    sameSite: "None"   // for cross-site cookie (frontend & backend different domains)
  }


  return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
      new ApiResponse(
      200,
      {},
      "User logged out successfully"
    )
  )
})



const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingrefreshToken=req.cookies.refreshToken || req.body.refreshToken

  if(!incomingrefreshToken)
    throw new ApiError(401,"Unauthorize access")

try {
    const decodedToken=jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
    const user=await User.findById(decodedToken?._id)
  
    if(!user)
      throw new ApiError(401,"Invalid refresh Token")
  
  
    if(incomingrefreshToken!==user?.refreshToken)
      throw new ApiError(401,"Refresh token is expired or used")
  
  
    const option={
      httpOnly:true,
      secure:true,
      sameSite: "None"   // for cross-site cookie (frontend & backend different domains)
    }
  
  
    const {accessToken,newrefreshToken}=await generateAccessandRefreshtoken(user._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",newrefreshToken,option)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,refreshToken:newrefreshToken
        },
        "Access token is refresh"
      )
    )
} 
catch (error) {
  throw new ApiError(401,error?.message || "Invalid refresh token")
}
})


const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword,confirmPassword}=req.body

  if(!(newPassword===confirmPassword))
    throw new ApiError(400, "New password and confirm password do not match");

  const user=await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect)
    throw new ApiError(400,"Invalid old Password")

  user.password=newPassword
  user.save({ValidateBeforeSave:false})

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "Password change Successfully"
    ))
})


const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      req.user,
      "Current user fetched successfully"
    )
  )
})



const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body


  if(!fullname || !email)
    throw new ApiError(400,"All field are required")


  const user=User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname,
        email
      }
    },
    {new:true}
  ).select("-password")


  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Account details now updated successfully"
    )
  )
})



const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarLocalpath=req.file?.path

  if(!avatarLocalpath)
    throw new ApiError(400,"Avatar file is missing")

  const avatar=await uploadOncloudinary(avatarLocalpath)

  if(!avatar.url)
    throw new ApiError(400,"Error while uploading on avatar")

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new:true}
  ).select("-password")


  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Avatar Image updated successfully"
    )
  )
})


const updateUsercoverImage=asyncHandler(async(req,res)=>{
  const coverImageLocalpath=req.file?.path

  if(!coverImageLocalpath)
    throw new ApiError(400,"Cover Image file is missing")

  const coverImage=await uploadOncloudinary(coverImageLocalpath)

  if(!coverImage.url)
    throw new ApiError(400,"Error while uploading on cover Image")

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Cover Image updated successfully"
    )
  )
})



const getUserChannelProfile=asyncHandler(async(req,res)=>{
  const {username}=req.params

  if(!username?.trim())
    throw new ApiError(400,"username is missing")

  const channel=await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }
    },
    {
      $lookup:{
        from:"subscription",
        localField:"_id",
        foreignField: "channel",
        as:"subscribers"
      }
    },
    {
      $lookup:{
        from:"subscription",
        localField:"_id",
        foreignField: "subscriber",
        as:"subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount:{
          $size:"$subscribers"
        },
        channelSubscribedToCount:{
          $size:"$subscribedTo"
        },
        isSubscribed:{
          $cond:{
            if:{$in:[req.user?._id,"$subscribers.subscriber"]},
            then:true,
            else:false
          }
        }
      }
    },
    {
      $project:{
        _id:1,
        fullname:1,
        username:1,
        subscribersCount:1,
        channelSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,
        email:1,
        "timestamps.createdAt": 1
      }
    }
  ])

  if(!channel?.length)
    throw new ApiError(400,"channel doest not exists")


  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      channel[0],
      "User channel fetched successfully"
    )
  )
})




const getWatchHistory=asyncHandler(async(req,res)=>{
  const user=await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"Video",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1
                  }
                },
                {
                  $addFields:{
                    owner:{
                      $first:"$owner"
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "Watch history fetched successfully"
    )
  )
})



export {registration,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUsercoverImage,getUserChannelProfile,getWatchHistory};