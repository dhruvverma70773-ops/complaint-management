// models/Complaint.js
// Mongoose schema for the Complaint collection

const mongoose = require('mongoose');

// ── Sub-schema: each status change is recorded in statusHistory ──────────────
const StatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      required: true,
    },
    remark: {
      type:    String,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',             // reference to the admin who changed the status
    },
    updatedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  { _id: false }               // no separate _id for sub-documents
);

// ── Auto-incrementing complaint counter ──────────────────────────────────────
// We use a separate Counter model to generate complaint IDs like CMP-0001
const CounterSchema = new mongoose.Schema({
  _id:    { type: String, required: true },
  seq:    { type: Number, default: 0     },
});
const Counter = mongoose.model('Counter', CounterSchema);

// ── Main Complaint schema ────────────────────────────────────────────────────
const ComplaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type:   String,
      unique: true,            // e.g. "CMP-0001"
    },
    title: {
      type:     String,
      required: [true, 'Title is required'],
      trim:     true,
    },
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     ['Water', 'Electricity', 'Roads', 'Sanitation', 'Other'],
    },
    description: {
      type:     String,
      required: [true, 'Description is required'],
      trim:     true,
    },
    location: {
      type:     String,
      required: [true, 'Location/Address is required'],
      trim:     true,
    },
    imageUrl: {
      type:    String,
      default: '',             // optional image URL provided by citizen
    },
    priority: {
      type:    String,
      enum:    ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type:    String,
      enum:    ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    // Array that tracks every status change — used for timeline on detail page
    statusHistory: [StatusHistorySchema],
    // Reference to the citizen who filed this complaint
    citizen: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
  },
  { timestamps: true }
);

// ── Pre-save hook: generate complaintId before first save ────────────────────
ComplaintSchema.pre('save', async function (next) {
  if (!this.isNew) return next();   // only generate ID for new complaints

  try {
    // Atomically increment the counter and get the new value
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'complaintId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }   // create counter doc if it doesn't exist
    );
    // Format as CMP-0001, CMP-0002, …
    this.complaintId = `CMP-${String(counter.seq).padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
