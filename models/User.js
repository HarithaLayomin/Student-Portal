const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    isApproved: { type: Boolean, default: false },
    permittedCourses: [{ type: String }] // e.g. ["Maths", "Physics"]
});
module.exports = mongoose.model('User', UserSchema);