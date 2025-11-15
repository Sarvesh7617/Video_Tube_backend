import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../model/user.model.js";


export const verifyJWT=asyncHandler(async(req,_,next)=>{
    try {
        let token;

        if (req.cookies?.accessToken)
          token = req.cookies.accessToken;


        else if (req.header("Authorization") && req.header("Authorization").startsWith("Bearer "))
          token = req.header("Authorization").replace("Bearer ", "");


        if(!token)
          throw new ApiError(401,"Unauthorize request")
    
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user)
          throw new ApiError(401,"Invalid access Token")
    
        req.user=user
        next()
    } 
    catch (error) {
        throw new ApiError(401,error?.message || "Invalid access Token");
    }
    
})