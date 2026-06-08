import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RecipeMaster from "@/models/RecipeMaster";
import Inventory from "@/models/Inventory";

export async function POST(request) {
  try {
    const { menuItemId, pax } = await request.json();

    if (!menuItemId || !pax) {
      return NextResponse.json({ error: "Missing menuItemId or pax" }, { status: 400 });
    }

    await dbConnect();

    // Fetch the RecipeMaster for the menuItemId and populate inventory items
    const recipe = await RecipeMaster.findOne({ menuItem: menuItemId })
      .populate('rawMaterials.inventoryItem');

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found for this menu item" }, { status: 404 });
    }

    // Multiply each rawMaterial.quantityPerServing by pax
    const calculatedMaterials = recipe.rawMaterials.map((rm) => {
      const item = rm.inventoryItem;
      // Defensive: Inventory item might have been deleted (e.g. during sheet sync)
      if (!item) return null;

      const totalQuantityRequired = rm.quantityPerServing * pax;
      
      return {
        inventoryId: item._id,
        itemName: item.itemName,
        category: item.category,
        currentStock: item.currentStock,
        requiredQuantity: totalQuantityRequired,
        sufficientStock: item.currentStock >= totalQuantityRequired
      };
    }).filter(Boolean);
    
    return NextResponse.json({ 
      message: "BoM generated successfully",
      data: {
        menuItemId,
        pax,
        calculatedMaterials
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

