const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

// Fetch materials based on student's allowed courses
router.get('/my-materials', async (req, res) => {
    try {
        const coursesQuery = req.query.courses;
        const courses = coursesQuery ? coursesQuery.split(',').filter(c => c.trim() !== "") : [];
        
        // If no courses assigned, return empty array immediately
        if (courses.length === 0) {
            return res.json([]);
        }

        // Find materials where the 'courseName' matches the student's list
        const materials = await Material.find({ courseName: { $in: courses } });
        res.json(materials);
    } catch (err) {
        console.error("Error fetching materials:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

module.exports = router;