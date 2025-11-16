import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import User from "../../models/user.models.js";

export const getCurrentUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, { user }, "User profile fetched successfully"));
});


export const updateUserProfile = asyncHandler(async (req, res, next) => {
  const { fullName, username, email } = req.body;

  if (!fullName?.trim() || !username?.trim() || !email?.trim()) {
    throw new ApiError(400, "Full name, username, and email are required");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  // Check if username or email already exists (excluding current user)
  const existingUser = await User.findOne({
    $and: [
      { _id: { $ne: req.user._id } },
      { $or: [{ email }, { username: username.toLowerCase() }] },
    ],
  });

  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { fullName, username: username.toLowerCase(), email },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, { user }, "User profile updated successfully"));
});


export const changeCurrentUserPassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (
    !currentPassword?.trim() ||
    !newPassword?.trim() ||
    !confirmPassword?.trim()
  ) {
    throw new ApiError(
      400,
      "Current password, new password, and confirm password are required"
    );
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isCorrectPassword(currentPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"));
});