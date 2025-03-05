const mongoose = require("mongoose");

const ExpenseStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PAID: "PAID",
};

const conferenceExpenseSchema = new mongoose.Schema(
  {
    conferenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conference",
      required: true,
      unique: true, // One expense record per conference
    },
    travelExpense: Number,
    accommodationExpense: Number,
    registrationFee: Number,
    mealsExpense: Number,
    transportationExpense: Number,
    otherExpenses: [
      {
        description: String,
        amount: Number,
      },
    ],
    totalExpense: {
      type: Number,
      default: function () {
        // Calculate total from individual expenses
        let total = 0;
        if (this.travelExpense) total += this.travelExpense;
        if (this.accommodationExpense) total += this.accommodationExpense;
        if (this.registrationFee) total += this.registrationFee;
        if (this.mealsExpense) total += this.mealsExpense;
        if (this.transportationExpense) total += this.transportationExpense;

        // Add other expenses
        if (this.otherExpenses && this.otherExpenses.length > 0) {
          this.otherExpenses.forEach((expense) => {
            total += expense.amount || 0;
          });
        }

        return total;
      },
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: Object.values(ExpenseStatus),
      default: ExpenseStatus.PENDING,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    paymentDate: Date,
    paymentMethod: String,
    receiptUrls: [String],
    comments: String,
    // For tracking expense history/changes
    history: [
      {
        status: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        comment: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
conferenceExpenseSchema.statics.ExpenseStatus = ExpenseStatus;

// Add indexes
conferenceExpenseSchema.index({ conferenceId: 1 });
conferenceExpenseSchema.index({ status: 1 });
conferenceExpenseSchema.index({ requestedBy: 1 });

module.exports = mongoose.model("ConferenceExpense", conferenceExpenseSchema);
