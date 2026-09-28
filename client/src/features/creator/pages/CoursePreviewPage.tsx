import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourseHierarchy, useValidateCourse } from '../hooks/useCourseValidation';
import { Loader2, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, BookOpen, Video, FileText, Code, CheckSquare, Briefcase, ExternalLink, Play } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { courseValidationKeys } from '../hooks/useCourseValidation';
import { useTransitionCourseStatus } from '../hooks/useCourses';

export function CoursePreviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: hierarchy, isLoading: isHierarchyLoading, error: hierarchyError } = useCourseHierarchy(courseId!);
  const { data: issues, isLoading: isIssuesLoading, refetch: refetchValidation } = useValidateCourse(courseId!);
  const { mutateAsync: transitionStatus, isPending: isTransitioning } = useTransitionCourseStatus(courseId!);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleValidate = async () => {
    setShowValidation(true);
    await queryClient.invalidateQueries({ queryKey: courseValidationKeys.issues(courseId!) });
    await refetchValidation();
  };

  if (isHierarchyLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading course preview...</p>
      </div>
    );
  }

  if (hierarchyError || !hierarchy) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 text-red-800 rounded-md border border-red-200 mt-8">
        <h2 className="text-lg font-semibold mb-2">Error Loading Preview</h2>
        <p>{hierarchyError?.message || 'Course not found / unauthorized access.'}</p>
        <Link to={`/creator/dashboard`} className="inline-flex items-center gap-2 mt-4 text-red-900 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { course, modules, lectures, contents, videos, resources, checkpoints, quizzes, questions, projects, milestones } = hierarchy;

  const currentModule = modules.find(m => m.id === activeModuleId) || modules[0];
  const currentModuleLectures = currentModule ? lectures.filter(l => l.moduleId === currentModule.id) : [];
  const currentLecture = currentModuleLectures.find(l => l.id === activeLectureId) || currentModuleLectures[0];

  // Validation Panel
  const errors = issues?.filter(i => i.severity === 'ERROR') || [];
  const warnings = issues?.filter(i => i.severity === 'WARNING') || [];

  const handleIssueNavigation = (issue: any) => {
    if (issue.checkpointId || issue.quizId || issue.projectId) {
      navigate(`/creator/courses/${courseId}/modules/${issue.moduleId}/lectures/${issue.lectureId}`);
    } else if (issue.lectureId) {
      navigate(`/creator/courses/${courseId}/modules/${issue.moduleId}/lectures/${issue.lectureId}`);
    } else if (issue.moduleId) {
      navigate(`/creator/courses/${courseId}/modules/${issue.moduleId}`);
    } else {
      navigate(`/creator/courses/${courseId}/edit`);
    }
  };

  const handleMarkReady = async () => {
    if (errors.length > 0) return;
    await transitionStatus('READY_FOR_REVIEW');
  };

  const handleSubmitReview = async () => {
    if (errors.length > 0) return;
    
    // Revalidate before submission
    const currentIssues = await refetchValidation();
    const currentErrors = currentIssues.data?.filter(i => i.severity === 'ERROR') || [];
    if (currentErrors.length > 0) {
      alert('Validation failed. Please fix the errors before submitting.');
      return;
    }
    
    if (confirm('Submitting this course will move it into review.\nYou will not be able to edit it while it is pending review.')) {
      await transitionStatus('PENDING_REVIEW');
    }
  };

  const renderValidationPanel = () => {
    if (!showValidation && course.status === 'DRAFT') return null;

    if (isIssuesLoading) {
      return (
        <div className="bg-white border rounded-lg p-6 shadow-sm mb-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Course Validation & Submission</h2>
            <div className="mt-2 flex items-center gap-2">
               <span className="text-sm font-medium text-gray-500">Current Status:</span>
               <span className={`px-2 py-1 rounded text-xs font-bold
                  ${course.status === 'DRAFT' ? 'bg-gray-200 text-gray-800' : ''}
                  ${course.status === 'READY_FOR_REVIEW' ? 'bg-blue-100 text-blue-800' : ''}
                  ${course.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : ''}
                  ${course.status === 'CHANGES_REQUESTED' ? 'bg-orange-100 text-orange-800' : ''}
                  ${course.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
               `}>
                 {course.status.replace(/_/g, ' ')}
               </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleValidate}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md transition"
            >
              Re-run Validation
            </button>
            {course.status === 'DRAFT' && errors.length === 0 && (
              <button 
                onClick={handleMarkReady}
                disabled={isTransitioning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition disabled:opacity-50"
              >
                Mark as Ready for Review
              </button>
            )}
            {course.status === 'READY_FOR_REVIEW' && errors.length === 0 && (
              <button 
                onClick={handleSubmitReview}
                disabled={isTransitioning}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition disabled:opacity-50"
              >
                Submit for Review
              </button>
            )}
          </div>
        </div>
        
        {course.status === 'PENDING_REVIEW' ? (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
             <h3 className="text-yellow-800 font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Pending Review</h3>
             <p className="text-yellow-700 mt-1">This course has been submitted and is awaiting review. Editing is disabled.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className={`px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 ${errors.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {errors.length > 0 ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                Errors: {errors.length}
              </div>
              <div className={`px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 ${warnings.length > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                <AlertTriangle className="w-4 h-4" />
                Warnings: {warnings.length}
              </div>
            </div>

            {/* Course Health & Activity Balance */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5" /> Course Health & Activity Balance
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded shadow-sm border border-blue-50">
                   <div className="text-2xl font-bold text-blue-700">{videos.length}</div>
                   <div className="text-xs font-semibold text-gray-500 uppercase">Videos</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm border border-blue-50">
                   <div className="text-2xl font-bold text-green-700">{checkpoints.length}</div>
                   <div className="text-xs font-semibold text-gray-500 uppercase">Coding Checkpoints</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm border border-blue-50">
                   <div className="text-2xl font-bold text-purple-700">{quizzes.length}</div>
                   <div className="text-xs font-semibold text-gray-500 uppercase">Quizzes</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm border border-blue-50">
                   <div className="text-2xl font-bold text-orange-700">{projects.length}</div>
                   <div className="text-xs font-semibold text-gray-500 uppercase">Projects</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-800">
                {checkpoints.length + quizzes.length + projects.length < videos.length ? (
                  <p><strong>Suggestion:</strong> Your course has more passive videos than active exercises. Consider adding more coding checkpoints or quizzes.</p>
                ) : (
                  <p><strong>Great Job!</strong> You have a healthy balance of active learning activities vs passive videos.</p>
                )}
              </div>
            </div>

            {errors.length > 0 && <p className="text-red-600 font-medium mb-4">Submission blocked. {errors.length} validation errors must be fixed before this course can be submitted.</p>}
            {errors.length === 0 && <p className="text-green-600 font-medium mb-4">No validation errors found.</p>}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {issues?.map((issue, idx) => (
                <div key={idx} className={`p-4 border rounded-md flex items-start gap-3 ${issue.severity === 'ERROR' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  {issue.severity === 'ERROR' ? <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className={`font-medium ${issue.severity === 'ERROR' ? 'text-red-900' : 'text-yellow-900'}`}>{issue.message}</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase font-mono">{issue.code}</p>
                  </div>
                  <button
                    onClick={() => handleIssueNavigation(issue)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${issue.severity === 'ERROR' ? 'bg-red-100 hover:bg-red-200 text-red-800' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'}`}
                  >
                    Fix
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Preview Layout
  const handleNextLecture = () => {
    if (!currentModule || !currentLecture) return;
    const currentIndex = currentModuleLectures.findIndex(l => l.id === currentLecture.id);
    if (currentIndex < currentModuleLectures.length - 1) {
      setActiveLectureId(currentModuleLectures[currentIndex + 1].id);
    } else {
      // Find next module
      const currentModIdx = modules.findIndex(m => m.id === currentModule.id);
      if (currentModIdx < modules.length - 1) {
        const nextMod = modules[currentModIdx + 1];
        setActiveModuleId(nextMod.id);
        const nextModLectures = lectures.filter(l => l.moduleId === nextMod.id);
        if (nextModLectures.length > 0) setActiveLectureId(nextModLectures[0].id);
      }
    }
  };

  const handlePrevLecture = () => {
    if (!currentModule || !currentLecture) return;
    const currentIndex = currentModuleLectures.findIndex(l => l.id === currentLecture.id);
    if (currentIndex > 0) {
      setActiveLectureId(currentModuleLectures[currentIndex - 1].id);
    } else {
      // Find previous module
      const currentModIdx = modules.findIndex(m => m.id === currentModule.id);
      if (currentModIdx > 0) {
        const prevMod = modules[currentModIdx - 1];
        setActiveModuleId(prevMod.id);
        const prevModLectures = lectures.filter(l => l.moduleId === prevMod.id);
        if (prevModLectures.length > 0) setActiveLectureId(prevModLectures[prevModLectures.length - 1].id);
      }
    }
  };

  const hasNext = () => {
    if (!currentModule || !currentLecture) return false;
    const currentIndex = currentModuleLectures.findIndex(l => l.id === currentLecture.id);
    if (currentIndex < currentModuleLectures.length - 1) return true;
    const currentModIdx = modules.findIndex(m => m.id === currentModule.id);
    return currentModIdx < modules.length - 1;
  };

  const hasPrev = () => {
    if (!currentModule || !currentLecture) return false;
    const currentIndex = currentModuleLectures.findIndex(l => l.id === currentLecture.id);
    if (currentIndex > 0) return true;
    const currentModIdx = modules.findIndex(m => m.id === currentModule.id);
    return currentModIdx > 0;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link to={`/creator/courses/${courseId}`} className="flex items-center gap-1 hover:text-gray-900 transition">
            <ArrowLeft className="w-4 h-4" />
            Exit Preview
          </Link>
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">PREVIEW MODE</span>
        </div>
        <button
          onClick={handleValidate}
          className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition shadow-sm"
        >
          Validate Course
        </button>
      </div>

      {renderValidationPanel()}

      {/* Course Header */}
      <div className="bg-gray-900 text-white rounded-lg p-8 shadow-sm relative overflow-hidden">
        {course.thumbnailUrl && (
          <div className="absolute inset-0 opacity-20">
            <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">{course.title || 'Untitled Course'}</h1>
          <p className="text-xl text-gray-300 mb-6">{course.tagline}</p>
          <p className="text-gray-400 mb-6">{course.shortDescription}</p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            {course.difficulty && <span className="bg-gray-800 px-3 py-1 rounded-full">{course.difficulty}</span>}
            {course.duration && <span className="bg-gray-800 px-3 py-1 rounded-full">{course.duration}</span>}
            {course.language && <span className="bg-gray-800 px-3 py-1 rounded-full">{course.language}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-900 px-2">Course Content</h3>
          
          {modules.length === 0 ? (
            <p className="text-sm text-gray-500 italic px-2">No modules found.</p>
          ) : (
            <div className="space-y-2">
              {modules.map((mod, mIdx) => (
                <div key={mod.id} className="border rounded-md bg-white overflow-hidden shadow-sm">
                  <button 
                    className={`w-full text-left px-4 py-3 font-semibold text-sm transition flex justify-between items-center ${activeModuleId === mod.id ? 'bg-gray-50 text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => {
                      setActiveModuleId(mod.id);
                      const mLectures = lectures.filter(l => l.moduleId === mod.id);
                      if (mLectures.length > 0 && (!currentModule || currentModule.id !== mod.id)) {
                        setActiveLectureId(mLectures[0].id);
                      }
                    }}
                  >
                    <span>{mIdx + 1}. {mod.title || 'Untitled Module'}</span>
                  </button>
                  
                  {activeModuleId === mod.id && (
                    <div className="flex flex-col border-t bg-white">
                      {lectures.filter(l => l.moduleId === mod.id).map((lec, lIdx) => (
                        <button
                          key={lec.id}
                          onClick={() => setActiveLectureId(lec.id)}
                          className={`text-left px-4 py-2.5 text-sm transition flex items-center gap-3 ${activeLectureId === lec.id ? 'bg-blue-50 text-blue-900 border-l-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'}`}
                        >
                          <Play className={`w-3 h-3 ${activeLectureId === lec.id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="truncate">{mIdx + 1}.{lIdx + 1} {lec.title || 'Untitled Lecture'}</span>
                        </button>
                      ))}
                      {lectures.filter(l => l.moduleId === mod.id).length === 0 && (
                        <p className="text-xs text-gray-500 italic px-4 py-3">No lectures</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lecture Content Viewer */}
        <div className="lg:col-span-3">
          {!currentLecture ? (
            <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Lecture</h3>
              <p className="text-gray-500">Choose a lecture from the sidebar to preview its content.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm p-8 space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentLecture.title}</h2>
                <p className="text-lg text-gray-600 leading-relaxed">{currentLecture.description}</p>
              </div>

              {/* Video */}
              {(() => {
                const video = videos.find(v => v.lectureId === currentLecture.id);
                if (!video) return null;
                return (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><Video className="w-5 h-5 text-gray-500" /> Video Lesson</h3>
                    <div className="bg-gray-900 aspect-video rounded-lg flex items-center justify-center overflow-hidden relative">
                      {video.url.includes('youtube.com') || video.url.includes('vimeo.com') ? (
                        <iframe src={video.url} className="w-full h-full" allowFullScreen />
                      ) : (
                        <div className="text-center text-white">
                          <Play className="w-12 h-12 text-white/50 mx-auto mb-4" />
                          <p className="font-medium">Video Player Placeholder</p>
                          <a href={video.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline mt-2 inline-block text-sm">External Link: {video.url}</a>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold text-gray-900">{video.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Content Blocks */}
              <div className="space-y-8">
                {contents.filter(c => c.lectureId === currentLecture.id).map((content, idx) => {
                  if (content.type === 'TEXT') {
                    return (
                      <div key={idx} className="prose max-w-none prose-blue">
                        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{content.content}</p>
                      </div>
                    );
                  }
                  if (content.type === 'CALLOUT') {
                    return (
                      <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                        <p className="text-blue-900 font-medium whitespace-pre-wrap">{content.content}</p>
                      </div>
                    );
                  }
                  if (content.type === 'CODE') {
                    try {
                      const codeData = JSON.parse(content.content);
                      return (
                        <div key={idx} className="rounded-lg overflow-hidden border bg-[#1E1E1E] shadow-sm">
                          <div className="bg-[#2D2D2D] px-4 py-2 text-xs font-mono text-gray-400 flex items-center gap-2">
                            <Code className="w-3 h-3" /> {codeData.language}
                          </div>
                          <pre className="p-4 overflow-x-auto text-sm text-gray-300 font-mono">
                            <code>{codeData.code}</code>
                          </pre>
                        </div>
                      );
                    } catch (e) {
                      return <div key={idx} className="p-4 bg-red-50 text-red-500 border border-red-200 rounded">Invalid code block JSON</div>;
                    }
                  }
                  return null;
                })}
              </div>

              {/* Checkpoints */}
              {checkpoints.filter(c => c.lectureId === currentLecture.id).length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><Code className="w-5 h-5 text-gray-500" /> Coding Checkpoints</h3>
                  {checkpoints.filter(c => c.lectureId === currentLecture.id).map((cp, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-900">{cp.title}</h4>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded mt-1 inline-block">{cp.xp} XP</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{cp.language}</span>
                      </div>
                      <div className="p-6 bg-white space-y-4">
                        <div className="prose text-sm max-w-none text-gray-700 whitespace-pre-wrap">{cp.instructions}</div>
                        <div className="bg-[#1E1E1E] rounded-md p-4 mt-4 overflow-x-auto">
                          <pre className="text-sm text-gray-300 font-mono"><code>{cp.starterCode}</code></pre>
                        </div>
                        <div className="mt-4 flex gap-4">
                          <button disabled className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed">Run Tests (Disabled in Preview)</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quizzes */}
              {quizzes.filter(q => q.lectureId === currentLecture.id).length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><CheckSquare className="w-5 h-5 text-gray-500" /> Quizzes</h3>
                  {quizzes.filter(q => q.lectureId === currentLecture.id).map((quiz, idx) => (
                    <div key={idx} className="border rounded-lg p-6 shadow-sm bg-white">
                      <h4 className="font-bold text-gray-900 text-lg">{quiz.title}</h4>
                      <p className="text-gray-600 mt-2 mb-6">{quiz.description}</p>
                      
                      <div className="space-y-8">
                        {questions.filter(q => q.quizId === quiz.id).map((qq, qIdx) => (
                          <div key={qIdx} className="bg-gray-50 border rounded-lg p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">Q{qIdx + 1} • {qq.type === 'MCQ' ? 'Multiple Choice' : 'True / False'}</span>
                              <span className="text-xs text-gray-500 font-medium">{qq.xp} XP</span>
                            </div>
                            <p className="font-medium text-gray-900 mb-4">{qq.question}</p>
                            
                            <div className="space-y-2 mb-4">
                              {qq.options.map((opt: any) => (
                                <div key={opt.id} className={`p-3 rounded-md border text-sm flex items-center gap-3 ${opt.id === qq.correctOptionId ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${opt.id === qq.correctOptionId ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'}`}>
                                    {opt.id === qq.correctOptionId && <CheckCircle2 className="w-3 h-3" />}
                                  </div>
                                  <span className={opt.id === qq.correctOptionId ? 'font-semibold text-green-900' : 'text-gray-700'}>{opt.text}</span>
                                  {opt.id === qq.correctOptionId && <span className="ml-auto text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">Correct Answer</span>}
                                </div>
                              ))}
                            </div>
                            <div className="bg-blue-50/50 p-3 rounded border text-sm text-gray-700">
                              <span className="font-semibold block mb-1">Explanation:</span>
                              {qq.explanation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {projects.filter(p => p.lectureId === currentLecture.id).length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><Briefcase className="w-5 h-5 text-gray-500" /> Projects</h3>
                  {projects.filter(p => p.lectureId === currentLecture.id).map((proj, idx) => (
                    <div key={idx} className="border rounded-lg shadow-sm bg-white overflow-hidden">
                      <div className="bg-gray-900 p-6 text-white">
                        <h4 className="font-bold text-2xl">{proj.title}</h4>
                        <p className="text-gray-300 mt-2">{proj.description}</p>
                        <span className="text-sm bg-gray-800 text-gray-300 px-3 py-1 rounded-full mt-4 inline-block font-medium">{proj.xp} XP Project</span>
                      </div>
                      
                      <div className="p-6">
                        <h5 className="font-bold text-gray-900 mb-2">Instructions</h5>
                        <div className="prose text-sm max-w-none text-gray-700 whitespace-pre-wrap mb-8 bg-gray-50 p-4 rounded-md border">
                          {proj.instructions}
                        </div>

                        <h5 className="font-bold text-gray-900 mb-4">Milestones ({milestones.filter(m => m.projectId === proj.id).length})</h5>
                        <div className="space-y-3">
                          {milestones.filter(m => m.projectId === proj.id).map((ms, msIdx) => (
                            <div key={msIdx} className="flex gap-4 p-4 border rounded-md">
                              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                                {msIdx + 1}
                              </div>
                              <div>
                                <h6 className="font-bold text-gray-900">{ms.title} <span className="text-xs font-normal text-gray-500 ml-2">({ms.xp} XP)</span></h6>
                                <p className="text-sm text-gray-600 mt-1">{ms.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resources */}
              {(() => {
                const lectureResources = resources.filter(r => r.lectureId === currentLecture.id);
                if (lectureResources.length === 0) return null;
                return (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-gray-500" /> Additional Resources</h3>
                    <div className="flex flex-col gap-2">
                      {lectureResources.map((res, idx) => (
                        <a key={idx} href={res.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition group">
                          <span className="font-medium text-gray-700 group-hover:text-blue-600">{res.title}</span>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}
              
              {/* Previous / Next Lecture Navigation */}
              <div className="pt-8 flex justify-between border-t border-gray-100">
                <button
                  onClick={handlePrevLecture}
                  disabled={!hasPrev()}
                  className="px-6 py-3 bg-white border text-gray-700 rounded-md font-medium hover:bg-gray-50 disabled:opacity-30 transition"
                >
                  &larr; Previous Lesson
                </button>
                <button
                  onClick={handleNextLecture}
                  disabled={!hasNext()}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-30 transition"
                >
                  Next Lesson &rarr;
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
