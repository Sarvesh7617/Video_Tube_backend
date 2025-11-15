import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';




cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});




const uploadOncloudinary=async(localfilepath)=>{
    try{
        if(!localfilepath)
        return {success:false}
        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localfilepath,
            {
                resource_type:'auto'
            })

        let deleted = false;
        if (fs.existsSync(localfilepath))
        {
            fs.unlinkSync(localfilepath)
            deleted = true;
        }
        return {
            ...response,
            localDeleted:deleted,
            success:true
        };               //return the url of file after uploaded
    }
    catch(error){
        //remove the locally saved temporary file as the upload operation got failed
        if (fs.existsSync(localfilepath))
            fs.unlinkSync(localfilepath)
        return { success: false };
    }
}



const deleteOnCloudinary=async(public_id,resource_type="image")=>{
    try{
        if(!public_id)
          return null;


        const result=await cloudinary.uploader.destroy(
            public_id,
            {
            resource_type:`${resource_type}`
            }
        )
    }
    catch(error){
        console.log("Delete on cloudinary failed",error);
        return error;
    }
}

export {uploadOncloudinary,deleteOnCloudinary}