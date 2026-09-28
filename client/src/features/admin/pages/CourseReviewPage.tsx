import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdminReviewCourse, useReviewCourseAction } from '../hooks/useAdmin';
import { Loader2, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, BookOpen, Video, FileText, Code, CheckSquare, Briefcase, ExternalLink, Play } from 'lucide-react';

export function CourseReviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useAdminReviewCourse(courseId!);
  const { mutateAsync: reviewCourse, isPending: isReviewing } = useReviewCourseAction();

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading course for review...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 text-red-800 rounded-md border border-red-200 mt-8">
        <h2 className="text-lg font-semibold mb-2">Error Loading Review</h2>
        <p>{error?.message || 'Course not found / unauthorized access.'}</p>
        <Link to={`/admin/courses`} className="inline-flex items-center gap-2 mt-4 text-red-900 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </Link>
      </div>
    );
  }

  const { hierarchy, validation } = data;
  const { course, modules, lectures, contents, videos, resources, checkpoints, quizzes, questions, projects, milestones } = hierarchy;

  const currentModule = modules.find(m => m.id === activeModuleId) || modules[0];
  const currentModuleLectures = currentModule ? lectures.filter(l => l.moduleId === currentModule.id) : [];
  const currentLecture = currentModuleLectures.find(l => l.id === activeLectureId) || currentModuleLectures[0];

  const handleReviewAction = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES') => {
    let message = '';
    if (action === 'APPROVE') message = 'Are you sure you want to approve this course? It will be published.';
    if (action === 'REJECT') message = 'Are you sure you want to reject this course?';
    if (action === 'REQUEST_CHANGES') message = 'Are you sure you want to request changes? The creator will be notified.';
    
    if (confirm(message)) {
      try {
        await reviewCourse({ courseId: course.id, action });
        navigate('/admin/courses');
      } catch (err: any) {
        alert(`Action failed: ${err.message}`);
      }
    }
  };

  const handleNextLecture = () => {
    if (!currentModule || !currentLecture) return;
    const currentIndex = currentModuleLectures.findIndex(l => l.id === currentLecture.id);
    if (currentIndex < currentModuleLectures.length - 1) {
      setActiveLectureId(currentModuleLectures[currentIndex + 1].id);
    } else {
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
      const currentModIdx = modules.findIndex(m => m.id === currentModule.id);
      if (currentModIdx > 0) {
        const prevMod = modules[currentModIdx - 1];
        setActiveModuleId(prevMod.id);
        const prevModLectures = lectures.filter(l => l.moduleId === prevMod.id);
        if (prevModLectures.length > 0) setActiveLectureId(prevModLectures[prevModLectures.length - 1].id);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link to={`/admin/courses`} className="flex items-center gap-1 hover:text-gray-900 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Queue
          </Link>
          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-semibold">ADMIN REVIEW</span>
          <span className="font-semibold text-gray-700">Course Status: {course.status}</span>
        </div>
        
        {course.status === 'PENDING_REVIEW' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReviewAction('REQUEST_CHANGES')}
              disabled={isReviewing}
              className="bg-orange-100 text-orange-800 hover:bg-orange-200 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              Request Changes
            </button>
            <button
              onClick={() => handleReviewAction('REJECT')}
              disabled={isReviewing}
              className="bg-red-100 text-red-800 hover:bg-red-200 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => handleReviewAction('APPROVE')}
              disabled={isReviewing}
              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              Approve
            </button>
          </div>
        )}
      </div>

      {/* Validation Read-Only Info */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Course Validation Results</h3>
        {validation.length === 0 ? (
          <p className="text-green-700 font-medium">No validation issues found by the system.</p>
        ) : (
          <div className="space-y-2">
            {validation.map((issue: any, idx: number) => (
              <div key={idx} className="flex gap-2 text-sm">
                <span className={issue.severity === 'ERROR' ? 'text-red-600 font-bold' : 'text-yellow-600 font-bold'}>
                  [{issue.severity}]
                </span>
                <span className="text-gray-800">{issue.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

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
          {modules.map((mod: any, mIdx: number) => (
            <div key={mod.id} className="border rounded-md bg-white overflow-hidden shadow-sm">
              <button 
                className={`w-full text-left px-4 py-3 font-semibold text-sm transition flex justify-between items-center ${activeModuleId === mod.id ? 'bg-gray-50 text-gray-900' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => {
                  setActiveModuleId(mod.id);
                  const mLectures = lectures.filter(l => l.moduleId === mod.id);
                  if (mLectures.length > 0) setActiveLectureId(mLectures[0].id);
                }}
              >
                <span>{mIdx + 1}. {mod.title || 'Untitled Module'}</span>
              </button>
              
              {activeModuleId === mod.id && (
                <div className="flex flex-col border-t bg-white">
                  {lectures.filter(l => l.moduleId === mod.id).map((lec: any, lIdx: number) => (
                    <button
                      key={lec.id}
                      onClick={() => setActiveLectureId(lec.id)}
                      className={`text-left px-4 py-2.5 text-sm transition flex items-center gap-3 ${activeLectureId === lec.id ? 'bg-blue-50 text-blue-900 border-l-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'}`}
                    >
                      <Play className={`w-3 h-3 ${activeLectureId === lec.id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="truncate">{mIdx + 1}.{lIdx + 1} {lec.title || 'Untitled Lecture'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Lecture Content Viewer */}
        <div className="lg:col-span-3">
          {!currentLecture ? (
            <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Lecture</h3>
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
                    <h3 className="text-xl font-bold border-b pb-2">Video Lesson</h3>
                    <div className="bg-gray-900 aspect-video rounded-lg flex items-center justify-center overflow-hidden">
                      {video.url.includes('youtube.com') || video.url.includes('vimeo.com') ? (
                        <iframe src={video.url} className="w-full h-full" allowFullScreen />
                      ) : (
                        <div className="text-center text-white">
                          <Play className="w-12 h-12 text-white/50 mx-auto mb-4" />
                          <a href={video.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline mt-2 inline-block text-sm">External Link: {video.url}</a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Content Blocks */}
              <div className="space-y-8">
                {contents.filter(c => c.lectureId === currentLecture.id).map((content, idx) => {
                  if (content.type === 'TEXT') return <p key={idx} className="whitespace-pre-wrap">{content.content}</p>;
                  if (content.type === 'CALLOUT') return <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-4">{content.content}</div>;
                  if (content.type === 'CODE') {
                    try {
                      const codeData = JSON.parse(content.content);
                      return (
                        <div key={idx} className="bg-gray-900 rounded p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                          <div className="text-xs text-gray-500 mb-2">{codeData.language}</div>
                          {codeData.code}
                        </div>
                      );
                    } catch (e) { return null; }
                  }
                  if (content.type === 'WORKED_EXAMPLE') {
                     try {
                        const wData = JSON.parse(content.content);
                        return (
                           <div key={idx} className="border rounded-md p-4 bg-gray-50">
                              <h4 className="font-bold text-gray-900 mb-2">Worked Example</h4>
                              <p className="whitespace-pre-wrap text-sm">{wData.explanation}</p>
                              {wData.codeSnippet && (
                                <pre className="mt-2 bg-gray-900 text-gray-300 p-3 rounded text-xs overflow-x-auto">{wData.codeSnippet}</pre>
                              )}
                           </div>
                        )
                     } catch(e) { return null; }
                  }
                  if (content.type === 'COMMON_MISTAKES') {
                     try {
                        const mData = JSON.parse(content.content);
                        return (
                           <div key={idx} className="border rounded-md p-4 bg-red-50">
                              <h4 className="font-bold text-red-900 mb-2">Common Mistake</h4>
                              <p className="text-red-800 text-sm whitespace-pre-wrap mb-2"><span className="font-bold">Mistake:</span> {mData.mistake}</p>
                              <p className="text-green-800 text-sm whitespace-pre-wrap"><span className="font-bold">Correction:</span> {mData.correction}</p>
                           </div>
                        )
                     } catch(e) { return null; }
                  }
                  return null;
                })}
              </div>

              {/* Checkpoints */}
              {checkpoints.filter(c => c.lectureId === currentLecture.id).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2">Coding Checkpoints</h3>
                  {checkpoints.filter(c => c.lectureId === currentLecture.id).map((cp: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded bg-gray-50">
                      <h4 className="font-bold">{cp.title} <span className="text-xs text-gray-500 ml-2">({cp.language}, {cp.xp} XP)</span></h4>
                      <p className="text-sm mt-2 whitespace-pre-wrap">{cp.instructions}</p>
                      <pre className="bg-gray-900 text-gray-300 text-xs p-3 rounded mt-3 overflow-x-auto">{cp.starterCode}</pre>
                      
                      {cp.hints && cp.hints.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold text-sm mb-2">Hints:</h5>
                          <ul className="list-disc pl-5 text-sm">
                            {cp.hints.map((hint: any, hIdx: number) => (
                              <li key={hIdx}>{hint.content}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quizzes */}
              {quizzes.filter(q => q.lectureId === currentLecture.id).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2">Quizzes</h3>
                  {quizzes.filter(q => q.lectureId === currentLecture.id).map((quiz: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded bg-white">
                      <h4 className="font-bold">{quiz.title}</h4>
                      <div className="space-y-4 mt-4">
                        {questions.filter(q => q.quizId === quiz.id).map((qq: any, qIdx: number) => (
                          <div key={qIdx} className="bg-gray-50 p-4 rounded">
                            <p className="font-medium text-sm mb-2">Q: {qq.question}</p>
                            {qq.type === 'PREDICT_OUTPUT' && qq.codeSnippet && (
                              <pre className="bg-gray-900 text-gray-300 text-xs p-3 rounded mb-3 overflow-x-auto">{qq.codeSnippet}</pre>
                            )}
                            <ul className="space-y-1 text-sm">
                              {qq.options.map((opt: any) => (
                                <li key={opt.id} className={opt.id === qq.correctOptionId ? 'text-green-700 font-bold' : 'text-gray-600'}>
                                  {opt.id === qq.correctOptionId ? '✓ ' : '○ '}{opt.text}
                                </li>
                              ))}
                            </ul>
                            <p className="text-xs text-gray-500 mt-2">Explanation: {qq.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {projects.filter(p => p.lectureId === currentLecture.id).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2">Projects</h3>
                  {projects.filter(p => p.lectureId === currentLecture.id).map((proj: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded bg-gray-900 text-white">
                      <h4 className="font-bold text-lg">{proj.title} <span className="text-xs text-gray-400 ml-2">({proj.xp} XP)</span></h4>
                      <p className="text-sm mt-2 text-gray-300">{proj.description}</p>
                      
                      <div className="mt-4 space-y-2">
                        {milestones.filter(m => m.projectId === proj.id).map((ms: any, msIdx: number) => (
                          <div key={msIdx} className="bg-gray-800 p-3 rounded">
                            <h5 className="font-bold text-sm text-gray-200">Milestone {msIdx + 1}: {ms.title}</h5>
                            <p className="text-xs text-gray-400 mt-1">{ms.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
