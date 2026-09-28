import { useAuth } from '@/features/auth/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, PlusCircle, Users, Loader2 } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';

export function CreatorHome() {
  const { user } = useAuth();
  const creatorName = user?.display_name || 'Creator';
  const { data: courses, isLoading } = useCourses();

  const totalCourses = courses?.length || 0;
  const draftCourses = courses?.filter(c => c.status === 'DRAFT').length || 0;
  const recentCourses = courses?.slice(0, 3) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back, {creatorName}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your educational content.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          to="/creator/courses/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Create Course
        </Link>
        <Link
          to="/creator/courses"
          className="inline-flex items-center gap-2 bg-white text-gray-700 border px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <BookOpen className="w-5 h-5" />
          View My Courses
        </Link>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Courses" value={isLoading ? '...' : totalCourses.toString()} icon={BookOpen} />
        <StatCard title="Draft Courses" value={isLoading ? '...' : draftCourses.toString()} icon={Users} />
      </div>

      {/* Recent Courses */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : recentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentCourses.map(course => (
              <div key={course.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-1 truncate">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{course.status}</p>
                <Link to={`/creator/courses/${course.id}/edit`} className="text-primary text-sm font-medium hover:underline">
                  Edit Course
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border rounded-lg shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              You haven't created any courses yet.
            </p>
            <Link
              to="/creator/courses/new"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Create your first course <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-start">
      <div className="flex items-center gap-3 text-gray-600 mb-3">
        <Icon className="w-5 h-5" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <p className="text-2xl font-semibold text-gray-900 mt-auto">
        {value}
      </p>
    </div>
  );
}
