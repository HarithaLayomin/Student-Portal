const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // This MUST be here
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
const Material = require('./models/Material');
const Lecturer = require('./models/Lecturer');
const Banner = require('./models/Banner');
const HomeContent = require('./models/HomeContent');

// 1. Config comes AFTER the require
dotenv.config(); 

// 2. App initialization comes AFTER express is required
const app = express(); 

// 3. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static will be registered after explicit routes to allow custom overrides
// Ensure uploads directories exist
const bannerUploads = path.join(__dirname, 'public', 'uploads', 'banners');
const lecturerUploads = path.join(__dirname, 'public', 'uploads', 'lecturers');
[bannerUploads, lecturerUploads].forEach(dir => {
    try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); } catch {}
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Provide a friendly login URL
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/program_overview.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'program_overview.html'));
});

app.get('/lecturers.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lecturers.html'));
});

app.get('/learning_resources.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'learning_resources.html'));
});

app.use('/auth', require('./routes/auth'));

// Register static after routes so overrides above win
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Success: Connected to MongoDB"))
    .catch(err => console.log("❌ Error:", err));

// Link our Routes (We will create these files next)
app.use('/admin', require('./routes/admin'));
app.use('/student', require('./routes/student'));

const PORT = 3000;
const server = app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Admin Stats 

app.get('/api/admin/stats', async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const [
            studentCount,
            adminCount,
            pendingCount,
            materialCount,
            lecturerCount,
            signupsLast7Days,
            topCoursesAgg
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ isApproved: false }),
            Material.countDocuments({}),
            Lecturer.countDocuments({}),
            User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            Material.aggregate([
                { $group: { _id: '$courseName', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ])
        ]);

        res.json({
            totalStudents: studentCount || 0,
            totalAdmins: adminCount || 0,
            pendingCount: pendingCount || 0,
            totalMaterials: materialCount || 0,
            totalLecturers: lecturerCount || 0,
            signupsLast7Days: signupsLast7Days || 0,
            topCourses: topCoursesAgg.map(c => ({ courseName: c._id, count: c.count })),
            status: "Operational"
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Public API: Active banners for homepage and student dashboards
app.get('/api/banners', async (req, res) => {
    try {
        const banners = await Banner.find({ active: true }).sort({ order: 1, createdAt: -1 });
        res.json(banners);
    } catch {
        res.status(500).json([]);
    }
});

// Public API: Home content (hero text, background image)
app.get('/api/home-content', async (req, res) => {
    try {
        const content = await HomeContent.findOne({});
        res.json(content || {
            heroTitle: 'Advanced Masterclass in Academic English Communication & Presentation Skills',
            heroSubtitle: 'Mode: 100% Online | Duration: 2 Months | Course Fee: LKR 12,000/- (Payable in two installments)',
            backgroundUrl: ''
        });
    } catch {
        res.status(500).json({});
    }
});
