const mongoose = require('mongoose');

const ProfileRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    requestedChanges: {
        name: String,
        email: String,
        phone: String,
        address: String
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminComment: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProfileRequest', ProfileRequestSchema);