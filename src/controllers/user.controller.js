import asyncHandler from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res, next) => {
  // Registration logic here
  res
    .status(201)
    .json({ success: true, message: "User registered successfully,congratulations!!!" });
});
export { registerUser };

// const loginUser = asyncHandler(async (req, res, next) => {
//     // Login logic here
//     res.status(200).json({ success: true, message: 'User logged in successfully' });
// });
// export { loginUser };
