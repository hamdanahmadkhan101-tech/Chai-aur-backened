import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videofile: { type: String, required: true }, //cloudinary url
    thumbnail: { type: String, required: true }, //cloudinary url
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    duration: { type: Number, required: true }, // in seconds
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);