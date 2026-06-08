const https = require('https');
const xlsx = require('xlsx');

const url = 'https://docs.google.com/spreadsheets/d/1xO5K1L8jBBTGj0Vb_PvzQXU62DEh4h2H/export?format=xlsx';

https.get(url, (res) => {
  const data = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    console.log('Sheet Names:', workbook.SheetNames);
    
    workbook.SheetNames.forEach(sheetName => {
      console.log(`\n--- Sheet: ${sheetName} ---`);
      const sheet = workbook.Sheets[sheetName];
      const json = xlsx.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 5);
      console.log(JSON.stringify(json, null, 2));
    });
  });
}).on('error', (err) => {
  console.error('Error fetching sheet:', err.message);
});
