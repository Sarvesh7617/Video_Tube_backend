import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const playlistSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"]
    },
    description:{
        type:String,
        required:[true,"Description is required"]
    },
    video:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})



playlistSchema.plugin(mongooseAggregatePaginate)



export const Playlists=mongoose.model("Playlists",playlistSchema)