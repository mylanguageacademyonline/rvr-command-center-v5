import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  role: {
    type: String,
    default: "Pending",
    required: [true, "Please specify a role"],
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  subscriptionActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
