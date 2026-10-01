import { Link } from 'react-router-dom';
import { useAdminAllCourses } from '../hooks/useAdmin';
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import type { Course } from '@codequest/shared';

export function AdminDashboardPage() {
  const { data: courses, isLoading, error } = useAdminAllCourses();

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
        <p className="font-semibold">Error loading dashboard stats</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  const pending = courses?.filter(c => c.status === 'PENDING_REVIEW') || [];
  const approved = courses?.filter(c => c.status === 'PUBLISHED') || [];
  const rejected = courses?.filter(c => c.status === 'REJECTED') || [];
  const changesRequested = courses?.filter(c => c.status === 'CHANGES_REQUESTED') || [];
  const recentSubmissions = courses?.slice(0, 5) || [];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Review Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-lg border shadow-sm p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">Pending Review</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pending.length}</p>
            </div>
            
            <div className="bg-white rounded-lg border shadow-sm p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">Approved</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{approved.length}</p>
            </div>
            
            <div className="bg-white rounded-lg border shadow-sm p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">Rejected</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{rejected.length}</p>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">Changes Requested</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{changesRequested.length}</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Submissions</h2>
            <Link to="/admin/courses" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Open Review Queue &rarr;
            </Link>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            {recentSubmissions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSubmissions.map((course: Course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-xs text-gray-500">Creator: {course.creatorId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-800">
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {new Date(course.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent submissions found.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
