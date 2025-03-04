const mongoose = require("mongoose");

// Define enum for journal status
const JournalStatus = {
  SUBMITTED: "SUBMITTED", // Submitted to journal publisher
  UNDER_REVIEW: "UNDER_REVIEW", // Under review by journal
  REVISION_REQUIRED: "REVISION_REQUIRED",
  ACCEPTED: "ACCEPTED", // Accepted by journal
  PUBLISHED: "PUBLISHED", // Published in journal
  REJECTED: "REJECTED", // Rejected by journal
};

const journalSchema = new mongoose.Schema(
  {
    // Reference to the base project
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true, // Ensures 1-1 relationship with Project
    },
    journalName: {
      type: String,
      required: true,
      trim: true,
    },
    publisherApproval: {
      type: Boolean,
      default: false,
    },
    doiNumber: {
      type: String,
      trim: true,
      // Optional unique index since DOIs are unique identifiers
      sparse: true,
      unique: true,
    },
    pages: {
      type: String,
      trim: true,
    },
    submissionDate: Date,
    acceptanceDate: Date,
    publicationDate: Date,
    reviewerComments: String,
    revisionHistory: String,
    // Journal publication status
    journalStatus: {
      type: String,
      enum: Object.values(JournalStatus),
      default: JournalStatus.SUBMITTED,
    },
    // Basic publisher information
    publisher: {
      type: String,
      trim: true,
    },
    volume: String,
    issue: String,
    authors: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        email: String,
        affiliation: String,
        isCorrespondingAuthor: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
journalSchema.statics.JournalStatus = JournalStatus;

// Add indexes
journalSchema.index({ projectId: 1 });
journalSchema.index({ journalName: 1 });
journalSchema.index({ doiNumber: 1 });
journalSchema.index({ publicationDate: 1 });
journalSchema.index({ journalStatus: 1 });

module.exports = mongoose.model("Journal", journalSchema);
