const mongoose = require("mongoose");

// Define enum for timeline types
const TimelineType = {
  REGISTRATION: "REGISTRATION",
  SUBMISSION: "SUBMISSION",
  REVIEW: "REVIEW",
  APPROVAL: "APPROVAL",
  CONFERENCE_REGISTRATION: "CONFERENCE_REGISTRATION",
  JOURNAL_SUBMISSION: "JOURNAL_SUBMISSION",
  EXPENSE_CLAIM: "EXPENSE_CLAIM",
  REPORT_SUBMISSION: "REPORT_SUBMISSION",
  MILESTONE_COMPLETION: "MILESTONE_COMPLETION",
  OTHER: "OTHER",
};

const timelineSchema = new mongoose.Schema(
  {
    // Start date of the timeline period
    startDate: {
      type: Date,
      required: true,
    },
    // End date of the timeline period
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          // Ensure end date is after start date
          return this.startDate < value;
        },
        message: "End date must be after start date",
      },
    },
    // Type of timeline
    timelineType: {
      type: String,
      enum: Object.values(TimelineType),
      required: true,
    },
    // User who created this timeline (should be OSM role)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional title for the timeline
    title: {
      type: String,
      trim: true,
    },
    // Optional description for the timeline
    description: {
      type: String,
      trim: true,
    },
    // Academic year this timeline applies to (e.g., "2023-2024")
    academicYear: {
      type: String,
      trim: true,
    },
    // Status of the timeline
    status: {
      type: String,
      enum: ["Active", "Inactive", "Completed"],
      default: "Active",
    },
    // Optional notification settings
    notifications: {
      // Days before end date to send reminder
      reminderDays: {
        type: Number,
        min: 0,
      },
      // Whether to send start notification
      notifyOnStart: {
        type: Boolean,
        default: true,
      },
      // Whether to send end notification
      notifyOnEnd: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
timelineSchema.statics.TimelineType = TimelineType;

// Add indexes for frequently queried fields
timelineSchema.index({ timelineType: 1 });
timelineSchema.index({ startDate: 1 });
timelineSchema.index({ endDate: 1 });
timelineSchema.index({ status: 1 });
timelineSchema.index({ academicYear: 1 });

// Method to check if a timeline is currently active
timelineSchema.methods.isActive = function () {
  const now = new Date();
  return (
    this.startDate <= now && now <= this.endDate && this.status === "Active"
  );
};

// Method to check if a timeline has expired
timelineSchema.methods.hasExpired = function () {
  const now = new Date();
  return now > this.endDate;
};

// Static method to find active timelines of a specific type
timelineSchema.statics.findActiveByType = async function (type) {
  const now = new Date();
  return this.find({
    timelineType: type,
    startDate: { $lte: now },
    endDate: { $gte: now },
    status: "Active",
  });
};

module.exports = mongoose.model("Timeline", timelineSchema);
