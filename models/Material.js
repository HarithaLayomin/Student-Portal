const mongoose = require('mongoose');
const MaterialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    courseName: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Material', MaterialSchema);