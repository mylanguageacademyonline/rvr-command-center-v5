import mongoose from "mongoose";

const MenuMasterSchema = new mongoose.Schema({
  menuName: {
    type: String,
    required: [true, "Menu name is required"],
  },
  description: {
    type: String,
  },
  pricePerPax: {
    type: Number,
    required: [true, "Price per pax is required"],
    default: 0
  }
}, { timestamps: true });

export default mongoose.models.MenuMaster || mongoose.model("MenuMaster", MenuMasterSchema);
