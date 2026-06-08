import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import Transaction from "@/models/Transaction";

export async function POST(req) {
  try {
    await dbConnect();
    const { vendorId, amountPaid, paymentMode, details, receiptUrl } = await req.json();

    if (!vendorId || !amountPaid || !paymentMode) {
      return NextResponse.json({ error: "Missing vendorId, amountPaid, or paymentMode" }, { status: 400 });
    }

    const amount = Number(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "amountPaid must be a positive number" }, { status: 400 });
    }

    // 1. Find vendor and deduct from balanceDue
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    vendor.balanceDue -= amount;
    await vendor.save();

    // 2. Log transaction in ledger
    const transaction = await Transaction.create({
      type: "PAID",
      details: details || `Paid ₹${amount.toLocaleString()} to ${vendor.vendorName} via ${paymentMode}`,
      amount: amount,
      referenceId: vendorId,
      referenceModel: "Vendor",
      receiptUrl: receiptUrl || null
    });

    return NextResponse.json({ 
      success: true, 
      message: "Payment logged successfully and vendor balance updated.",
      data: {
        vendorName: vendor.vendorName,
        newBalanceDue: vendor.balanceDue,
        transactionId: transaction._id
      }
    });

  } catch (error) {
    console.error("[PAID_ENGINE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
