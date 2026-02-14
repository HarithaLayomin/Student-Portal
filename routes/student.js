const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const ProfileRequest = require('../models/ProfileRequest');
const User = require('../models/User');

// Fetch materials based on student's allowed courses and assigned lecturers
router.get('/my-materials', async (req, res) => {
    try {
        const { courses: coursesQuery, lecturerIds: lecturerIdsQuery } = req.query;
        const courses = coursesQuery ? coursesQuery.split(',').filter(c => c.trim() !== "") : [];
        const lecturerIds = lecturerIdsQuery ? lecturerIdsQuery.split(',').filter(id => id.trim() !== "") : [];
        
        let query = {};

        // Filter by lecturers: either the student's assigned lecturers OR public materials (lecturerId: null)
        if (lecturerIds.length > 0) {
            query.$or = [
                { lecturerId: { $in: lecturerIds } },
                { lecturerId: null }
            ];
        } else {
            // If no lecturer assigned, show only public materials
            query.lecturerId = null;
        }

        // Optional: Filter by courses if provided (backward compatibility)
        if (courses.length > 0) {
            // Only apply course filter if the material has a courseName
            // or if we want to strictly limit by course.
            // But since the user wants lecturer-wise separation, we'll make this less strict.
            // If a material has a courseName, it must be in the student's courses.
            // If it doesn't have a courseName, it's allowed (if lecturer matches).
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { courseName: { $exists: false } },
                    { courseName: null },
                    { courseName: "" },
                    { courseName: { $in: courses.map(c => new RegExp(`^${c.trim()}$`, 'i')) } }
                ]
            });
        }

        const materials = await Material.find(query)
            .populate('lecturerId', 'name')
            .sort({ createdAt: -1 })
            .lean(); // Faster performance by returning plain JS objects
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