const xlsx = require("xlsx");

try {
  const workbook = xlsx.readFile("data_new.xlsx");
  const sheets = workbook.SheetNames;
  console.log("SHEETS:", sheets.join(", "));

  sheets.forEach(sheetName => {
    console.log(`\n--- SHEET: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    // Print first 5 rows to see structure
    for(let i=0; i<Math.min(5, rows.length); i++) {
       console.log(`Row ${i}:`, JSON.stringify(rows[i]));
    }
  });
} catch(e) {
  console.error(e);
}
