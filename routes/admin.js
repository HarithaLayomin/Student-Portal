const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const User = require('../models/User');
const Lecturer = require('../models/Lecturer');

// Route to save a new YouTube link
router.post('/upload', async (req, res) => {
    try {
        const { title, youtubeUrl, courseName, description } = req.body;

        // 1. Basic Validation: Ensure fields aren't empty
        if (!title || !youtubeUrl || !courseName) {
            return res.status(400).json({ msg: "Please fill all fields" });
        }

        // 2. Create and Save
        const newMaterial = new Material({ title, youtubeUrl, courseName, description });
        await newMaterial.save();

        // 3. Send back JSON instead of plain text
        res.json({ msg: "✅ Material Uploaded Successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "❌ Error uploading material" });
    }
});

// Admin Material Management Routes
// Get all materials
router.get('/materials', async (req, res) => {
    try {
        const materials = await Material.find();
        res.json(materials);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error fetching materials' });
    }
});

// Get single material
router.get('/materials/:id', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ msg: 'Material not found' });
        }
        res.json(material);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error fetching material' });
    }
});

// Update material
router.put('/materials/:id', async (req, res) => {
    try {
        const { title, youtubeUrl, courseName, description } = req.body;
        const updatedMaterial = await Material.findByIdAndUpdate(
            req.params.id,
            { title, youtubeUrl, courseName, description },
            { new: true }
        );
        if (!updatedMaterial) {
            return res.status(404).json({ msg: 'Material not found' });
        }
        res.json({ msg: 'Material updated successfully', material: updatedMaterial });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error updating material' });
    }
});

// Delete material
router.delete('/materials/:id', async (req, res) => {
    try {
        const deletedMaterial = await Material.findByIdAndDelete(req.params.id);
        if (!deletedMaterial) {
            return res.status(404).json({ msg: 'Material not found' });
        }
        res.json({ msg: 'Material deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error deleting material' });
    }
});


// Admin User Management Routes

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error fetching users' });
    }
});

// Get single user
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error fetching user' });
    }
});


// Add new user (manually by admin)
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, role, permittedCourses } = req.body;

        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ msg: 'User with that email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || 'student',
            permittedCourses: permittedCourses || [],
            isApproved: true // Manually added users are approved by default
        });

        await user.save();
        res.status(201).json({ msg: 'User added successfully', user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error adding user' });
    }
});

// Update user details
router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, role, permittedCourses, isApproved } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email: email.toLowerCase(), role, permittedCourses, isApproved },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ msg: 'User updated successfully', user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error updating user' });
    }
});


// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error deleting user' });
    }
});

// Admin Pending User Approvals Routes
// Get all pending users
router.get('/pending-users', async (req, res) => {
    try {
        const pendingUsers = await User.find({ isApproved: false });
        res.json(pendingUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error fetching pending users' });
    }
});

// Approve a user
router.post('/approve-user/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ msg: 'User approved successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error approving user' });
    }
});

// Reject (delete) an unapproved user
router.delete('/reject-user/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ msg: 'User rejected and deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error rejecting user' });
    }
});

// Lecturer Management Routes
// Get all lecturers
router.get('/lecturers', async (req, res) => {
    try {
        const lecturers = await Lecturer.find();
        res.json(lecturers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error fetching lecturers' });
    }
});

// Add a new lecturer
router.post('/lecturers', async (req, res) => {
    try {
        const { name, email, department, bio, photoUrl } = req.body;
        if (!name || !email) {
            return res.status(400).json({ msg: 'Name and email are required' });
        }
        const lecturer = new Lecturer({ name, email, department, bio, photoUrl });
        await lecturer.save();
        res.json({ msg: 'Lecturer added successfully', lecturer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error adding lecturer' });
    }
});

// Update lecturer details
router.put('/lecturers/:id', async (req, res) => {
    try {
        const { name, email, department, bio, photoUrl } = req.body;
        const lecturer = await Lecturer.findByIdAndUpdate(
            req.params.id,
            { name, email, department, bio, photoUrl },
            { new: true }
        );
        if (!lecturer) {
            return res.status(404).json({ msg: 'Lecturer not found' });
        }
        res.json({ msg: 'Lecturer updated successfully', lecturer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error updating lecturer' });
    }
});

// Delete lecturer
router.delete('/lecturers/:id', async (req, res) => {
    try {
        const lecturer = await Lecturer.findByIdAndDelete(req.params.id);
        if (!lecturer) {
            return res.status(404).json({ msg: 'Lecturer not found' });
        }
        res.json({ msg: 'Lecturer deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error deleting lecturer' });
    }
});

module.exports = router;