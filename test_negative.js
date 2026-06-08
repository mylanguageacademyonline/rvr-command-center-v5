import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const InventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  currentStock: { type: Number, required: true, min: 0 }
});
const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);

async function testConstraints() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  try {
    const item = new Inventory({ itemName: "Test Constrain Item", currentStock: -5 });
    await item.save();
    console.log("❌ FAILED: Saved negative stock successfully (it shouldn't have)");
  } catch (err) {
    if (err.name === 'ValidationError') {
      console.log("✅ SUCCESS: Mongoose correctly blocked the negative stock. Error:", err.message);
    } else {
      console.log("⚠️ Unknown error:", err);
    }
  }
  
  process.exit();
}

testConstraints();
