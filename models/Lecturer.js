const mongoose = require('mongoose');

const LecturerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photoUrl: { type: String },
    professionalRoles: [{ type: String }],
    qualifications: [{ type: String }],
    achievements: [{ type: String }],
    specializationAreas: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Lecturer', LecturerSchema);
