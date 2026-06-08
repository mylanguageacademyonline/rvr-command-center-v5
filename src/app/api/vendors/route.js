import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";

export async function GET() {
  try {
    await dbConnect();
    const vendors = await Vendor.find({}).sort({ vendorName: 1 }).lean();
    return NextResponse.json({ success: true, data: vendors ?? [] });
  } catch (error) {
    console.error("[GET_VENDORS_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch vendors" }, { status: 500 });
  }
}
