import { Link } from 'react-router-dom';
import { useAdminReviewQueue } from '../hooks/useAdmin';
import { BookOpen, Loader2 } from 'lucide-react';

export function AdminDashboardPage() {
  const { data: queue, isLoading, error } = useAdminReviewQueue();

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {error ? (
        <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
          <p className="font-semibold">Error loading dashboard stats</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-gray-500 font-medium text-sm">Courses Awaiting Review</h3>
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-gray-300 mt-2" />
            ) : (
              <p className="text-4xl font-bold text-gray-900 mt-2">{queue?.length || 0}</p>
            )}
            
            <Link 
              to="/admin/courses" 
              className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
            >
              View Queue &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
