import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/user/index.js";
import { uploadImage, uploadVideo } from "../middlewares/multer.middleware.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();
// Import your middleware and controllers here

router.route("/register").post(
  uploadImage.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
//secured route
router.route("/logout").post(authenticateUser, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
