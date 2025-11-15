import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
// Middlewares
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));

// Routes imports
import userRouter from "./routes/user.routes.js";


//routes declaration
app.use("/api/v1/users", userRouter);


export default app;
