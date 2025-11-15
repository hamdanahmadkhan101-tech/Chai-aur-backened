import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { uploadImage, uploadVideo } from "../middlewares/multer.middleware.js";

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

export default router;
