import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { inventoryId, amountToAdd } = await req.json();

    if (!inventoryId || amountToAdd === undefined) {
      return NextResponse.json({ error: "Missing inventoryId or amountToAdd" }, { status: 400 });
    }

    const amount = Number(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "amountToAdd must be a positive number" }, { status: 400 });
    }

    const item = await Inventory.findByIdAndUpdate(
      inventoryId,
      { $inc: { currentStock: amount } },
      { new: true }
    );

    if (!item) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    await Transaction.create({
      type: "IN",
      details: "Added " + amount + " to " + item.itemName,
      amount: amount,
      referenceId: inventoryId,
      referenceModel: "Inventory"
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}