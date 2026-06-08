import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/requireAuth";

export async function POST(request) {
  try {
    const auth = await requireAuth(["ACCESS_IN_OUT", "ACCESS_BOM"]);
    if (auth.error) return auth.error;

    const { inventoryId, amountToRemove } = await request.json();

    if (!inventoryId || !amountToRemove) {
      return NextResponse.json({ error: "Missing inventoryId or amountToRemove" }, { status: 400 });
    }

    await dbConnect();

    // 1. Defensively find the item first to ensure it exists
    const item = await Inventory.findById(inventoryId);
    if (!item) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    // 2. Perform the atomic update
    const updatedInventory = await Inventory.findByIdAndUpdate(
      inventoryId,
      { $inc: { currentStock: -amountToRemove } },
      { new: true }
    );

    // 3. Log the transaction securely
    await Transaction.create({
      type: "OUT",
      details: `Manually removed ${amountToRemove} units of ${updatedInventory.itemName}`,
      amount: amountToRemove,
      referenceId: updatedInventory._id,
      referenceModel: "Inventory"
    });

    // Instantly update the Frontline dashboard cache
    revalidateTag("inventory-data");

    return NextResponse.json({
      message: "Item debited successfully",
      data: { currentStock: updatedInventory.currentStock }
    });

  } catch (error) {
    console.error("Manual OUT Engine Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
