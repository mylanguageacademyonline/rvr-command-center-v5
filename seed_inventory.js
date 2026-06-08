import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const InventorySchema = new mongoose.Schema({
  itemCode: { type: String, unique: true },
  category: { type: String, required: true },
  itemName: { type: String, required: true },
  currentStock: { type: Number, required: true, default: 0, min: 0 },
  minStock: { type: Number, default: 0, min: 0 }
});
const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Read the CSV we downloaded previously
  const rawData = fs.readFileSync('C:/Users/DELL/.gemini/antigravity-ide/brain/4e496017-e2b2-4ee2-b181-fe009f772dd7/.system_generated/steps/804/content.md', 'utf-8');
  
  // Parse CSV (ignoring markdown header)
  const lines = rawData.split('\n');
  const items = [];
  let started = false;

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('I001')) started = true; // Start parsing at first item
    
    if (started && line && line.includes(',')) {
      // Split safely on comma, but handle quotes if any (though looking at the CSV, there are none except for "Tooth Pick 6""")
      // Actually, regex is safer: split by comma but ignore commas inside quotes
      const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      
      // Fallback simple split if regex fails or is weird
      const simpleParts = line.split(',');
      if (simpleParts.length >= 3) {
         let code = simpleParts[0];
         let category = simpleParts[1];
         let name = simpleParts.slice(2, simpleParts.length - 1).join(',').replace(/"/g, ''); // Join back names with commas, strip quotes
         
         items.push({
           itemCode: code,
           category: category,
           itemName: name,
           currentStock: 0,
           minStock: 0
         });
      }
    }
  }

  console.log(`Parsed ${items.length} items from CSV.`);

  if (items.length > 0) {
    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log("Cleared existing inventory.");

    // Insert new
    await Inventory.insertMany(items);
    console.log(`Successfully seeded ${items.length} master inventory items!`);
  } else {
    console.log("Error: No items parsed. Please check parsing logic.");
  }

  process.exit();
}

seed();
