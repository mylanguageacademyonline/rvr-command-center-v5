const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('C:\\Users\\DELL\\Downloads\\rvr mockup and samples\\data.xlsx');
  console.log('Sheet Names:', workbook.SheetNames);
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 10);
    console.log(JSON.stringify(json, null, 2));
  });
} catch (e) {
  console.error('Error:', e);
}
