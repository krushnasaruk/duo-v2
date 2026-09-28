import { Link } from 'react-router-dom';
import { BookOpen, PlusCircle, Loader2 } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';

export function MyCourses() {
  const { data: courses, isLoading, error } = useCourses();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your educational content and courses.</p>
        </div>
        <Link
          to="/creator/courses/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Create Course
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Loading your courses...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-6 rounded-lg border border-red-200">
          <h3 className="font-semibold text-lg mb-2">Error loading courses</h3>
          <p>{error.message || 'The persistence provider might be unavailable.'}</p>
        </div>
      ) : !courses || courses.length === 0 ? (
        <div className="bg-white border rounded-lg shadow-sm p-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            You haven't created any courses yet. Create your first course to start building your CodeQuest content.
          </p>
          <Link
            to="/creator/courses/new"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Create your first course <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="aspect-video bg-gray-100 flex items-center justify-center border-b">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{course.title}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.shortDescription}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {course.status}
                  </span>
                  <Link 
                    to={`/creator/courses/${course.id}/edit`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Edit course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
