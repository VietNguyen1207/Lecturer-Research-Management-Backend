const mongoose = require("mongoose");

// Define enum for disbursement status
const DisbursementStatus = {
  DRAFT: "DRAFT", // Initial state when lecturer is preparing request
  SUBMITTED: "SUBMITTED", // Submitted for OSM review
  UNDER_REVIEW: "UNDER_REVIEW", // Being reviewed by OSM
  APPROVED: "APPROVED", // Approved by OSM, waiting for accounting
  REJECTED: "REJECTED", // Rejected by OSM
  PROCESSING: "PROCESSING", // Being processed by accounting
  COMPLETED: "COMPLETED", // Money transferred, with proof
  CANCELLED: "CANCELLED", // Cancelled by lecturer or admin
};

// Define enum for disbursement types
const DisbursementType = {
  MILESTONE_COMPLETION: "MILESTONE_COMPLETION", // For completed milestones
  ADVANCE_PAYMENT: "ADVANCE_PAYMENT", // Advance payment for upcoming expenses
  REIMBURSEMENT: "REIMBURSEMENT", // Reimbursement for out-of-pocket expenses
  EQUIPMENT_PURCHASE: "EQUIPMENT_PURCHASE", // For purchasing equipment
  CONFERENCE_FEE: "CONFERENCE_FEE", // For conference registration fees
  TRAVEL_EXPENSE: "TRAVEL_EXPENSE", // For travel-related expenses
  OTHER: "OTHER", // Other types
};

const fundDisbursementSchema = new mongoose.Schema(
  {
    // Reference to the project
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    // Reference to milestone (if applicable)
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
    },
    // Reference to conference (if applicable)
    conferenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conference",
    },
    // Reference to journal (if applicable)
    journalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
    },
    // User requesting the disbursement (lecturer)
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Type of disbursement
    disbursementType: {
      type: String,
      enum: Object.values(DisbursementType),
      required: true,
    },
    // Title/purpose of the disbursement
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Detailed description
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Requested amount
    requestedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Approved amount (may differ from requested)
    approvedAmount: {
      type: Number,
      min: 0,
    },
    // Currency
    currency: {
      type: String,
      default: "USD",
      trim: true,
    },
    // Current status
    status: {
      type: String,
      enum: Object.values(DisbursementStatus),
      default: DisbursementStatus.DRAFT,
    },
    // Bank account details for transfer
    bankDetails: {
      accountName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      bankName: {
        type: String,
        trim: true,
      },
      branchCode: {
        type: String,
        trim: true,
      },
      swiftCode: {
        type: String,
        trim: true,
      },
    },
    // Supporting documents (receipts, invoices, etc.)
    supportingDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    // OSM review details
    osmReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewDate: Date,
      comments: String,
      status: {
        type: String,
        enum: ["APPROVED", "REJECTED", "PENDING"],
      },
    },
    // Accounting department processing details
    accountingProcess: {
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      processDate: Date,
      transactionId: String,
      paymentMethod: {
        type: String,
        enum: ["BANK_TRANSFER", "CHECK", "CASH", "OTHER"],
      },
      paymentDate: Date,
      comments: String,
      // Reference to proof of payment document
      proofOfPaymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    },
    // Budget category
    budgetCategory: {
      type: String,
      trim: true,
    },
    // Fiscal year
    fiscalYear: {
      type: String,
      trim: true,
    },
    // Submission date
    submissionDate: Date,
    // Expected disbursement date
    expectedDisbursementDate: Date,
    // Actual disbursement date
    actualDisbursementDate: Date,
    // History of status changes
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(DisbursementStatus),
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        comments: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
fundDisbursementSchema.statics.DisbursementStatus = DisbursementStatus;
fundDisbursementSchema.statics.DisbursementType = DisbursementType;

// Add indexes for frequently queried fields
fundDisbursementSchema.index({ projectId: 1 });
fundDisbursementSchema.index({ requestedBy: 1 });
fundDisbursementSchema.index({ status: 1 });
fundDisbursementSchema.index({ "osmReview.reviewedBy": 1 });
fundDisbursementSchema.index({ "accountingProcess.processedBy": 1 });
fundDisbursementSchema.index({ submissionDate: -1 });
fundDisbursementSchema.index({ disbursementType: 1 });

// Pre-save middleware to update status history
fundDisbursementSchema.pre("save", function (next) {
  // If status is changed, add to status history
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      // If this is a new document, changedBy will be set by the controller
      // Otherwise, it should be set before saving
    });

    // Set submission date when status changes to SUBMITTED
    if (this.status === DisbursementStatus.SUBMITTED && !this.submissionDate) {
      this.submissionDate = new Date();
    }
  }

  next();
});

// Method to submit disbursement request
fundDisbursementSchema.methods.submit = function (userId) {
  if (this.status !== DisbursementStatus.DRAFT) {
    throw new Error(`Cannot submit disbursement in ${this.status} status`);
  }

  this.status = DisbursementStatus.SUBMITTED;
  this.submissionDate = new Date();

  // Add to status history
  this.statusHistory.push({
    status: DisbursementStatus.SUBMITTED,
    changedBy: userId,
    changedAt: new Date(),
    comments: "Disbursement request submitted for review",
  });

  return this.save();
};

// Method for OSM to review disbursement
fundDisbursementSchema.methods.review = function (
  userId,
  status,
  comments,
  approvedAmount
) {
  if (
    this.status !== DisbursementStatus.SUBMITTED &&
    this.status !== DisbursementStatus.UNDER_REVIEW
  ) {
    throw new Error(`Cannot review disbursement in ${this.status} status`);
  }

  this.status =
    status === "APPROVED"
      ? DisbursementStatus.APPROVED
      : DisbursementStatus.REJECTED;

  this.osmReview = {
    reviewedBy: userId,
    reviewDate: new Date(),
    comments: comments,
    status: status,
  };

  if (status === "APPROVED" && approvedAmount !== undefined) {
    this.approvedAmount = approvedAmount;
  }

  // Add to status history
  this.statusHistory.push({
    status: this.status,
    changedBy: userId,
    changedAt: new Date(),
    comments: comments,
  });

  return this.save();
};

// Method for accounting to process disbursement
fundDisbursementSchema.methods.process = function (userId, transactionData) {
  if (this.status !== DisbursementStatus.APPROVED) {
    throw new Error(`Cannot process disbursement in ${this.status} status`);
  }

  this.status = DisbursementStatus.PROCESSING;

  // Add to status history
  this.statusHistory.push({
    status: DisbursementStatus.PROCESSING,
    changedBy: userId,
    changedAt: new Date(),
    comments: "Disbursement is being processed by accounting",
  });

  this.accountingProcess = {
    processedBy: userId,
    processDate: new Date(),
    ...transactionData,
  };

  return this.save();
};

// Method to complete disbursement
fundDisbursementSchema.methods.complete = function (
  userId,
  proofOfPaymentId,
  comments
) {
  if (this.status !== DisbursementStatus.PROCESSING) {
    throw new Error(`Cannot complete disbursement in ${this.status} status`);
  }

  this.status = DisbursementStatus.COMPLETED;
  this.actualDisbursementDate = new Date();

  // Update accounting process
  this.accountingProcess.proofOfPaymentId = proofOfPaymentId;
  this.accountingProcess.paymentDate = new Date();
  this.accountingProcess.comments = comments;

  // Add to status history
  this.statusHistory.push({
    status: DisbursementStatus.COMPLETED,
    changedBy: userId,
    changedAt: new Date(),
    comments: comments || "Disbursement completed with proof of payment",
  });

  return this.save();
};

// Static method to find pending disbursements for OSM review
fundDisbursementSchema.statics.findPendingForOSM = function () {
  return this.find({
    status: DisbursementStatus.SUBMITTED,
  })
    .populate("requestedBy", "name email")
    .populate("projectId", "projectName projectType")
    .sort({ submissionDate: 1 });
};

// Static method to find approved disbursements for accounting
fundDisbursementSchema.statics.findApprovedForAccounting = function () {
  return this.find({
    status: DisbursementStatus.APPROVED,
  })
    .populate("requestedBy", "name email")
    .populate("projectId", "projectName projectType")
    .populate("osmReview.reviewedBy", "name email")
    .sort({ "osmReview.reviewDate": 1 });
};

// Static method to get disbursement statistics
fundDisbursementSchema.statics.getStatistics = async function (fiscalYear) {
  return this.aggregate([
    {
      $match: {
        fiscalYear: fiscalYear,
        status: {
          $in: [DisbursementStatus.APPROVED, DisbursementStatus.COMPLETED],
        },
      },
    },
    {
      $group: {
        _id: "$disbursementType",
        count: { $sum: 1 },
        totalRequested: { $sum: "$requestedAmount" },
        totalApproved: { $sum: "$approvedAmount" },
        avgProcessingTime: {
          $avg: {
            $subtract: [
              { $ifNull: ["$osmReview.reviewDate", new Date()] },
              "$submissionDate",
            ],
          },
        },
      },
    },
    {
      $project: {
        disbursementType: "$_id",
        count: 1,
        totalRequested: 1,
        totalApproved: 1,
        avgProcessingDays: {
          $divide: ["$avgProcessingTime", 1000 * 60 * 60 * 24],
        },
      },
    },
  ]);
};

module.exports = mongoose.model("FundDisbursement", fundDisbursementSchema);
