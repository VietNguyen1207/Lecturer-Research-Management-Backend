const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    // Description of the department
    description: {
      type: String,
      trim: true,
    },
    // Status of the department
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for frequently queried fields
departmentSchema.index({ departmentName: 1 });
departmentSchema.index({ status: 1 });

module.exports = mongoose.model("Department", departmentSchema);
