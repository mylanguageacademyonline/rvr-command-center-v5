import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, "Item name is required"],
    trim: true,
    maxlength: [100, "Item name cannot exceed 100 characters"]
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true
  },
  currentStock: {
    type: Number,
    required: [true, "Current stock is required"],
    default: 0,
    min: [0, "Stock cannot be mathematically negative"]
  },
  minStock: {
    type: Number,
    required: [true, "Minimum stock level is required"],
    default: 0,
    min: [0, "Minimum stock cannot be negative"]
  },
}, { timestamps: true });

export default mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);
