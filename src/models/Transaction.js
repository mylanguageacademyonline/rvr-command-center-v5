import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["IN", "OUT", "PAID"],
    required: [true, "Transaction type is required"],
  },
  details: {
    type: String,
    required: [true, "Transaction details are required"],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Vendor', 'QuoteInvoice', 'Inventory']
  }
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
