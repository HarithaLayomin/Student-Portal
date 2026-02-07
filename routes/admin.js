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

// Multer storage for banner images
const bannerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'uploads', 'banners'));
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const ts = Date.now();
        cb(null, `${ts}_${safeName}`);
    }
});
const imageOnly = (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
};
const uploadBannerImage = multer({ storage: bannerStorage, fileFilter: imageOnly, limits: { fileSize: 5 * 1024 * 1024 } });

// Multer storage for lecturer photos
const lecturerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'uploads', 'lecturers'));
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const ts = Date.now();
        cb(null, `${ts}_${safeName}`);
    }
});
const uploadLecturerPhoto = multer({ storage: lecturerStorage, fileFilter: imageOnly, limits: { fileSize: 2 * 1024 * 1024 } });

// Multer storage for lecture materials (PDFs, Images, etc.)
const materialStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'uploads', 'materials'));
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const ts = Date.now();
        cb(null, `${ts}_${safeName}`);
    }
});
const materialFileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and Image files (JPG, PNG) are allowed'), false);
    }
};
const uploadMaterial = multer({ storage: materialStorage, fileFilter: materialFileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Route to save a new YouTube link or Material file
router.post('/upload', uploadMaterial.single('file'), async (req, res) => {
    try {
        const { title, youtubeUrl, courseName, description, type } = req.body;

        if (!title || !courseName) {
            return res.status(400).json({ msg: "Please fill all required fields" });
        }

        const materialData = { title, courseName, description, type: type || 'recording' };

        if (type === 'recording') {
            if (!youtubeUrl) return res.status(400).json({ msg: "YouTube URL is required for recordings" });
            materialData.youtubeUrl = youtubeUrl;
        } else if (type === 'document') {
            if (!req.file) return res.status(400).json({ msg: "File upload is required for documents" });
            materialData.fileUrl = `/uploads/materials/${req.file.filename}`;
        }

        const newMaterial = new Material(materialData);
        await newMaterial.save();
        res.json({ msg: "✅ Material Uploaded Successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message || "❌ Error uploading material" });
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
        const { title, youtubeUrl, courseName, description, type, fileUrl } = req.body;
        const updateData = { title, courseName, description };
        
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
            photoUrl = `/uploads/lecturers/${req.file.filename}`;
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
            updateData.photoUrl = `/uploads/lecturers/${req.file.filename}`;
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

router.post('/banners', uploadBannerImage.single('image'), async (req, res) => {
    try {
        const { title, linkUrl, active, order } = req.body;
        const imageUrl = req.file
            ? `/uploads/banners/${req.file.filename}`
            : (req.body.imageUrl || '');
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

