import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import User from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import * as jwt from "jsonwebtoken";

//Generate access and refresh tokens

const generateAccessAndRefreshTokens = async function (userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};
const registerUser = asyncHandler(async (req, res, next) => {
  // Registration logic here
  // get users details from req.body
  //validaion - not empty
  //check if user already exisits: username||email
  //check for Images,avatar=required
  //upload to cloudinary, check for avatar if uploaded or not
  //create user object-create entry in db
  //remove password and refresh token from response
  //check for user creation
  //return response

  const { fullName, username, email, password } = req.body;

  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  // Check if user exists BEFORE processing files
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(409, "User with given email or username already exists");
  }

  // Only process files if user doesn't exist
  const avatarFilesPath = req.files?.avatar?.[0]?.path;
  const coverImagePath = req.files?.coverImage?.[0]?.path || null;
  if (!avatarFilesPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload to cloudinary first
  const avatar = await uploadToCloudinary(avatarFilesPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  let coverImage = null;
  if (coverImagePath) {
    coverImage = await uploadToCloudinary(coverImagePath);
  }

  // Create user with cloudinary URLs
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // Remove password from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res.status(201).json({
    ...new apiResponse(201, createdUser, "User registered successfully"),
  });
});

const loginUser = asyncHandler(async (req, res, next) => {
  // Login logic here
  // req.body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookie
  // send response

  const { username, email, password } = req.body;

  if (!(username?.trim() || email?.trim()) || !password?.trim()) {
    throw new ApiError(400, "Username or email and password are required");
  }

  const user = await User.findOne({
    $or: [{ username: username?.toLowerCase() }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isCorrectPassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json({
      ...new apiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged in successfully"
      ),
    });
});

const logoutUser = asyncHandler(async (req, res, next) => {
  // Logout logic here
  // Clear cookies
  // Send response

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new apiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  // Refresh access token logic here
  // Get refresh token from cookies
  // Verify refresh token
  // Generate new access token
  // Send response

  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
