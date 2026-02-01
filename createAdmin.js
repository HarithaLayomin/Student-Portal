require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const password = await bcrypt.hash('newadmin123', 10);
  const result = await User.create({
    name: 'New Admin',
    email: 'newadmin@tuition.com',
    password,
    role: 'admin',
    isApproved: true
  });
  console.log('New admin created:', result);
  process.exit(0);
}
createAdmin();
