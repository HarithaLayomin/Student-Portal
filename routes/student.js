const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

// Fetch materials based on student's allowed courses
router.post('/my-materials', async (req, res) => {
    const { courses } = req.body; // We get this from the login session
    try {
        // Find materials where the 'courseName' matches the student's list
        const materials = await Material.find({ courseName: { $in: courses } });
        res.json(materials);
    } catch (err) {
        res.status(500).json([]);
    }
});

module.exports = router;