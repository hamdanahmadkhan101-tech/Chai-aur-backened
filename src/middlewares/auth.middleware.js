import asyncHandler from "../utils/asyncHandler.js";
import * as jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import User from "../models/user.models.js";

// Authentication middleware - verifies access token
export const authenticateUser = asyncHandler(async (req, _, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken || 
      req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiError(401, "Access token is missing");
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
