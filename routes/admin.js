const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Material = require('../models/Material');
const User = require('../models/User');
const Lecturer = require('../models/Lecturer');
const Banner = require('../models/Banner');
const HomeContent = require('../models/HomeContent');
const ProfileRequest = require('../models/ProfileRequest');
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage for lecturer photos (Cloudinary)
const lecturerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lecturers',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'thumb', gravity: 'face' }]
    }
});
const imageOnly = (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
};
const uploadLecturerPhoto = multer({ storage: lecturerStorage, fileFilter: imageOnly, limits: { fileSize: 2 * 1024 * 1024 } });

// Route to save a new YouTube link or Material Link (Google Drive, etc.)
router.post('/upload', async (req, res) => {
    try {
        const { title, youtubeUrl, description, type, fileUrl, lecturerId } = req.body;
        console.log('Material upload payload:', req.body);

        if (!title) {
            return res.status(400).json({ msg: "Please provide a title" });
        }

        const materialData = { 
            title, 
            description, 
            type: type || 'recording',
            lecturerId: lecturerId || null
        };

        if (type === 'recording') {
            if (!youtubeUrl) return res.status(400).json({ msg: "YouTube URL is required for recordings" });
            materialData.youtubeUrl = youtubeUrl;
        } else if (type === 'document') {
            if (!fileUrl) return res.status(400).json({ msg: "Document URL (e.g. Google Drive) is required" });
            materialData.fileUrl = fileUrl;
        }

        const newMaterial = new Material(materialData);
        await newMaterial.save();
        res.json({ msg: "✅ Material Added Successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message || "❌ Error adding material" });
    }
});

// Admin Material Management Routes
// Get all materials
router.get('/materials', async (req, res) => {
    try {
        const { lecturerId } = req.query;
        let query = {};
        if (lecturerId) {
            query.lecturerId = lecturerId;
        }
        const materials = await Material.find(query);
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
        const { title, youtubeUrl, description, type, fileUrl, lecturerId } = req.body;
        const updateData = { title, description, lecturerId: lecturerId || null };
        
        if (type) updateData.type = type;
        if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
        if (fileUrl !== undefined) updateData.fileUrl = fileUrl;

        const updatedMaterial = await Material.findByIdAndUpdate(
            req.params.id,
            updateData,
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

// Profile Requests Management
router.get('/profile-requests', async (req, res) => {
    try {
        const requests = await ProfileRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching profile requests' });
    }
});

router.put('/profile-requests/:id', async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const request = await ProfileRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ msg: 'Request not found' });

        request.status = status;
        request.adminComment = adminComment;
        await request.save();

        if (status === 'approved') {
            const user = await User.findById(request.studentId);
            if (user) {
                if (request.requestedChanges.name) user.name = request.requestedChanges.name;
                if (request.requestedChanges.email) user.email = request.requestedChanges.email.toLowerCase();
                if (request.requestedChanges.phone) user.phone = request.requestedChanges.phone;
                if (request.requestedChanges.address) user.address = request.requestedChanges.address;
                await user.save();
            }
        }

        res.json({ msg: `Request ${status} successfully` });
    } catch (err) {
        res.status(500).json({ msg: 'Error updating profile request' });
    }
});

router.delete('/profile-requests/:id', async (req, res) => {
    try {
        await ProfileRequest.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Request deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Error deleting profile request' });
    }
});


// Admin User Management Routes

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).populate('assignedLecturers', 'name');
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
        const { name, email, password, role, permittedCourses, assignedLecturers } = req.body;

        if (!email) {
            return res.status(400).json({ msg: 'Email is required' });
        }

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
            assignedLecturers: assignedLecturers || [],
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
        const { name, email, role, permittedCourses, isApproved, assignedLecturers } = req.body;

        const updateData = { 
            name, 
            role, 
            permittedCourses, 
            isApproved, 
            assignedLecturers: assignedLecturers || [] 
        };

        if (email) {
            updateData.email = email.toLowerCase();
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
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
        const { assignedLecturers } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true, assignedLecturers: assignedLecturers || [] },
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
router.post('/lecturers', uploadLecturerPhoto.single('photo'), async (req, res) => {
    try {
        const { name, email, professionalRoles, qualifications, achievements, specializationAreas } = req.body;
        
        const parseField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field;
            try { return JSON.parse(field); } catch { return [field]; }
        };

        const roles = parseField(professionalRoles);
        const quals = parseField(qualifications);
        const achs = parseField(achievements);
        const specs = parseField(specializationAreas);

        if (!name || !email) {
            return res.status(400).json({ msg: 'Name and email are required' });
        }

        let photoUrl = '';
        if (req.file) {
            photoUrl = req.file.path; // Cloudinary URL
        }

        const lecturer = new Lecturer({ 
            name, 
            email, 
            photoUrl, 
            professionalRoles: roles, 
            qualifications: quals, 
            achievements: achs, 
            specializationAreas: specs 
        });
        await lecturer.save();
        res.json({ msg: 'Lecturer added successfully', lecturer });
    } catch (err) {
        console.error("Error adding lecturer:", err);
        res.status(500).json({ msg: 'Error adding lecturer' });
    }
});

// Update lecturer details
router.put('/lecturers/:id', uploadLecturerPhoto.single('photo'), async (req, res) => {
    try {
        const { name, email, professionalRoles, qualifications, achievements, specializationAreas } = req.body;
        
        const parseField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field;
            try { return JSON.parse(field); } catch { return [field]; }
        };

        const roles = parseField(professionalRoles);
        const quals = parseField(qualifications);
        const achs = parseField(achievements);
        const specs = parseField(specializationAreas);

        const updateData = { 
            name, 
            email, 
            professionalRoles: roles, 
            qualifications: quals, 
            achievements: achs, 
            specializationAreas: specs 
        };

        if (req.file) {
            updateData.photoUrl = req.file.path; // Cloudinary URL
        }

        const lecturer = await Lecturer.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!lecturer) {
            return res.status(404).json({ msg: 'Lecturer not found' });
        }
        res.json({ msg: 'Lecturer updated successfully', lecturer });
    } catch (err) {
        console.error("Error updating lecturer:", err);
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

// Homepage Content Management
router.get('/home-content', async (req, res) => {
    try {
        const content = await HomeContent.findOne({});
        res.json(content || {});
    } catch {
        res.status(500).json({ msg: 'Error fetching home content' });
    }
});

router.put('/home-content', async (req, res) => {
    try {
        const { heroTitle, heroSubtitle, backgroundUrl } = req.body;
        const content = await HomeContent.findOneAndUpdate(
            {},
            { heroTitle, heroSubtitle, backgroundUrl, updatedAt: new Date() },
            { new: true, upsert: true }
        );
        res.json({ msg: 'Home content updated', content });
    } catch {
        res.status(500).json({ msg: 'Error updating home content' });
    }
});

// Advertisement Banner Management
router.get('/banners', async (req, res) => {
    try {
        const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
        res.json(banners);
    } catch {
        res.status(500).json({ msg: 'Error fetching banners' });
    }
});

router.post('/banners', async (req, res) => {
    try {
        const { title, imageUrl, linkUrl, active, order } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ msg: 'Banner image URL is required' });
        }
        const banner = new Banner({ title, imageUrl, linkUrl, active, order });
        await banner.save();
        res.json({ msg: 'Banner created', banner });
    } catch (err) {
        res.status(500).json({ msg: 'Error creating banner', error: err.message });
    }
});

router.put('/banners/:id', async (req, res) => {
    try {
        const { title, imageUrl, linkUrl, active, order } = req.body;
        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            { title, imageUrl, linkUrl, active, order },
            { new: true }
        );
        if (!banner) return res.status(404).json({ msg: 'Banner not found' });
        res.json({ msg: 'Banner updated', banner });
    } catch {
        res.status(500).json({ msg: 'Error updating banner' });
    }
});

router.delete('/banners/:id', async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) return res.status(404).json({ msg: 'Banner not found' });
        res.json({ msg: 'Banner deleted' });
    } catch {
        res.status(500).json({ msg: 'Error deleting banner' });
    }
});

module.exports = router;

