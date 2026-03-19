# Project Improvements & Roadmap

This document outlines the current state of the dashboards (Admin and Faculty) and suggests features, fixes, and architectural improvements to complete the project.

---

## 1. Admin Dashboard Improvements

### Current State
- ✅ Real-time stats for Faculty counts, Locked accounts, and Login activity.
- ✅ Recent login activity feed.
- ✅ Analytics charts (Bar/Pie) using real DB data.
- ❌ **"Pending Action Items"** is a hardcoded placeholder (static data).
- ❌ **"System Health"** is a static string ("Good").

### Suggested Improvements
- **Real Pending Actions:** Replace the placeholder with a dynamic list:
    - Faculty with ≥ 2 failed login attempts (Risk of lockout).
    - Recently locked accounts requiring review.
    - (Feature) Faculty registration requests (if a public signup is added).
    - (Feature) Faculty who haven't logged attendance in > 3 days.
- **Dynamic System Health:** Implement a real check:
    - Database connection status (Mongoose readyState).
    - API latency check.
    - Last successful backup timestamp.
- **Global Announcements:** Add a way for admins to post "Announcements" that appear on all Faculty Dashboards.
- **System Maintenance:** Add a "Maintenance Mode" toggle in settings to prevent non-admin logins during updates.

---

## 2. Faculty Dashboard Improvements

### Current State
- ✅ Greeting and last login display.
- ✅ Navigation to Attendance and Profile.
- ❌ **Quick Stats** (Today's Classes, Students, Reports) are hardcoded placeholders.
- ❌ **Quick Actions** (Schedule, Students, Reports, Courses, Announcements) are unimplemented (UI only).
- ❌ **Notice Board** is a hardcoded placeholder.

### Suggested Improvements
- **Real Stats:** Implement backend endpoints to fetch:
    - **Today's Classes:** Count from the `Attendance` collection where date = today.
    - **Total Students:** Count from a new `Students` collection.
    - **Pending Reports:** Count of unsubmitted or flagged attendance/performance logs.
- **Self-Status Toggle:** Allow faculty to update their own status (e.g., "In Meeting", "Available") directly from the dashboard. Currently, only the Admin can change this in Faculty Management.
- **Notice Board:** Implement an `Announcement` system so faculty can see institutional updates.
- **Implementation of Quick Actions:**
    - **My Schedule:** Integrate with a `Timetable` model to show upcoming classes.
    - **Students:** List of students assigned to the faculty's department or courses.
    - **Courses:** List of subjects/courses the faculty is responsible for.

---

## 3. Database & Architectural Improvements

### Missing Models
- **`Student.js`**: To track student details, IDs, and department association.
- **`Course.js`**: To manage subjects, credits, and links between faculty and students.
- **`Announcement.js`**: For global or department-level notices.
- **`LeaveRequest.js`**: For a formal leave approval workflow (Faculty request -> Admin approve -> Status updates to "On Leave").
- **`Timetable.js`**: To store weekly schedules and room assignments.

### Feature Enhancements
- **Course-Attendance Linking:** Instead of typing "Subject" as a string in `AttendancePage`, let faculty select from a dropdown of `Courses` assigned to them.
- **Student-Level Attendance:** Instead of just logging a *session*, allow faculty to mark individual students as Present/Absent for that session.
- **Email Notifications:**
    - Notify faculty when an announcement is posted.
    - Notify faculty when their account is locked/unlocked (partially implemented).
    - Notify admin when a faculty member updates their status to "On Leave".
- **Real-time Updates:** Use Socket.io to push "Recent Activity" and "Announcements" to dashboards without requiring page refreshes or polling.

---

## 4. UI/UX Refinements
- **Dark Mode Consistency:** Ensure all components (especially custom charts and sheets) adhere strictly to the theme.
- **Mobile Responsiveness:** While most pages are responsive, some tables (like System Logs) could benefit from a "Card View" on mobile similar to Faculty Management.
- **Form Validation:** Enhance client-side validation for Faculty Registration and Attendance logging (e.g., using Zod or Formik).
- **Profile Customization:** Allow faculty to upload a profile picture and update basic contact info (while keeping institutional data like Employee ID read-only).
