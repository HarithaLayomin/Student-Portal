# Student Portal - Advanced Masterclass

A modern, glassmorphism-style Student Portal and Admin Dashboard for managing academic courses, lecture recordings, and learning materials.

## 🚀 Features

### Student Dashboard
- **Subject-Wise Organization**: Learning materials are automatically grouped by subject (Course Name) for a cleaner and more structured learning experience.
- **Personalized Access**: Students only see materials for courses they are enrolled in and lecturers they are assigned to.
- **Public Resources**: Access to general learning materials even before specific lecturer assignments are finalized.
- **Resource Management**: Dedicated tabs for lecture recordings (YouTube) and documents (PDFs/Images).
- **Quick Access Panel**: Sliding panel for easy navigation between recordings and resources.
- **Profile Management**: Students can request profile updates (name, email, etc.) which admins can approve.
- **Modern UI**: Clean glassmorphism design with responsive layouts and interactive components.

### Lecturer Dashboard
- **Profile-Based Management**: Lecturers can only manage materials they have uploaded.
- **Auto-Identification**: The system automatically identifies and selects the lecturer's profile during upload.
- **Subject Categorization**: Ability to assign materials to specific subjects/courses for student organization.

### Admin Dashboard
- **Comprehensive Control**: Full control over all materials, students, and lecturers.
- **Material Management**: Filter, edit, and delete materials with advanced filtering by lecturer and subject.
- **Approval Workflow**: Streamlined approval process for new signups with simultaneous lecturer assignment.
- **Student Management**: Approve new signups and assign permitted courses to students.
- **Profile Requests**: Review and approve student requests to change their personal information.
- **Banner System**: Manage homepage banners and announcements.
- **Lecturer Management**: Add and manage profiles for course instructors.

## 🛠️ Technical Stack
- **Frontend**: HTML5, CSS3 (Custom Glassmorphism), Bootstrap 5, Bootstrap Icons.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (via Mongoose) with optimized indexing for performance.
- **Performance**: 
  - **Lean Queries**: Backend queries use `.lean()` for faster object retrieval.
  - **DB Indexing**: Optimized indexes on `lecturerId`, `courseName`, and `createdAt` for rapid material fetching.
  - **Batched Rendering**: Frontend uses batched DOM updates to prevent layout thrashing.
- **Authentication**: Role-based access control (RBAC) with custom session management.

## ⚙️ Installation & Setup

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

## 📂 Project Structure
- `/public`: Static assets, HTML pages, and CSS.
  - `/js`: Configuration and client-side logic.
- `/routes`: Express API endpoints (auth, admin, student).
- `/models`: Mongoose schemas (User, Material, Lecturer, ProfileRequest, etc.).
- `server.js`: Main application entry point and configuration.

## 📝 Usage Notes
- **Subject-Wise Display**: Materials must have a `courseName` assigned to appear under a specific subject header in the student portal.
- **Lecturer Assignment**: Assigning a lecturer to a student during approval is critical for their material visibility.
- **Admin Access**: Admin accounts must be created directly in the database or via an initialization script.

---
*Empowering future leaders through communication excellence.*
