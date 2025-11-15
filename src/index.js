import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `Server is running on port https://localhost:${process.env.PORT}`
      );
      app.on("error", (err) => {
        console.log("Error connecting to the server:", err);
        throw new Error("some error occured while connecting to server");
      });
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!!", err);
  });

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
