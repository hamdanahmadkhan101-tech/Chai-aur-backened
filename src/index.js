import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";

const app = express();

dotenv.config({
  path: "./.env",
});


connectDB();




















/*
(async () => {
  try {
    const db = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log("DB is connected to", db.connection.host);
    app.on("error", (err) => {
      console.log("Error connecting to the server:", err);
      throw new Error("some error occured while connecting to server");
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.log("Error connecting to the database:", error);
    throw new Error("some error occured while connecting to database");
  }
})();
*/
