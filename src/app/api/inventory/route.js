import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const inventory = await Inventory.find({}).sort({ itemName: 1 });
    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
