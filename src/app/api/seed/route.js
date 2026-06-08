import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Role from "@/models/Role";
import Inventory from "@/models/Inventory";
import Vendor from "@/models/Vendor";

export async function GET() {
  try {
    await dbConnect();

    // 1. Wipe existing demo data
    await Role.deleteMany({});
    await Inventory.deleteMany({});
    await Vendor.deleteMany({});

    // 2. Seed Custom Roles
    const rolesToSeed = [
      { name: "Executive Chef", permissions: ["ACCESS_KITCHEN_LEDGER", "ACCESS_BOM", "ACCESS_IN_OUT", "ACCESS_VENDORS"] },
      { name: "Sales Rep", permissions: ["ACCESS_QUOTES", "ACCESS_KITCHEN_LEDGER"] },
      { name: "Bartender", permissions: ["ACCESS_IN_OUT"] }
    ];
    await Role.insertMany(rolesToSeed);

    // 3. Seed Realistic Inventory
    const inventoryToSeed = [
      { itemName: "Wagyu Beef Ribeye", category: "Meats", unit: "kg", currentStock: 15, minStock: 5, unitCost: 4500 },
      { itemName: "Premium Saffron", category: "Spices", unit: "g", currentStock: 50, minStock: 20, unitCost: 800 },
      { itemName: "Heirloom Tomatoes", category: "Produce", unit: "kg", currentStock: 30, minStock: 15, unitCost: 120 },
      { itemName: "Truffle Oil", category: "Pantry", unit: "bottle", currentStock: 8, minStock: 10, unitCost: 1500 }, // Low stock trigger
      { itemName: "Arborio Rice", category: "Pantry", unit: "kg", currentStock: 25, minStock: 10, unitCost: 300 },
      { itemName: "Scottish Salmon", category: "Seafood", unit: "kg", currentStock: 12, minStock: 8, unitCost: 2200 },
      { itemName: "Aged Parmesan", category: "Dairy", unit: "kg", currentStock: 4, minStock: 5, unitCost: 1800 }, // Low stock trigger
      { itemName: "Beluga Caviar", category: "Seafood", unit: "tin", currentStock: 5, minStock: 5, unitCost: 12000 },
      { itemName: "Fresh Basil", category: "Produce", unit: "bunch", currentStock: 40, minStock: 20, unitCost: 40 },
      { itemName: "San Marzano Tomatoes", category: "Pantry", unit: "can", currentStock: 60, minStock: 30, unitCost: 180 }
    ];
    await Inventory.insertMany(inventoryToSeed);

    // 4. Seed Realistic Vendors
    const vendorsToSeed = [
      { vendorName: "Sysco Premium", category: "General Supplier", balanceDue: 45000 },
      { vendorName: "Farm Fresh Greens", category: "Produce", balanceDue: 12500 },
      { vendorName: "Oceanic Catch", category: "Seafood", balanceDue: 0 },
      { vendorName: "Spice Route Inc", category: "Pantry", balanceDue: 8200 }
    ];
    await Vendor.insertMany(vendorsToSeed);

    return NextResponse.json({
      success: true,
      message: `Demo environment seeded! Added ${rolesToSeed.length} Roles, ${inventoryToSeed.length} Items, and ${vendorsToSeed.length} Vendors.`,
    });
  } catch (error) {
    console.error("[SEEDING_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed demo environment" },
      { status: 500 }
    );
  }
}
