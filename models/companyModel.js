const mongoose = require("mongoose");

const CompanyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    headquarters: {
      country: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
    },
    size: {
      type: String,
      required: true,
    },
    foundedYear: {
      type: Number,
      required: true,
    },
    mission: {
      type: String,
      required: true,
    },
    vision: {
      type: String,
      required: true,
    },
    values: [String],
    specialties: [String],
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
    },
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/d_avatar.png/non_existing_id.png",
    },
    positions: [
      {
        type: String,
        requiired: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyProfile", CompanyProfileSchema);
