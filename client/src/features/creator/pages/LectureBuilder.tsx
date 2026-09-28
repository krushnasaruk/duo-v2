import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourse } from '../hooks/useCourses';
import { useModule } from '../hooks/useModules';
import { useLectures, useCreateLecture, useUpdateLecture, useDeleteLecture, useReorderLectures } from '../hooks/useLectures';
import { ArrowLeft, Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Video, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLectureSchema } from '@codequest/shared';
import type { LectureContentBlockInput, LectureResourceInput, LectureVideoInput } from '@codequest/shared';
import { ProjectBuilder } from './ProjectBuilder';

export function LectureBuilder() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  
  const { data: course, isLoading: isCourseLoading, error: courseError } = useCourse(courseId!);
  const { data: moduleData, isLoading: isModuleLoading, error: moduleError } = useModule(moduleId!, courseId!);
  const { data: lectures, isLoading: isLecturesLoading } = useLectures(moduleId!);
  
  const { mutateAsync: createLecture, isPending: isCreating } = useCreateLecture(moduleId!);
  const { mutateAsync: updateLecture, isPending: isUpdating } = useUpdateLecture(moduleId!);
  const { mutateAsync: deleteLecture, isPending: isDeleting } = useDeleteLecture(moduleId!);
  const { mutateAsync: reorderLectures, isPending: isReordering } = useReorderLectures(moduleId!);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [deletingLectureId, setDeletingLectureId] = useState<string | null>(null);
  const [removingVideoId, setRemovingVideoId] = useState<string | null>(null);
  
  // Form handling
  const { register, control, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(createLectureSchema),
    defaultValues: {
      title: '',
      description: '',
      content: [] as LectureContentBlockInput[],
      video: null as LectureVideoInput | null,
      resources: [] as LectureResourceInput[],
      prerequisites: [] as string[],
      learningObjectives: [''] as string[]
    }
  });

  const { fields: contentFields, append: appendContent, remove: removeContent, move: moveContent } = useFieldArray({
    control,
    name: "content"
  });

  const { fields: resourceFields, append: appendResource, remove: removeResource, move: moveResource } = useFieldArray({
    control,
    name: "resources"
  });

  const { fields: objFields, append: appendObj, remove: removeObj } = useFieldArray({
    control,
    name: 'learningObjectives' as never
  });

  const watchVideo = watch('video');

  if (isCourseLoading || isModuleLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading lecture builder...</p>
      </div>
    );
  }

  if (courseError || moduleError || !course || !moduleData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 text-red-800 rounded-md border border-red-200 mt-8">
        <h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
        <p>{(courseError || moduleError)?.message || 'Course or Module not found / unauthorized access.'}</p>
        <Link to={`/creator/courses/${courseId}/builder`} className="inline-flex items-center gap-2 mt-4 text-red-900 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Course Builder
        </Link>
      </div>
    );
  }

  const handleAddBlock = (type: 'TEXT' | 'CODE' | 'CALLOUT' | 'WORKED_EXAMPLE' | 'COMMON_MISTAKES') => {
    if (type === 'TEXT') {
      appendContent({ id: crypto.randomUUID(), type, content: '' });
    } else if (type === 'CODE') {
      appendContent({ id: crypto.randomUUID(), type, language: 'javascript', code: '' });
    } else if (type === 'CALLOUT') {
      appendContent({ id: crypto.randomUUID(), type, content: '' });
    } else if (type === 'WORKED_EXAMPLE') {
      appendContent({ id: crypto.randomUUID(), type, title: '', content: '', code: '' });
    } else if (type === 'COMMON_MISTAKES') {
      appendContent({ id: crypto.randomUUID(), type, mistake: '', correction: '' });
    }
  };

  const handleAddResource = () => {
    appendResource({ id: crypto.randomUUID(), title: '', url: '' });
  };

  const handleAddVideo = () => {
    setValue('video', { id: crypto.randomUUID(), url: '', title: '', description: '' });
  };

  const handleRemoveVideo = () => {
    if (removingVideoId) {
      // It's for an existing lecture, handled by update immediately
      handleUpdateLecture(removingVideoId, { ...watch(), video: null });
      setRemovingVideoId(null);
    } else {
      // Just clear form
      setValue('video', null);
    }
  };

  const handleAddLecture = async (data: any) => {
    await createLecture(data);
    setIsAddingMode(false);
    reset({ title: '', description: '', content: [], video: null, resources: [], prerequisites: [], learningObjectives: [''] });
  };

  const handleUpdateLecture = async (lectureId: string, data: any) => {
    await updateLecture({ lectureId, data });
    setEditingLectureId(null);
    reset({ title: '', description: '', content: [], video: null, resources: [], prerequisites: [], learningObjectives: [''] });
  };

  const handleStartEdit = (lecture: any) => {
    reset({
      title: lecture.title,
      description: lecture.description,
      content: lecture.content,
      video: lecture.video || null,
      resources: lecture.resources || [],
      prerequisites: lecture.prerequisites || [],
      learningObjectives: lecture.learningObjectives?.length ? lecture.learningObjectives : [''],
    });
    setEditingLectureId(lecture.id);
  };

  const handleCancelEdit = () => {
    setEditingLectureId(null);
    setIsAddingMode(false);
    reset({ title: '', description: '', content: [], video: null, resources: [], prerequisites: [], learningObjectives: [''] });
  };

  const handleDeleteLecture = async () => {
    if (deletingLectureId) {
      await deleteLecture(deletingLectureId);
      setDeletingLectureId(null);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!lectures || index === 0) return;
    const orderedIds = [...lectures.map(l => l.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index - 1];
    orderedIds[index - 1] = temp;
    await reorderLectures(orderedIds);
  };

  const handleMoveDown = async (index: number) => {
    if (!lectures || index === lectures.length - 1) return;
    const orderedIds = [...lectures.map(l => l.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index + 1];
    orderedIds[index + 1] = temp;
    await reorderLectures(orderedIds);
  };

  const renderLectureForm = (isCreatingAction: boolean, submitHandler: any) => (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Title</label>
          <input
            type="text"
            {...register('title')}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            disabled={isCreatingAction ? isCreating : isUpdating}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            disabled={isCreatingAction ? isCreating : isUpdating}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites (Other Lectures)</label>
          <div className="space-y-2">
            {lectures?.filter(l => l.id !== editingLectureId).map(l => (
              <label key={l.id} className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded border">
                <input
                  type="checkbox"
                  value={l.id}
                  {...register('prerequisites')}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  disabled={isCreatingAction ? isCreating : isUpdating}
                />
                <span className="text-sm font-medium text-gray-700">{l.title}</span>
              </label>
            ))}
            {lectures?.filter(l => l.id !== editingLectureId).length === 0 && (
               <p className="text-xs text-gray-500 italic">No other lectures available to set as prerequisites.</p>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Learning Objectives</label>
            <button type="button" onClick={() => appendObj('')} className="text-xs flex items-center gap-1 text-primary hover:underline">
              <Plus className="w-3 h-3" /> Add Objective
            </button>
          </div>
          <div className="space-y-2">
            {objFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`learningObjectives.${index}`)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Understand the DOM"
                  disabled={isCreatingAction ? isCreating : isUpdating}
                />
                <button
                  type="button"
                  onClick={() => removeObj(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                  disabled={isCreatingAction ? isCreating : isUpdating}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Editor */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Video className="w-5 h-5 text-gray-500" /> Video
        </h3>
        {watchVideo ? (
          <div className="border rounded-md p-4 bg-gray-50 space-y-4 relative">
             <div className="absolute right-2 top-2">
                <button type="button" onClick={() => setValue('video', null)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
             </div>
             <input type="hidden" {...register('video.id')} />
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Video URL</label>
                <input
                  type="text"
                  {...register('video.url')}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                />
                {errors.video?.url && <p className="text-red-500 text-xs mt-1">{errors.video.url.message as string}</p>}
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Video Title</label>
                <input
                  type="text"
                  {...register('video.title')}
                  placeholder="Title for the video"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                />
                {errors.video?.title && <p className="text-red-500 text-xs mt-1">{errors.video.title.message as string}</p>}
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Video Description</label>
                <textarea
                  {...register('video.description')}
                  rows={2}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                />
                {errors.video?.description && <p className="text-red-500 text-xs mt-1">{errors.video.description.message as string}</p>}
             </div>
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed rounded-lg bg-gray-50">
             <p className="text-sm text-gray-500 mb-4">No video added to this lecture.</p>
             <button type="button" onClick={handleAddVideo} className="inline-flex items-center gap-2 bg-white border shadow-sm text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition">
                <Plus className="w-4 h-4" /> Add Video URL
             </button>
          </div>
        )}
      </div>

      {/* Content Blocks Editor */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold text-gray-900">Learning Content</h3>
        {errors.content?.root && (
          <p className="text-red-500 text-sm">{errors.content.root.message}</p>
        )}
        {errors.content && !errors.content.root && (
            <p className="text-red-500 text-sm">{errors.content.message as string}</p>
        )}
        <div className="space-y-4">
          {contentFields.map((field: any, fieldIdx) => (
            <div key={field.id} className="border rounded-md p-4 bg-gray-50 relative group">
              <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button type="button" onClick={() => moveContent(fieldIdx, fieldIdx - 1)} disabled={fieldIdx === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronUp className="w-4 h-4"/></button>
                <button type="button" onClick={() => moveContent(fieldIdx, fieldIdx + 1)} disabled={fieldIdx === contentFields.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronDown className="w-4 h-4"/></button>
                <button type="button" onClick={() => removeContent(fieldIdx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
              </div>
              <input type="hidden" {...register(`content.${fieldIdx}.type`)} />
              <input type="hidden" {...register(`content.${fieldIdx}.id`)} />
              
              {field.type === 'TEXT' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Text Block</label>
                  <textarea
                    {...register(`content.${fieldIdx}.content`)}
                    rows={4}
                    placeholder="Enter educational text..."
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  {errors.content?.[fieldIdx] && (errors.content[fieldIdx] as any)?.content && <p className="text-red-500 text-xs mt-1">{(errors.content[fieldIdx] as any)?.content?.message as string}</p>}
                </div>
              )}
              {field.type === 'CODE' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Code Block</label>
                  <input
                    type="text"
                    {...register(`content.${fieldIdx}.language`)}
                    placeholder="Language (e.g., javascript)"
                    className="w-1/3 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 text-sm outline-none font-mono"
                  />
                  {errors.content?.[fieldIdx] && (errors.content[fieldIdx] as any)?.language && <p className="text-red-500 text-xs mt-1">{(errors.content[fieldIdx] as any)?.language?.message as string}</p>}
                  <textarea
                    {...register(`content.${fieldIdx}.code`)}
                    rows={5}
                    placeholder="Enter code..."
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm bg-gray-900 text-gray-100"
                  />
                  {errors.content?.[fieldIdx] && (errors.content[fieldIdx] as any)?.code && <p className="text-red-500 text-xs mt-1">{(errors.content[fieldIdx] as any)?.code?.message as string}</p>}
                </div>
              )}
              {field.type === 'CALLOUT' && (
                <div>
                  <label className="block text-xs font-semibold text-blue-500 uppercase mb-2">Callout Block</label>
                  <textarea
                    {...register(`content.${fieldIdx}.content`)}
                    rows={3}
                    placeholder="Enter important highlighted information..."
                    className="w-full px-3 py-2 border border-blue-200 bg-blue-50/50 rounded-md focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                  {errors.content?.[fieldIdx] && (errors.content[fieldIdx] as any)?.content && <p className="text-red-500 text-xs mt-1">{(errors.content[fieldIdx] as any)?.content?.message as string}</p>}
                </div>
              )}
              {field.type === 'WORKED_EXAMPLE' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-purple-600 uppercase">Worked Example</label>
                  <input
                    type="text"
                    {...register(`content.${fieldIdx}.title`)}
                    placeholder="Example Title..."
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 text-sm outline-none font-medium"
                  />
                  {errors.content?.[fieldIdx] && (errors.content[fieldIdx] as any)?.title && <p className="text-red-500 text-xs mt-1">{(errors.content[fieldIdx] as any)?.title?.message as string}</p>}
                  <textarea
                    {...register(`content.${fieldIdx}.content`)}
                    rows={2}
                    placeholder="Explanation of the example..."
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                  {errors.content?.[fieldIdx] && (errors.content[fieldIdx] as any)?.content && <p className="text-red-500 text-xs mt-1">{(errors.content[fieldIdx] as any)?.content?.message as string}</p>}
                  <textarea
                    {...register(`content.${fieldIdx}.code`)}
                    rows={3}
                    placeholder="Code snippet (optional)..."
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm bg-gray-900 text-gray-100"
                  />
                </div>
              )}
              {field.type === 'COMMON_MISTAKES' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-orange-600 uppercase">Common Mistake</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">The Mistake</label>
                      <textarea
                        {...register(`content.${fieldIdx}.mistake`)}
                        rows={3}
                        placeholder="Describe the common mistake..."
                        className="w-full px-3 py-2 border border-red-200 bg-red-50/30 rounded-md focus:ring-2 focus:ring-red-500/20 outline-none text-sm"
                      />
                      {errors.content?.[fieldIdx] && (errors.content[fieldIdx] as any)?.mistake && <p className="text-red-500 text-xs mt-1">{(errors.content[fieldIdx] as any)?.mistake?.message as string}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">The Correction</label>
                      <textarea
                        {...register(`content.${fieldIdx}.correction`)}
                        rows={3}
                        placeholder="Explain how to fix it..."
                        className="w-full px-3 py-2 border border-green-200 bg-green-50/30 rounded-md focus:ring-2 focus:ring-green-500/20 outline-none text-sm"
                      />
                      {errors.content?.[fieldIdx] && (errors.content[fieldIdx] as any)?.correction && <p className="text-red-500 text-xs mt-1">{(errors.content[fieldIdx] as any)?.correction?.message as string}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {contentFields.length === 0 && (
            <p className="text-sm text-gray-500 italic py-2">Add the first content block to start building learning material.</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => handleAddBlock('TEXT')} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">+ Text</button>
            <button type="button" onClick={() => handleAddBlock('CODE')} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">+ Code</button>
            <button type="button" onClick={() => handleAddBlock('CALLOUT')} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">+ Callout</button>
            <button type="button" onClick={() => handleAddBlock('WORKED_EXAMPLE')} className="text-sm px-3 py-1.5 border border-purple-200 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100">+ Worked Example</button>
            <button type="button" onClick={() => handleAddBlock('COMMON_MISTAKES')} className="text-sm px-3 py-1.5 border border-orange-200 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100">+ Common Mistake</button>
        </div>
      </div>

      {/* Resources Editor */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
           <LinkIcon className="w-5 h-5 text-gray-500" /> Resources
        </h3>
        {errors.resources?.root && (
          <p className="text-red-500 text-sm">{errors.resources.root.message}</p>
        )}
        <div className="space-y-4">
          {resourceFields.map((field, fieldIdx) => (
             <div key={field.id} className="border rounded-md p-4 bg-gray-50 relative group flex gap-4 items-start">
               <div className="flex flex-col items-center gap-1 mt-1">
                 <button type="button" onClick={() => moveResource(fieldIdx, fieldIdx - 1)} disabled={fieldIdx === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronUp className="w-4 h-4"/></button>
                 <button type="button" onClick={() => moveResource(fieldIdx, fieldIdx + 1)} disabled={fieldIdx === resourceFields.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronDown className="w-4 h-4"/></button>
               </div>
               <div className="flex-1 space-y-3">
                 <input type="hidden" {...register(`resources.${fieldIdx}.id`)} />
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Resource Title</label>
                    <input
                      type="text"
                      {...register(`resources.${fieldIdx}.title`)}
                      placeholder="e.g. React Documentation"
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    {errors.resources?.[fieldIdx]?.title && <p className="text-red-500 text-xs mt-1">{errors.resources[fieldIdx]?.title?.message as string}</p>}
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Resource URL</label>
                    <input
                      type="text"
                      {...register(`resources.${fieldIdx}.url`)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    {errors.resources?.[fieldIdx]?.url && <p className="text-red-500 text-xs mt-1">{errors.resources[fieldIdx]?.url?.message as string}</p>}
                 </div>
               </div>
               <div className="mt-7">
                  <button type="button" onClick={() => removeResource(fieldIdx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
               </div>
             </div>
          ))}
          {resourceFields.length === 0 && (
             <div className="text-center py-6 border-2 border-dashed rounded-lg bg-gray-50">
               <p className="text-sm text-gray-500 mb-4">No resources added yet.</p>
             </div>
          )}
        </div>
        <button type="button" onClick={handleAddResource} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">
           <Plus className="w-4 h-4" /> Add Resource
        </button>
      </div>

      <div className="flex gap-2 pt-6 border-t">
        <button
          type="submit"
          disabled={isCreatingAction ? isCreating : isUpdating}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
        >
          {(isCreatingAction ? isCreating : isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Lecture'}
        </button>
        <button
          type="button"
          onClick={handleCancelEdit}
          disabled={isCreatingAction ? isCreating : isUpdating}
          className="bg-white border text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const isLocked = course?.status === 'PENDING_REVIEW' || course?.status === 'PUBLISHED';
  const isReady = course?.status === 'READY_FOR_REVIEW';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <Link to={`/creator/courses/${courseId}/builder`} className="flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Course Builder
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
        <h1 className="text-2xl font-bold text-gray-900">{moduleData.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{moduleData.description}</p>
      </div>

      {/* Lectures Section */}
      <div className={`bg-white rounded-lg border shadow-sm p-6 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Lectures</h2>
          {!isAddingMode && !editingLectureId && !isLocked && (
            <button
              onClick={() => {
                reset({ title: '', description: '', content: [], video: null, resources: [], prerequisites: [], learningObjectives: [''] });
                setIsAddingMode(true);
              }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" />
              Add Lecture
            </button>
          )}
        </div>

        {/* Lectures List */}
        <div className="space-y-4">
          {isLecturesLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : lectures && lectures.length > 0 ? (
            lectures.map((lecture, index) => (
              <div key={lecture.id} className="border rounded-md bg-gray-50 flex flex-col">
                {editingLectureId === lecture.id ? (
                  <div className="p-4 bg-white rounded-md border-b">
                    {renderLectureForm(false, (data: any) => handleUpdateLecture(lecture.id, data))}
                  </div>
                ) : (
                  <div className="p-4 flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <button 
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || isReordering}
                        className="text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleMoveDown(index)}
                        disabled={index === lectures.length - 1 || isReordering}
                        className="text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        <span className="text-gray-500 mr-2">Lecture {index + 1}:</span>
                        {lecture.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{lecture.description}</p>
                      
                      <div className="mt-3 flex gap-4 text-xs text-gray-500">
                         <span className="flex items-center gap-1">{lecture.content?.length || 0} Block(s)</span>
                         <span className="flex items-center gap-1">
                            {lecture.video ? <Video className="w-3 h-3 text-blue-500" /> : <Video className="w-3 h-3 text-gray-300" />}
                            {lecture.video ? 'Has Video' : 'No Video'}
                         </span>
                         <span className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            {lecture.resources?.length || 0} Resource(s)
                         </span>
                      </div>

                      {/* Read-only previews */}
                      {lecture.video && (
                         <div className="mt-4 p-3 bg-white border rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="bg-blue-50 p-2 rounded-full">
                                  <Video className="w-4 h-4 text-blue-600" />
                               </div>
                               <div>
                                  <p className="text-sm font-medium text-gray-900">{lecture.video.title}</p>
                                  <a href={lecture.video.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                    {lecture.video.url} <ExternalLink className="w-3 h-3" />
                                  </a>
                               </div>
                            </div>
                            <button 
                               onClick={() => setRemovingVideoId(lecture.id)} 
                               disabled={deletingLectureId === lecture.id || isReordering}
                               className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                            >
                               Remove
                            </button>
                         </div>
                      )}

                      {lecture.resources && lecture.resources.length > 0 && (
                         <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {lecture.resources.map(res => (
                               <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-white border rounded hover:bg-gray-50 transition text-sm text-gray-700">
                                  <LinkIcon className="w-4 h-4 text-gray-400" />
                                  <span className="truncate">{res.title}</span>
                               </a>
                            ))}
                         </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <Link 
                          to={`/creator/courses/${courseId}/modules/${moduleId}/lectures/${lecture.id}`}
                          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                          Manage Activities (Checkpoints, Quizzes & Projects) &rarr;
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(lecture)}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-md transition"
                        disabled={isReordering || deletingLectureId === lecture.id}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingLectureId(lecture.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        disabled={isReordering || deletingLectureId === lecture.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : !isAddingMode && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-sm text-gray-500 mb-4">No lectures in this module yet.</p>
              <button
                onClick={() => setIsAddingMode(true)}
                className="inline-flex items-center gap-2 bg-white border shadow-sm text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
              >
                <Plus className="w-4 h-4" />
                Create your first lecture to begin building the learning content
              </button>
            </div>
          )}

          {/* Add Lecture Form */}
          {isAddingMode && (
            <div className="border rounded-md bg-white p-4">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Lecture</h3>
              {renderLectureForm(true, handleAddLecture)}
            </div>
          )}
        </div>
      </div>

      {/* Module Mini Projects */}
      <div className={`mt-8 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
         <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Module Mini Projects</h2>
            <p className="text-sm text-gray-500 mt-1">Add smaller projects directly to this module to test overall module comprehension.</p>
         </div>
         <ProjectBuilder lectureId={moduleId!} />
      </div>

      {/* Delete Confirmation Dialogs */}
      {deletingLectureId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Lecture</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this lecture? All content, videos, and resources will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingLectureId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLecture}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Lecture
              </button>
            </div>
          </div>
        </div>
      )}

      {removingVideoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Video</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove the video from this lecture? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRemovingVideoId(null)}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveVideo}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Remove Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
