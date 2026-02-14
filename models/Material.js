const mongoose = require('mongoose');
const MaterialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    youtubeUrl: { type: String }, // Optional for recordings
    fileUrl: { type: String },    // New: For PDFs, images, etc.
    type: { type: String, enum: ['recording', 'document'], default: 'recording' }, // New: Distinguish type
    courseName: { type: String },
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer' },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Add indexes for performance
MaterialSchema.index({ lecturerId: 1 });
MaterialSchema.index({ courseName: 1 });
MaterialSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Material', MaterialSchema);