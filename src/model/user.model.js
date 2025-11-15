import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username must be required"],
        lowercase:true,
        unique:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:[true,"Email must be required"],
        lowercase:true,
        unique:true,
        trim:true
    },
    fullname:{
        type:String,
        required:[true,"Fullname must be required"],
        unique:true,
        index:true
    },
    avatar:{
        type:String,         //cloudinary url
        required:true
    },
    coverImage:{
        type:String,        //cloudinary url
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password must be required"]
    },
    refreshToken:{
        type:String
    }

},{timestamps:true})


userSchema.pre("save",async function (next)
    {
        if(!this.isModified("password"))
           return next();
        this.password=await bcrypt.hash(this.password,10)           //encrypt
        next();
    }
)


userSchema.methods.isPasswordCorrect=async function(password)
{
    return await bcrypt.compare(password,this.password);         //decrpty then compare
}


userSchema.methods.generateAccessToken=function()
{
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken=function()
{
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema)