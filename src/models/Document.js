const mongoose = require("mongoose");

// Define enum for document types
const DocumentType = {
  PROJECT_PROPOSAL: "PROJECT_PROPOSAL",
  RESEARCH_PAPER: "RESEARCH_PAPER",
  PRESENTATION: "PRESENTATION",
  REPORT: "REPORT",
  INVOICE: "INVOICE",
  RECEIPT: "RECEIPT",
  CONTRACT: "CONTRACT",
  APPROVAL_LETTER: "APPROVAL_LETTER",
  CONFERENCE_SUBMISSION: "CONFERENCE_SUBMISSION",
  CONFERENCE_ACCEPTANCE: "CONFERENCE_ACCEPTANCE",
  JOURNAL_SUBMISSION: "JOURNAL_SUBMISSION",
  JOURNAL_ACCEPTANCE: "JOURNAL_ACCEPTANCE",
  MILESTONE_DELIVERABLE: "MILESTONE_DELIVERABLE",
  EXPENSE_PROOF: "EXPENSE_PROOF",
  OTHER: "OTHER",
};

const documentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    // Optional reference to milestone if document is related to a specific milestone
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
    },
    // Optional reference to conference if document is related to a conference
    conferenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conference",
    },
    // Optional reference to journal if document is related to a journal
    journalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
    },
    // Optional reference to expense if document is a receipt/invoice
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConferenceExpense",
    },
    documentUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      enum: Object.values(DocumentType),
      required: true,
    },
    // File metadata
    fileSize: Number,
    fileExtension: String,
    mimeType: String,
    // Document status (e.g., draft, final)
    status: {
      type: String,
      enum: ["DRAFT", "FINAL", "ARCHIVED"],
      default: "FINAL",
    },
    // Document version tracking
    version: {
      type: Number,
      default: 1,
    },
    description: String,
    tags: [String],
    uploadBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
documentSchema.statics.DocumentType = DocumentType;

// Add indexes for frequently queried fields
documentSchema.index({ projectId: 1 });
documentSchema.index({ milestoneId: 1 });
documentSchema.index({ conferenceId: 1 });
documentSchema.index({ journalId: 1 });
documentSchema.index({ expenseId: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ uploadBy: 1 });
documentSchema.index({ uploadAt: -1 }); // For sorting by newest

module.exports = mongoose.model("Document", documentSchema);
