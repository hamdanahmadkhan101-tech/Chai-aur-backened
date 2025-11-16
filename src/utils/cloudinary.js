import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

// Debug logging
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "***hidden***" : "undefined"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "my_cloud",
  api_key: process.env.CLOUDINARY_API_KEY || "my_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "my_secret",
});

export const uploadToCloudinary = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist at the specified path");
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("Upload to Cloudinary successful:", result.url);
    // Remove the local file after upload
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log("Local file deleted:", filePath);
    }
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
