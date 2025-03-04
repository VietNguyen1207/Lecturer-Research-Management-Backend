const mongoose = require("mongoose");

// Define enum for milestone status
const MilestoneStatus = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  DELAYED: "DELAYED",
  CANCELLED: "CANCELLED",
};

const milestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: Object.values(MilestoneStatus),
      default: MilestoneStatus.NOT_STARTED,
    },
    assignTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Additional useful fields
    deliverables: [String],
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
milestoneSchema.statics.MilestoneStatus = MilestoneStatus;

// Add indexes
milestoneSchema.index({ projectId: 1 });
milestoneSchema.index({ status: 1 });
milestoneSchema.index({ assignTo: 1 });
milestoneSchema.index({ endDate: 1 }); // For deadline queries

// Virtual for checking if milestone is overdue
milestoneSchema.virtual("isOverdue").get(function () {
  if (
    this.endDate &&
    this.status !== MilestoneStatus.COMPLETED &&
    this.status !== MilestoneStatus.CANCELLED
  ) {
    return new Date() > this.endDate;
  }
  return false;
});

module.exports = mongoose.model("Milestone", milestoneSchema);
