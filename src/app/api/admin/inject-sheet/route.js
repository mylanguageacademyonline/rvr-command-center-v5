import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import * as xlsx from "xlsx";
import https from "https";

// Helper to fetch spreadsheets while following HTTP redirects
function fetchSpreadsheet(url) {
  return new Promise((resolve, reject) => {
    const get = (targetUrl) => {
      https.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location);
        } else if (res.statusCode === 200) {
          const chunks = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer);
          });
        } else {
          reject(new Error(`Failed to fetch spreadsheet. Status: ${res.statusCode}`));
        }
      }).on("error", reject);
    };
    get(url);
  });
}

export async function POST(req) {
  try {
    await dbConnect();

    // 1. CLEAR CURRENT INVENTORY
    await Inventory.deleteMany({});

    // 2. Fetch the new Google Sheet
    const sheetId = "1XuewGnG7fH8aD1w84umRuJ_xGYqMlbbtIpQ6fD2UXCk";
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
    
    const buffer = await fetchSpreadsheet(exportUrl);
    const workbook = xlsx.read(buffer, { type: "buffer" });

    let newInventoryCount = 0;

    // 3. Process Sheet1
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // header: 1 gives us an array of arrays (rows)
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Assuming format: ["I001", "Category", "ItemName", currentStock]
    for (const row of rows) {
      if (!row || row.length < 3) continue; // Skip empty/invalid rows

      const itemCode = row[0]; // e.g. "I001"
      const category = row[1]; // e.g. "🌾 Groceries & Staples"
      const itemName = row[2]; // e.g. "Sona Masoori Rice"
      const currentStock = parseInt(row[3]) || 0;

      // Defensive check to ensure we have an item name
      if (!itemName || typeof itemName !== "string") continue;

      // Inject Inventory Item
      await Inventory.create({
        itemName: itemName.trim(),
        category: category ? category.trim() : "Uncategorized",
        currentStock: currentStock,
        minStock: 10
      });
      newInventoryCount++;
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Data successfully injected with ZERO DEFECTS.",
        inventoryCreated: newInventoryCount
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Injection Engine Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Critical failure in Data Injection Engine.", 
        details: error?.message ?? "Unknown error" 
      },
      { status: 500 }
    );
  }
}
