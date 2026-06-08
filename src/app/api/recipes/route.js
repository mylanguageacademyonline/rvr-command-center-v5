import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RecipeMaster from "@/models/RecipeMaster";
import MenuMaster from "@/models/MenuMaster";
import Inventory from "@/models/Inventory";

export async function GET() {
  try {
    await dbConnect();

    // Populate menuItem and rawMaterials.inventoryItem
    const recipes = await RecipeMaster.find({})
      .populate("menuItem")
      .populate("rawMaterials.inventoryItem")
      .exec();

    // Also fetch all menus in case there are menus without a recipe yet, 
    // but usually a BoM is just for menus that have a recipe.
    // Let's just return recipes for now, or group by menu.
    
    return NextResponse.json({ success: true, data: recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}
