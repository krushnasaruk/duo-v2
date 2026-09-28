import { useParams, Link } from 'react-router-dom';
import { useCourse } from '../hooks/useCourses';
import { useLecture } from '../hooks/useLectures';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CheckpointBuilder } from './CheckpointBuilder';
import { QuizBuilder } from './QuizBuilder';
import { ProjectBuilder } from './ProjectBuilder';

export function LectureActivitiesPage() {
  const { courseId, moduleId, lectureId } = useParams<{ courseId: string; moduleId: string; lectureId: string }>();
  const { data: course } = useCourse(courseId!);
  const { data: lectureData, isLoading, error } = useLecture(lectureId!, moduleId!);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading lecture activities...</p>
      </div>
    );
  }

  if (error || !lectureData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 text-red-800 rounded-md border border-red-200 mt-8">
        <h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
        <p>{error?.message || 'Lecture not found / unauthorized access.'}</p>
        <Link to={`/creator/courses/${courseId}/modules/${moduleId}`} className="inline-flex items-center gap-2 mt-4 text-red-900 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Lectures
        </Link>
      </div>
    );
  }

  const isLocked = course?.status === 'PENDING_REVIEW' || course?.status === 'PUBLISHED';
  const isReady = course?.status === 'READY_FOR_REVIEW';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Navigation */}
      <div className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <Link to={`/creator/courses/${courseId}/modules/${moduleId}`} className="flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Lecture Content
        </Link>
      </div>

      {isLocked && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
          <p className="font-bold">Course is locked</p>
          <p className="text-sm mt-1">This course is currently {course.status.replace(/_/g, ' ')}. You cannot make changes at this time.</p>
        </div>
      )}

      {isReady && (
        <div className="p-4 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
          <p className="font-bold">Ready for Review</p>
          <p className="text-sm mt-1">Editing this course will automatically move it back to DRAFT status and require re-validation.</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Lecture Activities</h1>
        <p className="text-sm text-gray-500 mt-1">For lecture: {lectureData.title}</p>
      </div>
      
      <div className={isLocked ? 'opacity-60 pointer-events-none' : ''}>

      <CheckpointBuilder lectureId={lectureId!} />
      <QuizBuilder lectureId={lectureId!} />
      <ProjectBuilder lectureId={lectureId!} />
      </div>
    </div>
  );
}
