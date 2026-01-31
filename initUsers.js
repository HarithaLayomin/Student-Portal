// 1. THIS IS THE FIX: Forces Google DNS for this specific script
const dns = require('node:dns/promises');
dns.setServers(['8.8.8.8', '1.1.1.1']); 

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createUsers = async () => {
    try {
        // 2. Connect using your .env URI
        await mongoose.connect(process.env.MONGO_URI);
        console.log("📡 Connected to MongoDB for setup...");

        // 3. Create Admin
        const adminPass = await bcrypt.hash('admin123', 10);
        await User.create({
            name: "Haritha Admin",
            email: "admin@tuition.com",
            password: adminPass,
            role: "admin"
        });

        // 4. Create Student
        const studentPass = await bcrypt.hash('student123', 10);
        await User.create({
            name: "Test Student",
            email: "student@test.com",
            password: studentPass,
            role: "student",
            permittedCourses: ["Maths"] 
        });

        console.log("✅ Success: Users created in database!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Setup Error:", err);
        process.exit(1);
    }
};

createUsers();