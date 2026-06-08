import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import QuoteInvoice from "@/models/QuoteInvoice";

export async function GET() {
  try {
    await dbConnect();
    const quotes = await QuoteInvoice.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: quotes ?? [] });
  } catch (error) {
    console.error("[GET_QUOTES_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch quotes", data: [] }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Defensive Validation
    if (!body?.clientName || !body?.pax || !body?.totalAmount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newQuote = await QuoteInvoice.create({
      clientName: body.clientName,
      pax: body.pax,
      totalAmount: body.totalAmount,
      advancePaid: body?.advancePaid ?? 0,
      status: body?.status ?? "Draft",
    });

    return NextResponse.json({ success: true, data: newQuote }, { status: 201 });
  } catch (error) {
    console.error("[POST_QUOTE_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to create quote", details: error?.message }, { status: 500 });
  }
}
