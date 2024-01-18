import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccesssAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong !")
    }
}

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
    const { fullName, email, username, password } = req.body

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All Fields are required !")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) throw new ApiError(409, "Username or email already exists!")

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = (req.files?.coverImage?.[0]?.path || undefined);

    if (!avatarLocalPath) throw new ApiError(400, "Avatar is required !")

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) throw new ApiError(400, "Avatar file is requird !")

    const user = await User.create({
        fullName,
        avatar: avatar.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) throw new ApiError(500, "Something went wrong while registering User")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully !")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    /* ToDo:
        - get the login payload from frontend/request
        - Check if the user is registered 
        - if user exists, then verify password [password need to be encrypted to compare the hashes]
        - generate and return accesstoken and refresh token to user
        - send secure cookies 
        - send success responsey
    */
    const { username, email, password } = req.body
    
    console.log(email)
    
    if (!(username || email)) throw new ApiError(400, "Username or Email is required !")

    const existingUser = await User.findOne({ $or: [{username}, {email}] })

    if (!existingUser) throw new ApiError(400, "User doesnot exists !")

    const isPasswordValid = await existingUser.isPasswordCorrect(password)

    if (!isPasswordValid) throw new ApiError(401, "Password incorrect !")

    const { accessToken, refreshToken } = await generateAccesssAndRefreshTokens(existingUser._id)

    console.log("accessToken : ", accessToken)
    console.log("refreshToken : ", refreshToken)

    const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged In Successfully !"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, {
        new: true
    }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logout"))
})

export { registerUser, loginUser, logoutUser }