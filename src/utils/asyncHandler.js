                    //same with promise
// const asyncHandler=(requestHandler)=>{
//     (req,res,next)=>{
//         Promise.resolve(requestHandler(req,res,next)).
//         catch((err)=>next(err))
//     }
// }




// below this higher order func->which accept func as parameter or return func
const asyncHandler = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    console.error("Error caught in asyncHandler:", error); // Optional, for debugging

    const statusCode = typeof error.statusCode === 'number'
      ? error.statusCode
      : typeof error.status === 'number'
        ? error.status
        : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};



export {asyncHandler};