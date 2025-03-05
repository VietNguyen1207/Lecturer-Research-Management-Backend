const mongoose = require("mongoose");

// Define enum for resource types
const ResourceType = {
  LAB_ROOM: "LAB_ROOM",
  SOFTWARE_LICENSE: "SOFTWARE_LICENSE",
  EQUIPMENT: "EQUIPMENT",
  MATERIAL: "MATERIAL",
  DATASET: "DATASET",
  COMPUTING_RESOURCE: "COMPUTING_RESOURCE",
  HUMAN_RESOURCE: "HUMAN_RESOURCE",
  FACILITY: "FACILITY",
  OTHER: "OTHER",
};

// Define enum for acquisition status
const AcquisitionStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  ACQUIRED: "ACQUIRED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED",
};

const projectResourcesSchema = new mongoose.Schema(
  {
    // Reference to the project
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    // Type of resource
    resourceType: {
      type: String,
      enum: Object.values(ResourceType),
      required: true,
    },
    // Name/description of the resource
    resourceName: {
      type: String,
      required: true,
      trim: true,
    },
    // Detailed description
    description: {
      type: String,
      trim: true,
    },
    // Quantity needed/allocated
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // Total cost (calculated)
    totalCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Acquisition details
    acquisition: {
      // When the resource was requested
      requestDate: {
        type: Date,
        default: Date.now,
      },
      // When the resource was acquired (if applicable)
      acquisitionDate: Date,
      // Who approved the resource
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      // Approval date
      approvalDate: Date,
      // Expected return date (if applicable)
      expectedReturnDate: Date,
      // Actual return date (if applicable)
      actualReturnDate: Date,
      // Acquisition notes
      notes: String,
    },
    // Acquisition status
    acquisitionStatus: {
      type: String,
      enum: Object.values(AcquisitionStatus),
      default: AcquisitionStatus.PENDING,
    },
    // Budget allocation information
    budgetAllocation: {
      // Budget source
      source: {
        type: String,
        trim: true,
      },
      // Budget code
      code: {
        type: String,
        trim: true,
      },
      // Fiscal year
      fiscalYear: String,
    },
    // For software licenses, equipment, etc.
    assetDetails: {
      // Asset ID/serial number
      assetId: String,
      // License key
      licenseKey: String,
      // Expiration date
      expirationDate: Date,
      // Manufacturer
      manufacturer: String,
      // Model
      model: String,
    },
    // For lab rooms, facilities
    locationDetails: {
      // Building
      building: String,
      // Room number
      roomNumber: String,
      // Campus
      campus: String,
      // Availability schedule
      schedule: String,
    },
    // Documents related to this resource (receipts, approvals, etc.)
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    // Tags for categorization
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
projectResourcesSchema.statics.ResourceType = ResourceType;
projectResourcesSchema.statics.AcquisitionStatus = AcquisitionStatus;

// Add indexes for frequently queried fields
projectResourcesSchema.index({ projectId: 1 });
projectResourcesSchema.index({ resourceType: 1 });
projectResourcesSchema.index({ acquisitionStatus: 1 });
projectResourcesSchema.index({ "acquisition.approvedBy": 1 });
projectResourcesSchema.index({ "assetDetails.assetId": 1 });

// Pre-save middleware to calculate total cost
projectResourcesSchema.pre("save", function (next) {
  this.totalCost = this.costPerUnit * this.quantity;
  next();
});

// Method to update acquisition status
projectResourcesSchema.methods.updateAcquisitionStatus = function (
  status,
  userId,
  notes
) {
  this.acquisitionStatus = status;

  if (status === AcquisitionStatus.APPROVED) {
    this.acquisition.approvedBy = userId;
    this.acquisition.approvalDate = new Date();
  } else if (status === AcquisitionStatus.ACQUIRED) {
    this.acquisition.acquisitionDate = new Date();
  } else if (status === AcquisitionStatus.RETURNED) {
    this.acquisition.actualReturnDate = new Date();
  }

  if (notes) {
    this.acquisition.notes = notes;
  }

  return this.save();
};

// Static method to get total cost of resources for a project
projectResourcesSchema.statics.getTotalCostForProject = async function (
  projectId
) {
  const result = await this.aggregate([
    { $match: { projectId: mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: null, totalCost: { $sum: "$totalCost" } } },
  ]);

  return result.length > 0 ? result[0].totalCost : 0;
};

module.exports = mongoose.model("ProjectResources", projectResourcesSchema);
