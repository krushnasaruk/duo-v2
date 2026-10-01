import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAllCourses } from '../hooks/useAdmin';
import { Loader2, Search, ArrowRight } from 'lucide-react';
import type { CourseStatus } from '@codequest/shared';

type SortOption = 'newest' | 'oldest';

export function ReviewQueuePage() {
  const { data: allCourses, isLoading, error } = useAdminAllCourses();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'ALL'>('PENDING_REVIEW');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredCourses = useMemo(() => {
    if (!allCourses) return [];
    
    return allCourses.filter(course => {
      // Status Filter
      if (statusFilter !== 'ALL' && course.status !== statusFilter) return false;
      
      // Category Filter
      if (categoryFilter !== 'ALL' && course.category !== categoryFilter) return false;
      
      // Difficulty Filter
      if (difficultyFilter !== 'ALL' && course.difficulty !== difficultyFilter) return false;
      
      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = course.title?.toLowerCase().includes(query);
        const matchesCategory = course.category?.toLowerCase().includes(query);
        const matchesCreator = course.creatorId?.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesCategory && !matchesCreator) return false;
      }
      
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [allCourses, searchQuery, statusFilter, categoryFilter, difficultyFilter, sortBy]);

  const uniqueCategories = useMemo(() => {
    if (!allCourses) return [];
    const cats = new Set(allCourses.map(c => c.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [allCourses]);

  const uniqueDifficulties = useMemo(() => {
    if (!allCourses) return [];
    const diffs = new Set(allCourses.map(c => c.difficulty).filter(Boolean));
    return Array.from(diffs) as string[];
  }, [allCourses]);

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
        <h2 className="font-bold">Error loading queue</h2>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Courses awaiting administrative approval</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, category, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="DRAFT">Draft</option>
            <option value="READY_FOR_REVIEW">Ready for Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
          </select>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Difficulties</option>
            {uniqueDifficulties.map(diff => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest Submission</option>
            <option value="oldest">Oldest Submission</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading queue...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">Creator: {course.creatorId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.category || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{course.difficulty || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                      course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                      course.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/admin/courses/${course.id}/review`}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 transition"
                    >
                      Review Course <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No courses are awaiting review.</h3>
          <p className="text-gray-500 mt-2">New creator submissions will appear here.</p>
        </div>
      )}
    </div>
  );
}
