const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student', 'lecturer'], default: 'student' },
    isApproved: { type: Boolean, default: false },
    assignedLecturers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer' }],
    permittedCourses: [{ type: String }] // e.g. ["Maths", "Physics"]
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);
