import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import User from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

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
    coverImage: coverImage?.url || ""
  });

  // Remove password from response
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res.status(201).json({
    ...new apiResponse(201, createdUser, "User registered successfully"),
  });
});

export { registerUser };
