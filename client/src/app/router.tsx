import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthPage } from '@/pages/AuthPage';
import { useAuth } from '@/features/auth/AuthContext';
import { CreatorLayout } from '@/components/layout/CreatorLayout';
import { CreatorHome } from '@/features/creator/pages/CreatorHome';
import { MyCourses } from '@/features/creator/pages/MyCourses';
import { CreateCourse } from '@/features/creator/pages/CreateCourse';
import { EditCourse } from '@/features/creator/pages/EditCourse';
import { CourseBuilder } from '@/features/creator/pages/CourseBuilder';
import { CoursePreviewPage } from '@/features/creator/pages/CoursePreviewPage';
import { LectureBuilder } from '@/features/creator/pages/LectureBuilder';
import { LectureActivitiesPage } from '@/features/creator/pages/LectureActivitiesPage';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { ReviewQueuePage } from '@/features/admin/pages/ReviewQueuePage';
import { CourseReviewPage } from '@/features/admin/pages/CourseReviewPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (user.role !== 'CREATOR') return <div className="flex h-screen items-center justify-center">Access Denied: Creators Only</div>;
  
  return <>{children}</>;
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (user.role !== 'ADMIN') return <div className="flex h-screen items-center justify-center">Access Denied: Admin Only</div>;
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/creator',
    element: (
      <ProtectedRoute>
        <CreatorLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <CreatorHome />,
      },
      {
        path: 'courses',
        element: <MyCourses />,
      },
      {
        path: 'courses/new',
        element: <CreateCourse />,
      },
      {
        path: 'courses/:courseId/edit',
        element: <EditCourse />,
      },
      {
        path: 'courses/:courseId/builder',
        element: <CourseBuilder />,
      },
      {
        path: 'courses/:courseId/preview',
        element: <CoursePreviewPage />,
      },
      {
        path: 'courses/:courseId/modules/:moduleId',
        element: <LectureBuilder />,
      },
      {
        path: 'courses/:courseId/modules/:moduleId/lectures/:lectureId',
        element: <LectureActivitiesPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'courses',
        element: <ReviewQueuePage />,
      },
      {
        path: 'courses/:courseId/review',
        element: <CourseReviewPage />,
      }
    ],
  },
  {
    path: '*',
    element: <Navigate to="/creator" replace />,
  },
]);
