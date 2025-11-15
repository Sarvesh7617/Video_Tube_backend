import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";    //for complex query


const videoSchema=new mongoose.Schema({
    videoFile: {
        type: {
            url: String,
            public_id: String,
        },
        required: true,
    },
    thumbnail: {
        type: {
            url: String,
            public_id: String,
        },
        required: true,
    },
    title:{
        type:String,       
        required:true
    },
    description:{
        type:String,        
        required:true
    },
    duration:{
        type:Number,         //cloudinary url
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})



videoSchema.plugin(mongooseAggregatePaginate)


export const Video=mongoose.model("Video",videoSchema)