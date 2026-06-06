import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/layouts/PublicLayout';
import StudentLayout from './components/layouts/StudentLayout';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Spinner from './components/common/Spinner';

// Lazy loading pages for better performance
// Public
const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const CoursesPage = lazy(() => import('./pages/public/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/public/CourseDetailPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Student
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const MyCourses = lazy(() => import('./pages/student/MyCourses'));
const LearnCourse = lazy(() => import('./pages/student/LearnCourse'));
const SubmitAssignment = lazy(() => import('./pages/student/SubmitAssignment'));
const Profile = lazy(() => import('./pages/student/Profile'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageCourses = lazy(() => import('./pages/admin/ManageCourses'));
const ManageAssignments = lazy(() => import('./pages/admin/ManageAssignments'));
const ViewSubmissions = lazy(() => import('./pages/admin/ViewSubmissions'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute roleRequired="student">
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="courses/:id/learn" element={<LearnCourse />} />
          <Route path="assignments/:id/submit" element={<SubmitAssignment />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="assignments" element={<ManageAssignments />} />
          <Route path="submissions" element={<ViewSubmissions />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
