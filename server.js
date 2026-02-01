const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // This forces the app to use Google's Global DNS

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// Middlewares: These allow the server to understand data sent from HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // This lets us show files in the 'public' folder

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
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

app.get('/learning_resources.html', (req, res, next) => {
    // Check if user is logged in (simple check for demo, use sessions/JWT in production)
    const userCookie = req.headers.cookie && req.headers.cookie.includes('user=');
    if (!userCookie) {
        return res.redirect('/index.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'learning_resources.html'));
});

app.use('/auth', require('./routes/auth'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Success: Connected to MongoDB"))
    .catch(err => console.log("❌ Error:", err));

// Link our Routes (We will create these files next)
app.use('/admin', require('./routes/admin'));
app.use('/student', require('./routes/student'));

const PORT = 3000;
const server = app.listen(PORT, '127.0.0.1', () => console.log(`🚀 Server: http://localhost:${PORT}`));

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

