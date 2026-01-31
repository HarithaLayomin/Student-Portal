const mongoose = require('mongoose');

const LecturerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String },
    bio: { type: String },
    photoUrl: { type: String }
});

module.exports = mongoose.model('Lecturer', LecturerSchema);
