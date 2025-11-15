import mongoose from "mongoose";
import {DB_name} from '../constants.js'


const DBconnect=async()=>{
    try{
        const connectionInstant=await mongoose.connect(`${process.env.MONGOOSE_URL}/${DB_name}`)
        console.log(`Mongoose connect || DB_host: ${connectionInstant.connection.host}`)
    }
    catch(error){
        console.log("MongoDB connection Failed",error)
        process.exit(1);
    }
}


export default DBconnect;