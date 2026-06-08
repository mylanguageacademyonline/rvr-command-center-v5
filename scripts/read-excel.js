const xlsx = require('xlsx');
const path = require('path');

const filePath = "C:\\Users\\DELL\\Downloads\\rvr mockup and samples\\RVR_Catering_Vendor_Tracker_April_2026 (2).xlsx";

try {
  const workbook = xlsx.readFile(filePath);
  const vendors = [];

  for (const sheetName of workbook.SheetNames) {
    if (sheetName.includes('SUMMARY') || sheetName.includes('Summary') || sheetName.includes('Log')) continue;

    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    if (data.length < 3) continue;

    if (vendors.length === 0) {
      console.log("DEBUG FIRST VENDOR:", sheetName);
      console.log("Row 0:", data[0]);
      console.log("Row 1:", data[1]);
      console.log("Row 2:", data[2]);
    }

    // Attempt simple parsing
    // Row 0 usually has category at index 3
    const categoryRaw = data[0][3] || data[0][2] || data[0][1] || "Unknown";
    const category = typeof categoryRaw === 'string' ? categoryRaw.replace('Category:', '').trim() : "Unknown";

    // Row 2 usually has balance at index 2
    const balanceDue = Number(data[2][2]) || 0;

    vendors.push({
      vendorName: sheetName,
      category,
      balanceDue
    });
  }
  
  console.log("Parsed Vendors:");
  console.table(vendors);
} catch (error) {
  console.error("Error reading excel file:", error);
}
