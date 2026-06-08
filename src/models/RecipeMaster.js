import mongoose from "mongoose";

const RecipeMasterSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuMaster",
    required: true,
  },
  rawMaterials: [{
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    quantityPerServing: {
      type: Number,
      required: true,
    }
  }],
}, { timestamps: true });

export default mongoose.models.RecipeMaster || mongoose.model("RecipeMaster", RecipeMasterSchema);
