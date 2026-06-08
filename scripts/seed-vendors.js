const xlsx = require('xlsx');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Load models
const VendorSchema = new mongoose.Schema({
  vendorName: String,
  category: String,
  balanceDue: Number,
}, { timestamps: true });

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);

const filePath = "C:\\Users\\DELL\\Downloads\\rvr mockup and samples\\RVR_Catering_Vendor_Tracker_April_2026 (2).xlsx";

async function seedVendors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    console.log("Connected to MongoDB for Vendor Seeding.");

    const workbook = xlsx.readFile(filePath);
    const vendors = [];

    for (const sheetName of workbook.SheetNames) {
      if (sheetName.includes('SUMMARY') || sheetName.includes('Summary') || sheetName.includes('Log')) continue;

      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      
      if (data.length < 3) continue;

      // Extract Category from Row 1
      let category = "General";
      const row1 = data[1] || [];
      if (typeof row1[0] === 'string' && row1[0].includes('Category:')) {
        category = row1[0].replace('Category:', '').trim();
      } else if (typeof data[0][3] === 'string' && data[0][3].includes('Category:')) {
        category = data[0][3].replace('Category:', '').trim();
      }

      // Extract Balance Due from Row 3 (Balance Row)
      const row3 = data[3] || [];
      let balanceDue = 0;
      
      // Some sheets might have different structures, let's find the first number in the Balance row
      // or calculate it from Row 2 (TOTAL row)
      const row2 = data[2] || [];
      let needToPay = 0;
      let alreadyPaid = 0;
      
      // Look for Need to Pay and Already Paid headers in Row 1 to find their indexes
      let needToPayIndex = 3;
      let alreadyPaidIndex = 5;
      
      for(let i=0; i<row1.length; i++) {
        if(typeof row1[i] === 'string' && row1[i].includes('Need to Pay')) needToPayIndex = i;
        if(typeof row1[i] === 'string' && row1[i].includes('Already Paid')) alreadyPaidIndex = i;
      }

      needToPay = Number(row2[needToPayIndex]) || 0;
      alreadyPaid = Number(row2[alreadyPaidIndex]) || 0;
      
      balanceDue = needToPay - alreadyPaid;

      vendors.push({
        vendorName: sheetName.trim(),
        category,
        balanceDue
      });
    }

    console.log(`Found ${vendors.length} vendors to insert.`);
    
    // Clear existing
    await Vendor.deleteMany({});
    console.log("Cleared existing vendors.");

    // Insert
    await Vendor.insertMany(vendors);
    console.log("Successfully seeded Vendor collection!");
    console.table(vendors);

    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
}

seedVendors();
