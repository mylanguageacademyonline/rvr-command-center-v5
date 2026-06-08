import mongoose from "mongoose";

const QuoteInvoiceSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, "Client name is required"],
  },
  pax: {
    type: Number,
    required: [true, "Number of pax is required"],
  },
  menuSelected: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuMaster",
  }],
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
  },
  advancePaid: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Draft", "Confirmed", "Completed", "Cancelled"],
    default: "Draft"
  }
}, { timestamps: true });

export default mongoose.models.QuoteInvoice || mongoose.model("QuoteInvoice", QuoteInvoiceSchema);
