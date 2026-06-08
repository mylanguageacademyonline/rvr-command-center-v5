import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import QuoteInvoice from "@/models/QuoteInvoice";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing quote ID" }, { status: 400 });
    }

    const body = await req.json();
    if (!body?.status) {
      return NextResponse.json({ success: false, error: "Missing status field" }, { status: 400 });
    }

    const validStatuses = ["Draft", "Confirmed", "Completed", "Cancelled"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    const updatedQuote = await QuoteInvoice.findByIdAndUpdate(
      id,
      { $set: { status: body.status } },
      { new: true, runValidators: true }
    );

    if (!updatedQuote) {
      return NextResponse.json({ success: false, error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedQuote });
  } catch (error) {
    console.error("[PATCH_QUOTE_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to update quote status", details: error?.message }, { status: 500 });
  }
}
