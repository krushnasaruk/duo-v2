import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminReviewCourse, useReviewCourseAction } from '../hooks/useAdmin';
import { Loader2, ArrowLeft, BookOpen, Play, CheckCircle2, XCircle, Code, AlertCircle, FileText, CheckSquare, Target } from 'lucide-react';

export function CourseReviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, isLoading, error } = useAdminReviewCourse(courseId!);
  const { mutateAsync: reviewCourse, isPending: isReviewing } = useReviewCourseAction();

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{ type: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES', feedback: string } | null>(null);
  const [reviewError, setReviewError] = useState('');

  const handleReviewSubmit = async () => {
    if (!reviewModal) return;
    setReviewError('');

    if (reviewModal.type !== 'APPROVE' && !reviewModal.feedback.trim()) {
      setReviewError('Feedback is required.');
      return;
    }

    try {
      await reviewCourse({ courseId: courseId!, action: reviewModal.type, feedback: reviewModal.feedback });
      setReviewModal(null);
    } catch (err: any) {
      setReviewError(err.message || 'Action failed.');
    }
  };

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
        <p>{error?.message || 'Course not found'}</p>
        <Link to={`/admin/courses`} className="inline-flex items-center gap-2 mt-4 text-red-900 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </Link>
      </div>
    );
  }

  const { hierarchy, validation, reviewHistory } = data as any;
  const { course, modules, lectures, contents, videos, resources, checkpoints, quizzes, questions, projects, milestones } = hierarchy;

  const currentModule = modules.find((m: any) => m.id === activeModuleId) || modules[0];
  const currentModuleLectures = currentModule ? lectures.filter((l: any) => l.moduleId === currentModule.id) : [];
  const currentLecture = currentModuleLectures.find((l: any) => l.id === activeLectureId) || currentModuleLectures[0];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentLectureTimeline = useMemo(() => {
    if (!currentLecture) return [];
    const activities: any[] = [];
    
    checkpoints.filter((c: any) => c.lectureId === currentLecture.id && c.timestamp !== undefined).forEach((c: any) => {
      activities.push({ ...c, typeLabel: 'Coding Checkpoint', timestamp: c.timestamp });
    });
    
    questions.filter((q: any) => q.lectureId === currentLecture.id && q.timestamp !== undefined).forEach((q: any) => {
      activities.push({ ...q, typeLabel: 'Question', timestamp: q.timestamp, title: q.question });
    });
    
    return activities.sort((a, b) => a.timestamp - b.timestamp);
  }, [currentLecture, checkpoints, questions]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link to={`/admin/courses`} className="flex items-center gap-1 hover:text-gray-900 transition font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Review Queue
          </Link>
          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Admin Read-Only</span>
          <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs uppercase tracking-wider border">Status: {course.status}</span>
        </div>

        {course.status === 'PENDING_REVIEW' && (
          <div className="flex gap-2">
            <button
              onClick={() => setReviewModal({ type: 'REQUEST_CHANGES', feedback: '' })}
              className="bg-orange-100 text-orange-800 hover:bg-orange-200 px-4 py-2 rounded text-sm font-bold transition"
            >
              Request Changes
            </button>
            <button
              onClick={() => setReviewModal({ type: 'REJECT', feedback: '' })}
              className="bg-red-100 text-red-800 hover:bg-red-200 px-4 py-2 rounded text-sm font-bold transition"
            >
              Reject
            </button>
            <button
              onClick={() => setReviewModal({ type: 'APPROVE', feedback: '' })}
              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded text-sm font-bold transition shadow-sm"
            >
              Approve
            </button>
          </div>
        )}
      </div>

      {/* Course Status Details & Review History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gray-600" /> Course Status Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Status:</span>
              <span className="font-semibold text-gray-900">{course.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Submission Date:</span>
              <span className="text-gray-900">{new Date(course.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Updated:</span>
              <span className="text-gray-900">{new Date(course.updatedAt).toLocaleString()}</span>
            </div>
            {course.reviewFeedback && (
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <span className="text-gray-500 block mb-1 font-medium">Latest Feedback:</span>
                <p className="text-gray-800 whitespace-pre-wrap">{course.reviewFeedback}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-600" /> Review History
          </h3>
          {reviewHistory && reviewHistory.length > 0 ? (
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {reviewHistory.map((record: any) => (
                <div key={record.id} className="border-l-4 pl-3 py-1 text-sm border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                      record.decision === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      record.decision === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {record.decision}
                    </span>
                    <span className="text-gray-500 text-xs">{new Date(record.createdAt).toLocaleString()}</span>
                  </div>
                  {record.feedback && <p className="text-gray-700 text-xs mt-1 bg-gray-50 p-2 rounded">{record.feedback}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No review history recorded.</p>
          )}
        </div>
      </div>

      {/* Validation Read-Only Info */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-gray-600" /> Course Health Information
        </h3>
        {validation.length === 0 ? (
          <p className="text-green-700 font-medium bg-green-50 p-3 rounded border border-green-200">No validation issues found. Course structure appears healthy.</p>
        ) : (
          <div className="space-y-2 bg-gray-50 p-4 rounded border border-gray-200 max-h-[200px] overflow-y-auto">
            {validation.map((issue: any, idx: number) => (
              <div key={idx} className="flex gap-2 text-sm items-start">
                {issue.severity === 'ERROR' ? (
                   <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                ) : issue.severity === 'WARNING' ? (
                   <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                ) : (
                   <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                )}
                <span className={issue.severity === 'ERROR' ? 'text-red-700 font-medium' : 'text-gray-700'}>
                  <span className="font-bold mr-1">[{issue.severity}]</span>
                  {issue.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Header */}
      <div className="bg-gray-900 text-white rounded-lg p-8 shadow-sm relative overflow-hidden">
        {course.thumbnailUrl ? (
          <div className="absolute inset-0 opacity-20">
            <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="absolute inset-0 opacity-10 bg-gray-800 flex items-center justify-center">
             <span className="text-white text-xl font-bold opacity-50 tracking-widest uppercase">No thumbnail provided</span>
          </div>
        )}
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider mb-4 opacity-80">
             <span>Creator: {course.creatorId}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{course.title || 'Untitled Course'}</h1>
          <p className="text-xl text-gray-300 mb-6 font-light">{course.tagline || 'No tagline'}</p>
          <p className="text-gray-400 mb-6">{course.shortDescription}</p>
          
          <div className="flex flex-wrap gap-3 text-sm">
            {course.category && <span className="bg-blue-900/50 text-blue-200 px-3 py-1 rounded-full border border-blue-800/50">{course.category}</span>}
            {course.difficulty && <span className="bg-purple-900/50 text-purple-200 px-3 py-1 rounded-full border border-purple-800/50">{course.difficulty}</span>}
            {course.duration && <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">{course.duration}</span>}
            {course.language && <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">{course.language}</span>}
          </div>
        </div>
      </div>

      {/* Course Overview Metadata */}
      <div className="bg-white border rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> Full Description</h4>
                 <p className="text-gray-600 text-sm whitespace-pre-wrap">{course.fullDescription || 'No description provided.'}</p>
              </div>

              <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Target Audience</h4>
                 <p className="text-gray-600 text-sm">{course.targetAudience || 'Not specified.'}</p>
              </div>

              <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Skills</h4>
                 {course.skills && course.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                       {course.skills.map((skill: string, i: number) => (
                          <span key={i} className="bg-gray-100 border text-gray-700 px-2 py-1 rounded text-xs">{skill}</span>
                       ))}
                    </div>
                 ) : (
                    <p className="text-gray-500 text-sm">No skills specified.</p>
                 )}
              </div>
           </div>

           <div className="space-y-6">
              <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-gray-400" /> Learning Objectives</h4>
                 {course.learningObjectives && course.learningObjectives.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                       {course.learningObjectives.map((obj: string, i: number) => (
                          <li key={i}>{obj}</li>
                       ))}
                    </ul>
                 ) : (
                    <p className="text-gray-500 text-sm">No objectives specified.</p>
                 )}
              </div>

              <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Prerequisites</h4>
                 {course.prerequisites && course.prerequisites.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                       {course.prerequisites.map((req: string, i: number) => (
                          <li key={i}>{req}</li>
                       ))}
                    </ul>
                 ) : (
                    <p className="text-gray-500 text-sm">No prerequisites specified.</p>
                 )}
              </div>

              <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Glossary</h4>
                 {course.glossary && course.glossary.length > 0 ? (
                    <div className="space-y-3">
                       {course.glossary.map((g: any, i: number) => (
                          <div key={i} className="bg-gray-50 p-3 rounded border text-sm">
                             <span className="font-bold text-gray-900">{g.term}:</span> <span className="text-gray-600">{g.definition}</span>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <p className="text-gray-500 text-sm">No glossary terms.</p>
                 )}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-900 px-2">Course Structure</h3>
          {modules.map((mod: any, mIdx: number) => {
             const mLectures = lectures.filter((l: any) => l.moduleId === mod.id);
             return (
               <div key={mod.id} className="border rounded-md bg-white overflow-hidden shadow-sm">
                 <button 
                   className={`w-full text-left px-4 py-3 font-semibold text-sm transition flex justify-between items-center ${activeModuleId === mod.id ? 'bg-gray-50 text-gray-900' : 'bg-gray-100 text-gray-700'}`}
                   onClick={() => {
                     setActiveModuleId(mod.id);
                     if (mLectures.length > 0) setActiveLectureId(mLectures[0].id);
                   }}
                 >
                   <span className="truncate pr-2">M{mIdx + 1}. {mod.title || 'Untitled Module'}</span>
                   <span className="text-xs font-normal text-gray-400 whitespace-nowrap">{mLectures.length} lectures</span>
                 </button>
                 
                 {activeModuleId === mod.id && (
                   <div className="flex flex-col border-t bg-white">
                     {mLectures.map((lec: any, lIdx: number) => (
                       <button
                         key={lec.id}
                         onClick={() => setActiveLectureId(lec.id)}
                         className={`text-left px-4 py-2.5 text-sm transition flex items-center gap-3 ${activeLectureId === lec.id ? 'bg-blue-50 text-blue-900 border-l-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'}`}
                       >
                         <Play className={`w-3 h-3 ${activeLectureId === lec.id ? 'text-blue-600' : 'text-gray-400 shrink-0'}`} />
                         <span className="truncate">{mIdx + 1}.{lIdx + 1} {lec.title || 'Untitled Lecture'}</span>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             )
          })}
        </div>

        {/* Lecture Content Viewer */}
        <div className="lg:col-span-3">
          {!currentLecture ? (
            <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Lecture</h3>
              <p className="text-gray-500 text-sm">Navigate the modules on the left to inspect content.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm p-8 space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentLecture.title}</h2>
                <p className="text-lg text-gray-600 leading-relaxed">{currentLecture.description}</p>
              </div>

              {/* Video */}
              {(() => {
                const video = videos.find((v: any) => v.lectureId === currentLecture.id);
                if (!video) return (
                  <div className="space-y-4">
                     <h3 className="text-xl font-bold border-b pb-2">Video Lesson</h3>
                     <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed">
                        <p className="text-gray-500 font-medium">No video attached.</p>
                     </div>
                  </div>
                );
                return (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold border-b pb-2">Video Lesson</h3>
                    <div className="bg-gray-900 aspect-video rounded-lg flex items-center justify-center overflow-hidden">
                      {video.url.includes('youtube.com') || video.url.includes('vimeo.com') ? (
                        <iframe src={video.url} className="w-full h-full" allowFullScreen title="Lecture Video" />
                      ) : (
                        <video src={video.url} controls className="w-full h-full" controlsList="nodownload">
                           <div className="text-center text-white">
                             <Play className="w-12 h-12 text-white/50 mx-auto mb-4" />
                             <a href={video.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline mt-2 inline-block text-sm">External Link: {video.url}</a>
                           </div>
                        </video>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Interactive Timeline */}
              {currentLectureTimeline.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="text-xl font-bold border-b pb-2">Interactive Timeline</h3>
                    <div className="bg-gray-50 border rounded-lg p-6 overflow-x-auto">
                       <div className="flex items-center min-w-max">
                          <div className="flex items-center">
                             <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                             <div className="w-16 h-1 bg-gray-300"></div>
                          </div>
                          {currentLectureTimeline.map((item: any, idx: number) => (
                             <div key={idx} className="flex items-center">
                                <div className="flex flex-col items-center">
                                   <div className="text-xs font-bold text-gray-500 mb-1">{formatTime(item.timestamp)}</div>
                                   <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-200"></div>
                                   <div className="text-xs font-medium text-gray-900 mt-2 max-w-[100px] text-center truncate" title={item.title}>{item.title}</div>
                                   <div className="text-[10px] text-gray-500 uppercase">{item.typeLabel}</div>
                                </div>
                                <div className="w-32 h-1 bg-gray-300 mt-[-28px]"></div>
                             </div>
                          ))}
                          <div className="flex items-center mt-[-28px]">
                             <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {/* Content Blocks */}
              <div className="space-y-8">
                {contents.filter((c: any) => c.lectureId === currentLecture.id).map((content: any, idx: number) => {
                  if (content.type === 'TEXT') return <div key={idx} className="prose max-w-none text-gray-800 whitespace-pre-wrap">{content.content}</div>;
                  if (content.type === 'CALLOUT') return <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-900">{content.content}</div>;
                  if (content.type === 'CODE') {
                    try {
                      // Attempt to parse, but gracefully fallback if it is not JSON (maybe string?)
                      const codeData = typeof content.content === 'string' && content.content.startsWith('{') ? JSON.parse(content.content) : content;
                      return (
                        <div key={idx} className="bg-gray-900 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                          <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">{codeData.language || content.language || 'code'}</div>
                          <pre>{codeData.code || content.code || content.content}</pre>
                        </div>
                      );
                    } catch (e) { return <pre key={idx} className="bg-gray-900 p-4 rounded text-gray-300">{content.content}</pre>; }
                  }
                  if (content.type === 'WORKED_EXAMPLE') {
                     try {
                        const wData = typeof content.content === 'string' && content.content.startsWith('{') ? JSON.parse(content.content) : content;
                        return (
                           <div key={idx} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Worked Example: {wData.title || content.title}</h4>
                              <p className="text-gray-800 mb-4 text-sm font-medium">{wData.problem || content.problem}</p>
                              {(wData.steps || content.steps || []).map((step: any, sIdx: number) => (
                                 <div key={sIdx} className="mb-4 pl-4 border-l-2 border-indigo-200">
                                    <h5 className="font-bold text-sm text-gray-800">Step {sIdx + 1}: {step.title}</h5>
                                    <p className="text-sm text-gray-600 mt-1">{step.explanation}</p>
                                    {step.code && (
                                       <pre className="mt-2 bg-gray-900 text-gray-300 p-3 rounded-md text-xs overflow-x-auto">{step.code}</pre>
                                    )}
                                 </div>
                              ))}
                           </div>
                        )
                     } catch(e) { return null; }
                  }
                  if (content.type === 'COMMON_MISTAKES') {
                     try {
                        const mData = typeof content.content === 'string' && content.content.startsWith('{') ? JSON.parse(content.content) : content;
                        return (
                           <div key={idx} className="border border-red-200 rounded-lg p-6 bg-red-50">
                              <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Common Mistakes</h4>
                              {(mData.mistakes || content.mistakes || []).map((m: any, mIdx: number) => (
                                 <div key={mIdx} className="mb-4 bg-white p-4 rounded border border-red-100 shadow-sm">
                                    <p className="text-red-800 text-sm mb-2"><span className="font-bold">Mistake:</span> {m.mistake}</p>
                                    <p className="text-green-800 text-sm mb-2"><span className="font-bold">Correction:</span> {m.correction}</p>
                                    {m.explanation && <p className="text-gray-600 text-xs italic border-t pt-2 mt-2">{m.explanation}</p>}
                                 </div>
                              ))}
                           </div>
                        )
                     } catch(e) { return null; }
                  }
                  return null;
                })}
              </div>

              {/* Checkpoints */}
              {checkpoints.filter((c: any) => c.lectureId === currentLecture.id).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2"><Code className="w-5 h-5 text-gray-500" /> Coding Checkpoints</h3>
                  {checkpoints.filter((c: any) => c.lectureId === currentLecture.id).map((cp: any, idx: number) => (
                    <div key={idx} className="border p-6 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                         <h4 className="font-bold text-lg text-gray-900">{cp.title}</h4>
                         <div className="flex gap-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">{cp.language}</span>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">{cp.xp} XP</span>
                            {cp.maxAttempts && <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded">Max Attempts: {cp.maxAttempts}</span>}
                            {cp.mandatory && <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">Mandatory</span>}
                         </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{cp.instructions}</p>
                      
                      <div className="space-y-4">
                         <div>
                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Starter Code</h5>
                            <pre className="bg-gray-900 text-gray-300 text-sm p-4 rounded-lg overflow-x-auto">{cp.starterCode}</pre>
                         </div>

                         {cp.visibleTests && cp.visibleTests.length > 0 && (
                            <div>
                               <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Visible Tests</h5>
                               <div className="space-y-2">
                                  {cp.visibleTests.map((t: any, tIdx: number) => (
                                     <div key={tIdx} className="grid grid-cols-2 gap-4 bg-white p-3 rounded border text-xs font-mono">
                                        <div><span className="text-gray-400">Input:</span> {t.input}</div>
                                        <div><span className="text-gray-400">Output:</span> {t.expectedOutput}</div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         )}

                         {cp.hiddenTests && cp.hiddenTests.length > 0 && (
                            <div>
                               <h5 className="text-xs font-bold text-purple-600 uppercase mb-2 flex items-center gap-1">Hidden Tests (Admin View)</h5>
                               <div className="space-y-2">
                                  {cp.hiddenTests.map((t: any, tIdx: number) => (
                                     <div key={tIdx} className="grid grid-cols-2 gap-4 bg-purple-50 p-3 rounded border border-purple-100 text-xs font-mono text-purple-900">
                                        <div><span className="text-purple-400">Input:</span> {t.input}</div>
                                        <div><span className="text-purple-400">Output:</span> {t.expectedOutput}</div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         )}

                         {cp.hints && cp.hints.length > 0 && (
                           <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                             <h5 className="font-bold text-sm text-yellow-800 mb-2">Available Hints:</h5>
                             <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                               {cp.hints.map((hint: any, hIdx: number) => (
                                 <li key={hIdx}>{hint.content}</li>
                               ))}
                             </ul>
                           </div>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quizzes */}
              {quizzes.filter((q: any) => q.lectureId === currentLecture.id).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2"><CheckSquare className="w-5 h-5 text-gray-500" /> Quizzes</h3>
                  {quizzes.filter((q: any) => q.lectureId === currentLecture.id).map((quiz: any, idx: number) => (
                    <div key={idx} className="border p-6 rounded-lg bg-white shadow-sm">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">{quiz.title}</h4>
                      {quiz.description && <p className="text-sm text-gray-600 mb-6">{quiz.description}</p>}
                      
                      <div className="space-y-6">
                        {questions.filter((q: any) => q.quizId === quiz.id).map((qq: any, qIdx: number) => (
                          <div key={qIdx} className="bg-gray-50 p-5 rounded-lg border">
                            <div className="flex justify-between items-start mb-3">
                               <p className="font-bold text-gray-900">{qIdx + 1}. {qq.question}</p>
                               <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">{qq.xp} XP</span>
                            </div>
                            
                            {qq.type === 'PREDICT_OUTPUT' && (qq.code || qq.codeSnippet) && (
                              <div className="mb-4">
                                 <pre className="bg-gray-900 text-gray-300 text-sm p-4 rounded-lg overflow-x-auto">{qq.code || qq.codeSnippet}</pre>
                              </div>
                            )}

                            <div className="space-y-2 mt-4">
                              {qq.options.map((opt: any) => {
                                const isCorrect = opt.id === qq.correctOptionId;
                                return (
                                  <div key={opt.id} className={`p-3 rounded border text-sm flex items-center gap-3 ${isCorrect ? 'bg-green-50 border-green-200 text-green-900 font-medium' : 'bg-white border-gray-200 text-gray-700'}`}>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${isCorrect ? 'bg-green-500 border-green-600' : 'bg-gray-100 border-gray-300'}`}>
                                       {isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                    </div>
                                    {opt.text}
                                    {isCorrect && <span className="ml-auto text-xs font-bold text-green-600 uppercase">Correct Answer</span>}
                                  </div>
                                );
                              })}
                            </div>
                            
                            {qq.explanation && (
                               <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-900">
                                  <span className="font-bold">Explanation:</span> {qq.explanation}
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {projects.filter((p: any) => p.lectureId === currentLecture.id).length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2">Projects</h3>
                  {projects.filter((p: any) => p.lectureId === currentLecture.id).map((proj: any, idx: number) => (
                    <div key={idx} className="border p-6 rounded-lg bg-gray-900 text-white shadow-md">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-2xl">{proj.title}</h4>
                         <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-xs font-bold px-2 py-1 rounded">{proj.xp} XP</span>
                      </div>
                      <p className="text-sm mt-2 text-gray-300 leading-relaxed">{proj.description}</p>
                      {proj.instructions && <div className="mt-4 p-4 bg-gray-800 rounded text-sm text-gray-200 whitespace-pre-wrap">{proj.instructions}</div>}
                      
                      {milestones.filter((m: any) => m.projectId === proj.id).length > 0 && (
                         <div className="mt-6 space-y-3">
                           <h5 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Milestones</h5>
                           {milestones.filter((m: any) => m.projectId === proj.id).map((ms: any, msIdx: number) => (
                             <div key={msIdx} className="bg-gray-800 p-4 rounded border border-gray-700">
                               <div className="flex justify-between items-start">
                                  <h6 className="font-bold text-sm text-white">M{msIdx + 1}: {ms.title}</h6>
                                  <span className="text-xs font-mono text-gray-400">+{ms.xp} XP</span>
                               </div>
                               <p className="text-xs text-gray-400 mt-2">{ms.description}</p>
                             </div>
                           ))}
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2">Projects</h3>
                  <p className="text-gray-500 text-sm">No projects configured for this lecture.</p>
                </div>
              )}

              {/* Resources */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold border-b pb-2">Resources</h3>
                {resources && resources.filter((r: any) => r.lectureId === currentLecture.id).length > 0 ? (
                   <ul className="space-y-2">
                      {resources.filter((r: any) => r.lectureId === currentLecture.id).map((r: any, rIdx: number) => (
                         <li key={rIdx} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition">
                            <span className="text-sm font-medium text-gray-800">{r.title}</span>
                            <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium bg-blue-50 px-3 py-1 rounded">Open Resource</a>
                         </li>
                      ))}
                   </ul>
                ) : (
                   <p className="text-gray-500 text-sm">No resources available.</p>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {reviewModal.type === 'APPROVE' ? 'Approve Course' : reviewModal.type === 'REJECT' ? 'Reject Course' : 'Request Changes'}
              </h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Course: {course.title}</p>
              
              {reviewModal.type === 'APPROVE' ? (
                <p className="text-gray-700 mb-4 bg-green-50 p-4 rounded text-sm border border-green-100">
                  Are you sure you want to approve this course? It will immediately change its status to <strong>PUBLISHED</strong> and become visible to students.
                </p>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {reviewModal.type === 'REJECT' ? 'Rejection Reason (Required)' : 'Feedback / Changes Needed (Required)'}
                  </label>
                  <textarea
                    value={reviewModal.feedback}
                    onChange={(e) => setReviewModal({ ...reviewModal, feedback: e.target.value })}
                    className="w-full border rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={reviewModal.type === 'REJECT' ? 'Explain why the course is rejected...' : 'Describe what needs to be changed...'}
                  />
                </div>
              )}

              {reviewError && <p className="text-red-600 text-sm font-bold mb-4">{reviewError}</p>}
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setReviewModal(null)}
                disabled={isReviewing}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={isReviewing}
                className={`px-6 py-2 rounded text-sm font-bold text-white transition shadow-sm disabled:opacity-50 flex items-center gap-2 ${
                  reviewModal.type === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' :
                  reviewModal.type === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {isReviewing && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm {reviewModal.type === 'APPROVE' ? 'Approval' : reviewModal.type === 'REJECT' ? 'Rejection' : 'Change Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
