// Using promise 
const asyncHandler =(requestHandler)=>{
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err)=> next(err))
    }
}

export {asyncHandler};

/* Using try-catch utility function */
/*const asyncHandler1 = (fn) => async(req, res, next) => {
    try {
        await fn(req, res, next)
        
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}
export default asyncHandler1 */