import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: [true, "Vendor name is required"],
  },
  category: {
    type: String,
    required: [true, "Vendor category is required"],
  },
  balanceDue: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
