import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MenuMaster from "@/models/MenuMaster";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    await dbConnect();
    const menus = await MenuMaster.find({}).sort({ menuName: 1 });
    return NextResponse.json(menus);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 });
  }
}
