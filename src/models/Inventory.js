import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, "Item name is required"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
  },
  currentStock: {
    type: Number,
    required: [true, "Current stock is required"],
    default: 0,
  },
  minStock: {
    type: Number,
    required: [true, "Minimum stock level is required"],
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);
