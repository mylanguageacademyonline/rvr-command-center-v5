import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: [true, "Vendor name is required"],
    trim: true,
    maxlength: [100, "Vendor name cannot exceed 100 characters"]
  },
  category: {
    type: String,
    required: [true, "Vendor category is required"],
    trim: true
  },
  balanceDue: {
    type: Number,
    default: 0,
    min: [0, "Vendor balance due mathematically cannot be less than zero"]
  },
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
