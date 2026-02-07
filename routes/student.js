const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const ProfileRequest = require('../models/ProfileRequest');
const User = require('../models/User');

// Fetch materials based on student's allowed courses
router.get('/my-materials', async (req, res) => {
    try {
        const coursesQuery = req.query.courses;
        const courses = coursesQuery ? coursesQuery.split(',').filter(c => c.trim() !== "") : [];
        
        if (courses.length === 0) {
            return res.json([]);
        }

        // Make course search case-insensitive and handle potential whitespace
        const materials = await Material.find({ 
            courseName: { 
                $in: courses.map(c => new RegExp(`^${c.trim()}$`, 'i')) 
            } 
        }).sort({ createdAt: -1 });
        
        res.json(materials);
    } catch (err) {
        console.error("Error fetching materials:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Profile Update Request
router.post('/profile-request', async (req, res) => {
    console.log("📥 Received profile request:", req.body);
    try {
        const { studentId, studentName, studentEmail, requestedChanges } = req.body;
        
        if (!studentId || !requestedChanges) {
            return res.status(400).json({ msg: 'Missing required information' });
        }

        const newRequest = new ProfileRequest({
            studentId,
            studentName,
            studentEmail,
            requestedChanges
        });

        await newRequest.save();
        res.json({ msg: 'Profile update request submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error submitting profile request' });
    }
});

// Get student's requests
router.get('/my-requests/:studentId', async (req, res) => {
    try {
        const requests = await ProfileRequest.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching requests' });
    }
});

module.exports = router;