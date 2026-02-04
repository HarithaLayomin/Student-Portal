const mongoose = require('mongoose');
const HomeContentSchema = new mongoose.Schema({
    heroTitle: { type: String, default: 'Advanced Masterclass in Academic English Communication & Presentation Skills' },
    heroSubtitle: { type: String, default: 'Mode: 100% Online | Duration: 2 Months | Course Fee: LKR 12,000/- (Payable in two installments)' },
    backgroundUrl: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('HomeContent', HomeContentSchema);
