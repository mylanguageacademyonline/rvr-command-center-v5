import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  try {
    const auth = await requireAuth(["ACCESS_VENDORS", "ACCESS_KITCHEN_LEDGER"]);
    if (auth.error) return auth.error;

    await dbConnect();
    const vendors = await Vendor.find({}).sort({ vendorName: 1 }).lean();
    return NextResponse.json({ success: true, data: vendors ?? [] });
  } catch (error) {
    console.error("[GET_VENDORS_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch vendors" }, { status: 500 });
  }
}
