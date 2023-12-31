import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

// Register users in db 
// 1. send post request to the server (get users detail from frontend/postman)
// 2. Validation - not empty 
// 3. check if the user exists, if exists cannot register again => return
//      Note : check using username or email
// 4. check for images, check for avatar -> required in schema 
// 5. upload them to cloudanary, check avatar -> cloudanary provides an url
// 6. create user object - create entry in db (Encrypt the password before saving the user inforation to db)
// 7. remove password and refresh token field from response
// 8. check for user creation 
// 9. return response 

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body
    console.log('email: ', email)

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All Fields are required !")
    }

    const existedUser = User.findOne({
        $or:[{ username }, { email }]
    })
    if(existedUser) throw new ApiError(409, "Username or email already exists!")

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) throw new ApiError(400, "Avatar is required !")

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) throw new ApiError(400, "Avatar file is requird !")

    const user = await User.create({
        fullname, 
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500, "Something went wrong while registering User")
    
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully !" )
    ) 
})

export { registerUser }