import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MenuMaster from "@/models/MenuMaster";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    await dbConnect();
    const menuItems = await MenuMaster.find({}).sort({ menuName: 1 }).lean();
    return NextResponse.json({ success: true, data: menuItems ?? [] });
  } catch (error) {
    console.error("[GET_MENU_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body?.menuName || !body?.pricePerPax) {
      return NextResponse.json({ success: false, error: "Missing required menu fields" }, { status: 400 });
    }

    const newItem = await MenuMaster.create({
      menuName: body.menuName,
      description: body?.description ?? "",
      pricePerPax: body.pricePerPax
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error("[POST_MENU_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to create menu item", details: error?.message }, { status: 500 });
  }
}
