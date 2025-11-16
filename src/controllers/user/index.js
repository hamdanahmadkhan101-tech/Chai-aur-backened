// Re-export all user controller functions
export { registerUser } from './registration.controller.js';
export { loginUser, logoutUser, refreshAccessToken } from './auth.controller.js';
export { getCurrentUserProfile, updateUserProfile, changeCurrentUserPassword } from './profile.controller.js';
export { updateAvatar, updateCoverImage } from './media.controller.js';