require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function approveAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await User.updateOne(
    { email: 'admin@tuition.com' },
    { $set: { isApproved: true, role: 'admin' } }
  );
  console.log('Admin approval and role updated:', result);
  process.exit(0);
}
approveAdmin();
