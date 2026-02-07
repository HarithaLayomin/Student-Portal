# Student Portal - Advanced Masterclass

A modern, glassmorphism-style Student Portal and Admin Dashboard for managing academic courses, lecture recordings, and learning materials.

## Features

### Student Dashboard
- **Personalized Access**: Students only see materials for courses they are enrolled in.
- **Resource Management**: Dedicated tabs for lecture recordings (YouTube) and documents (PDFs/Images).
- **Quick Access Panel**: Sliding panel for easy navigation between recordings and resources.
- **Profile Management**: Students can request profile updates (name, email, etc.) which admins can approve.
- **Modern UI**: Clean glassmorphism design with responsive layouts.

### Admin Dashboard
- **Content Management**: Upload and manage lecture recordings and documents.
- **Course Flexibility**: Admins can define custom course names (no longer restricted to a fixed list).
- **Student Management**: Approve new signups and assign permitted courses to students.
- **Profile Requests**: Review and approve student requests to change their personal information.
- **Banner System**: Manage homepage banners and announcements.
- **Lecturer Management**: Add and manage profiles for course instructors.

## Technical Stack
- **Frontend**: HTML5, CSS3 (Custom Glassmorphism), Bootstrap 5, Bootstrap Icons.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (via Mongoose).
- **File Uploads**: Multer (configured for banners, lecturer photos, and materials).
- **Authentication**: Custom JWT-style session management with LocalStorage.

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Student-Portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```

4. **Run the Server**
   ```bash
   node server.js
   ```
   The application will be available at `http://localhost:3000`.

## Project Structure
- `/public`: Static assets, HTML pages, and CSS.
  - `/uploads`: Dynamically uploaded files (banners, lecturers, materials).
- `/routes`: Express API endpoints (auth, admin, student).
- `/models`: Mongoose schemas (User, Material, Lecturer, etc.).
- `server.js`: Main application entry point.

## Usage Notes
- **Course Matching**: Ensure the `courseName` used during material upload matches the student's `permittedCourses` (case-insensitive).
- **Admin Access**: Admin accounts must be created directly in the database or via an initialization script (e.g., `createAdmin.js`).
- **File Limits**: Default upload limit is set to 10MB for documents and 5MB for images.

---
*Empowering future leaders through communication excellence.*
