import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { unstable_cache } from "next/cache";

const getCachedInventory = unstable_cache(
  async () => {
    await dbConnect();
    // Use .select() to prevent sending massive payloads over the wire
    const inventory = await Inventory.find({})
      .select("itemName emoji currentStock minStock unit category")
      .sort({ itemName: 1 })
      .lean();
    
    // Serialize ObjectIds for Next.js cache compatibility
    return inventory.map(item => ({
      ...item,
      _id: item._id.toString()
    }));
  },
  ['inventory-list-v1'],
  { tags: ['inventory-data'] }
);

export async function GET() {
  try {
    const auth = await requireAuth(["ACCESS_IN_OUT", "ACCESS_BOM", "ACCESS_QUOTES", "ACCESS_KITCHEN_LEDGER"]);
    if (auth.error) return auth.error;

    // Fetch from RAM cache instead of MongoDB
    const inventory = await getCachedInventory();
    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
