const mongoose = require("mongoose");

const OtpChallengeSchema = new mongoose.Schema(
  {
    purpose: {
      type: String,
      enum: ["register"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    lastSentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

OtpChallengeSchema.index({ purpose: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("OtpChallenge", OtpChallengeSchema);
