import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a role name"],
    unique: true,
  },
  permissions: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model("Role", RoleSchema);
