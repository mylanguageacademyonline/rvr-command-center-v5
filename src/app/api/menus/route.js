import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MenuMaster from "@/models/MenuMaster";

export async function GET() {
  try {
    await dbConnect();
    const menus = await MenuMaster.find({}).sort({ menuName: 1 });
    return NextResponse.json(menus);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 });
  }
}
