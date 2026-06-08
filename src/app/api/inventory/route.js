import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  try {
    const auth = await requireAuth(["ACCESS_IN_OUT", "ACCESS_BOM", "ACCESS_QUOTES", "ACCESS_KITCHEN_LEDGER"]);
    if (auth.error) return auth.error;

    await dbConnect();
    const inventory = await Inventory.find({}).sort({ itemName: 1 });
    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
