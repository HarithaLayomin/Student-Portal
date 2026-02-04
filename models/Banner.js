const mongoose = require('mongoose');
const BannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Banner', BannerSchema);
