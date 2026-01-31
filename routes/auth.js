const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// This is your "Login Route"
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // This will print in your VS Code terminal
        console.log("Checking login for:", email);

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.log("❌ User not found in database");
            return res.status(400).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Password is wrong");
            return res.status(400).json({ msg: "Wrong password" });
        }

        if (!user.isApproved) {
            console.log("❌ User not approved");
            return res.status(401).json({ msg: "Your account is pending approval." });
        }

        console.log("✅ Login successful!");
        res.json({
            name: user.name,
            role: user.role,
            courses: user.permittedCourses
        });

    } catch (err) {
        console.error("🔥 Error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// This is your "Signup Route"
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'student', // Default role for new signups
            permittedCourses: [] // No permitted courses on signup
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

module.exports = router;