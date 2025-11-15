import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";


const router = Router();
// Import your middleware and controllers here

router.route("/register").post(registerUser);



export default router;