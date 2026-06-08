import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import Transaction from "@/models/Transaction";

export async function POST(request) {
  try {
    const { bomMaterials, referenceId } = await request.json();

    if (!bomMaterials || !Array.isArray(bomMaterials)) {
      return NextResponse.json({ error: "Invalid BoM array" }, { status: 400 });
    }

    await dbConnect();

    let depletedCount = 0;

    for (const item of bomMaterials) {
      if (!item.inventoryId || !item.requiredQuantity) continue;

      // 1. Deduct from inventory (allows negative values as per user request)
      const updatedInventory = await Inventory.findByIdAndUpdate(
        item.inventoryId,
        { $inc: { currentStock: -item.requiredQuantity } },
        { new: true }
      );

      // 2. Log the transaction
      if (updatedInventory) {
        await Transaction.create({
          type: "OUT",
          details: `Auto-depleted ${item.requiredQuantity} units of ${updatedInventory.itemName}`,
          amount: item.requiredQuantity,
          referenceId: referenceId || updatedInventory._id, // Ideally QuoteInvoice ID, but fallback to inventory ID
          referenceModel: referenceId ? 'QuoteInvoice' : 'Inventory'
        });
        depletedCount++;
      }
    }

    return NextResponse.json({ 
      message: `Auto-Deplete Engine executed successfully. Depleted ${depletedCount} items.`
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

