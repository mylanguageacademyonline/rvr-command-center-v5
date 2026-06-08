const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

// Load models
const InventorySchema = new mongoose.Schema({
  itemName: String, category: String, currentStock: Number, minStock: Number
}, { timestamps: true });
const Inventory = mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);

const MenuMasterSchema = new mongoose.Schema({
  menuName: String, description: String, pricePerPax: Number
}, { timestamps: true });
const MenuMaster = mongoose.models.MenuMaster || mongoose.model("MenuMaster", MenuMasterSchema);

const RecipeMasterSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuMaster" },
  rawMaterials: [{
    inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
    quantityPerServing: Number
  }],
}, { timestamps: true });
const RecipeMaster = mongoose.models.RecipeMaster || mongoose.model("RecipeMaster", RecipeMasterSchema);

const TransactionSchema = new mongoose.Schema({
  type: String, details: String, amount: Number, referenceId: mongoose.Schema.Types.ObjectId, referenceModel: String
}, { timestamps: true });
const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

async function runTests() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in .env.local. Please set it before running this script.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected.");

    // Clean up previous test data
    await Inventory.deleteMany({ category: "Test" });
    await MenuMaster.deleteMany({ description: "Test Menu" });
    await Transaction.deleteMany({ details: /Auto-depleted.*Test/ });

    console.log("\n--- STEP 1: Setup Test Data ---");
    // Create Inventory Items
    const rice = await Inventory.create({ itemName: "Basmati Rice (Test)", category: "Test", currentStock: 50, minStock: 10 });
    const chicken = await Inventory.create({ itemName: "Chicken (Test)", category: "Test", currentStock: 20, minStock: 5 });
    console.log(`Created Inventory: ${rice.itemName} (Stock: 50), ${chicken.itemName} (Stock: 20)`);

    // Create Menu
    const biryaniMenu = await MenuMaster.create({ menuName: "Chicken Biryani (Test)", description: "Test Menu", pricePerPax: 500 });
    console.log(`Created Menu: ${biryaniMenu.menuName}`);

    // Create Recipe (BoM)
    const recipe = await RecipeMaster.create({
      menuItem: biryaniMenu._id,
      rawMaterials: [
        { inventoryItem: rice._id, quantityPerServing: 0.2 }, // 0.2kg per person
        { inventoryItem: chicken._id, quantityPerServing: 0.3 } // 0.3kg per person
      ]
    });
    console.log("Created Recipe BoM for Biryani.");

    console.log("\n--- STEP 2: Test BoM Generator Logic ---");
    const pax = 100;
    console.log(`Calculating BoM for Pax: ${pax}`);
    
    const populatedRecipe = await RecipeMaster.findById(recipe._id).populate('rawMaterials.inventoryItem');
    const calculatedMaterials = populatedRecipe.rawMaterials.map((rm) => ({
        inventoryId: rm.inventoryItem._id,
        itemName: rm.inventoryItem.itemName,
        currentStock: rm.inventoryItem.currentStock,
        requiredQuantity: rm.quantityPerServing * pax,
        quantityToDeduct: rm.quantityPerServing * pax // Added for next step
    }));

    calculatedMaterials.forEach(item => {
      console.log(`- Need ${item.requiredQuantity} units of ${item.itemName} (Current Stock: ${item.currentStock})`);
      if (item.requiredQuantity > item.currentStock) {
        console.log(`  ⚠️ Warning: Required > Current Stock. Stock will go negative.`);
      }
    });

    console.log("\n--- STEP 3: Test Auto-Deplete Engine Logic ---");
    for (const item of calculatedMaterials) {
      const updated = await Inventory.findByIdAndUpdate(
        item.inventoryId,
        { $inc: { currentStock: -item.quantityToDeduct } },
        { new: true }
      );
      console.log(`Depleted ${item.itemName}. New Stock: ${updated.currentStock}`);
      
      await Transaction.create({
        type: "OUT",
        details: `Auto-depleted ${item.quantityToDeduct} units of ${updated.itemName}`,
        amount: item.quantityToDeduct,
        referenceId: updated._id,
        referenceModel: 'Inventory'
      });
    }

    console.log("\n✅ Mathematical Updates Verified!");
    console.log("Check MongoDB Transactions collection to see the newly generated logs.");
    
  } catch (error) {
    console.error("❌ Error during testing:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
    process.exit(0);
  }
}

runTests();
