import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import * as xlsx from "xlsx";

export async function GET() {
  try {
    // 1. Defensively connect to DB
    await dbConnect();

    // 2. Fetch data safely
    const vendors = await Vendor.find({}).sort({ balanceDue: -1 }).lean();
    
    // Fallback if no vendors exist
    if (!vendors || vendors.length === 0) {
      return NextResponse.json({ error: "No vendor data available to export." }, { status: 404 });
    }

    // 3. Format data for Excel
    const dataForExcel = vendors.map((v, index) => ({
      "S.No": index + 1,
      "Vendor Name": v.vendorName || "Unknown",
      "Category": v.category || "Uncategorized",
      "Need to Pay (₹)": v.balanceDue > 0 ? v.balanceDue : 0,
      "Already Paid (₹)": v.balanceDue < 0 ? Math.abs(v.balanceDue) : 0,
      "Net Balance (₹)": v.balanceDue || 0,
      "Status": (v.balanceDue && v.balanceDue > 0) ? "Outstanding" : "Cleared",
      "Last Updated": v.updatedAt ? new Date(v.updatedAt).toLocaleDateString() : "N/A"
    }));

    // 4. Create Workbook and Worksheet
    const worksheet = xlsx.utils.json_to_sheet(dataForExcel);
    
    // Add column widths for better UX
    worksheet["!cols"] = [
      { wch: 5 },  // S.No
      { wch: 30 }, // Vendor Name
      { wch: 20 }, // Category
      { wch: 15 }, // Need to Pay
      { wch: 15 }, // Already Paid
      { wch: 15 }, // Net Balance
      { wch: 15 }, // Status
      { wch: 15 }  // Last Updated
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Vendor_Ledger");

    // 5. Generate Excel Buffer
    const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

    // 6. Return standard file download response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Vendor_Ledger_Export_${new Date().toISOString().split('T')[0]}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

  } catch (error) {
    console.error("[EXPORT_API_ERROR]", error);
    // Absolute Error Containment
    return NextResponse.json({ error: "Failed to generate Excel export", details: error?.message }, { status: 500 });
  }
}
