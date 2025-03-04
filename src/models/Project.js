const mongoose = require("mongoose");

// Define enum for project status
const ProjectStatus = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

// Define enum for project types
const ProjectType = {
  RESEARCH: "RESEARCH",
  JOURNAL: "JOURNAL",
  CONFERENCE: "CONFERENCE",
};

// Define enum for project category types
const ProjectCategoryType = {
  INTERNAL: "INTERNAL",
  EXTERNAL: "EXTERNAL",
  COLLABORATIVE: "COLLABORATIVE",
  GRANT: "GRANT",
  STUDENT: "STUDENT",
};

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    // reference to userID (lecturer)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Date register by lecturer
    startDate: Date,
    endDate: Date,
    // Project status
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.PENDING_APPROVAL,
    },
    //ID for research group - if - project type is research
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    // Project type - research, journal, conference
    projectType: {
      type: String,
      enum: Object.values(ProjectType),
      default: ProjectType.RESEARCH,
    },
    // User approved project
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Approval date
    approvedAt: Date,
    objective: String,
    methodology: String,
    type: {
      type: String,
      enum: Object.values(ProjectCategoryType),
      default: ProjectCategoryType.INTERNAL,
    },
    approvedBudget: {
      type: Number,
      default: 0,
    },
    spentBudget: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
projectSchema.statics.ProjectStatus = ProjectStatus;
projectSchema.statics.ProjectType = ProjectType;
projectSchema.statics.ProjectCategoryType = ProjectCategoryType;

// Add indexes for frequently queried fields
projectSchema.index({ createdBy: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ groupId: 1 });
projectSchema.index({ projectType: 1 });
projectSchema.index({ type: 1 });
projectSchema.index({ approvedBy: 1 });
projectSchema.index({ createdAt: -1 }); // For sorting by newest

// Add virtual for project duration in days
projectSchema.virtual("durationDays").get(function () {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Add method to check if project is overdue
projectSchema.methods.isOverdue = function () {
  if (
    this.endDate &&
    this.status !== ProjectStatus.COMPLETED &&
    this.status !== ProjectStatus.CANCELLED
  ) {
    return new Date() > this.endDate;
  }
  return false;
};

module.exports = mongoose.model("Project", projectSchema);
