const mongoose = require("mongoose");

// Define enum for quota types
const QuotaType = {
  PROJECT_COUNT: "PROJECT_COUNT", // Limit on number of projects
  BUDGET: "BUDGET", // Budget allocation
  CONFERENCE_COUNT: "CONFERENCE_COUNT", // Limit on conference projects
  JOURNAL_COUNT: "JOURNAL_COUNT", // Limit on journal projects
  SUPERVISION_COUNT: "SUPERVISION_COUNT", // Limit on supervision roles
};

// Define enum for quota periods
const QuotaPeriod = {
  ACADEMIC_YEAR: "ACADEMIC_YEAR",
  SEMESTER: "SEMESTER",
  QUARTER: "QUARTER",
  MONTH: "MONTH",
  CUSTOM: "CUSTOM",
};

const quotaSchema = new mongoose.Schema(
  {
    // Type of quota
    quotaType: {
      type: String,
      enum: Object.values(QuotaType),
      required: true,
    },
    // User this quota is assigned to (lecturer)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Department this quota is for (optional)
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    // Maximum allowed value
    limitValue: {
      type: Number,
      required: true,
      min: 0,
    },
    // Current used value
    currentValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Start date of the quota period
    startDate: {
      type: Date,
      required: true,
    },
    // End date of the quota period
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.startDate < value;
        },
        message: "End date must be after start date",
      },
    },
    // User who allocated this quota (OSM role)
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // When the quota was allocated
    allocatedAt: {
      type: Date,
      default: Date.now,
    },
    // Status of the quota
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
      default: "ACTIVE",
    },
    // History of adjustments to this quota
    adjustmentHistory: [
      {
        previousLimit: Number,
        newLimit: Number,
        adjustedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        adjustedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
quotaSchema.statics.QuotaType = QuotaType;
quotaSchema.statics.QuotaPeriod = QuotaPeriod;

// Add indexes for frequently queried fields
quotaSchema.index({ userId: 1, quotaType: 1, status: 1 });
quotaSchema.index({ departmentId: 1, quotaType: 1 });
quotaSchema.index({ academicYear: 1 });
quotaSchema.index({ endDate: 1, status: 1 });

module.exports = mongoose.model("Quota", quotaSchema);
