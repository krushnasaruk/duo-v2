import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourse } from '../hooks/useCourses';
import { useModules, useCreateModule, useUpdateModule, useDeleteModule, useReorderModules } from '../hooks/useModules';
import { ArrowLeft, Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createModuleSchema } from '@codequest/shared';

export function CourseBuilder() {
  const { courseId } = useParams<{ courseId: string }>();
  
  const { data: course, isLoading: isCourseLoading, error: courseError } = useCourse(courseId!);
  const { data: modules, isLoading: isModulesLoading } = useModules(courseId!);
  
  const { mutateAsync: createModule, isPending: isCreating } = useCreateModule(courseId!);
  const { mutateAsync: updateModule, isPending: isUpdating } = useUpdateModule(courseId!);
  const { mutateAsync: deleteModule, isPending: isDeleting } = useDeleteModule(courseId!);
  const { mutateAsync: reorderModules, isPending: isReordering } = useReorderModules(courseId!);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  
  // Form handling
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createModuleSchema),
    defaultValues: {
      title: '',
      description: '',
      learningObjectives: ['']
    }
  });

  const { fields: objFields, append: appendObj, remove: removeObj } = useFieldArray({
    control,
    name: 'learningObjectives' as never
  });

  if (isCourseLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading course builder...</p>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 text-red-800 rounded-md border border-red-200 mt-8">
        <h2 className="text-lg font-semibold mb-2">Error Loading Course</h2>
        <p>{courseError?.message || 'Course not found or unauthorized access.'}</p>
        <Link to="/creator/courses" className="inline-flex items-center gap-2 mt-4 text-red-900 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to My Courses
        </Link>
      </div>
    );
  }

  const handleAddModule = async (data: any) => {
    await createModule(data);
    setIsAddingMode(false);
    reset();
  };

  const handleUpdateModule = async (moduleId: string, data: any) => {
    await updateModule({ moduleId, data });
    setEditingModuleId(null);
    reset();
  };

  const handleStartEdit = (module: any) => {
    reset({
      title: module.title,
      description: module.description,
      learningObjectives: module.learningObjectives?.length ? module.learningObjectives : [''],
    });
    setEditingModuleId(module.id);
  };

  const handleCancelEdit = () => {
    setEditingModuleId(null);
    setIsAddingMode(false);
    reset();
  };

  const handleDeleteModule = async () => {
    if (deletingModuleId) {
      await deleteModule(deletingModuleId);
      setDeletingModuleId(null);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!modules || index === 0) return;
    const orderedIds = [...modules.map(m => m.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index - 1];
    orderedIds[index - 1] = temp;
    await reorderModules(orderedIds);
  };

  const handleMoveDown = async (index: number) => {
    if (!modules || index === modules.length - 1) return;
    const orderedIds = [...modules.map(m => m.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index + 1];
    orderedIds[index + 1] = temp;
    await reorderModules(orderedIds);
  };

  const isLocked = course?.status === 'PENDING_REVIEW' || course?.status === 'PUBLISHED';
  const isReady = course?.status === 'READY_FOR_REVIEW';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <Link to="/creator/courses" className="flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to My Courses
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

      {/* Course Header */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{course.shortDescription || 'No description provided.'}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {course.status}
            </span>
            <Link
              to={`/creator/courses/${courseId}/preview`}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md font-medium text-sm hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Eye className="w-4 h-4" />
              Preview & Validate
            </Link>
          </div>
        </div>
      </div>

      {/* Module Section */}
      <div className={`bg-white rounded-lg border shadow-sm p-6 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Modules</h2>
          {!isAddingMode && !editingModuleId && !isLocked && (
            <button
              onClick={() => {
                reset({ title: '', description: '', learningObjectives: [''] });
                setIsAddingMode(true);
              }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          )}
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {isModulesLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : modules && modules.length > 0 ? (
            modules.map((module, index) => (
              <div key={module.id} className="border rounded-md bg-gray-50 flex flex-col">
                {editingModuleId === module.id ? (
                  <div className="p-4 bg-white rounded-md border-b">
                    <form onSubmit={handleSubmit((data) => handleUpdateModule(module.id, data))} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
                        <input
                          type="text"
                          {...register('title')}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          placeholder="e.g., Introduction to the Course"
                          disabled={isUpdating}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Module Description</label>
                        <textarea
                          {...register('description')}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          placeholder="What will students learn in this module?"
                          disabled={isUpdating}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
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
                                disabled={isUpdating}
                              />
                              <button
                                type="button"
                                onClick={() => removeObj(index)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                                disabled={isUpdating}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t mt-4">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="bg-white border text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="p-4 flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <button 
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || isReordering}
                        className="text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                        aria-label="Move module up"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleMoveDown(index)}
                        disabled={index === modules.length - 1 || isReordering}
                        className="text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                        aria-label="Move module down"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        <span className="text-gray-500 mr-2">Module {index + 1}:</span>
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      
                      <div className="mt-3">
                        <Link 
                          to={`/creator/courses/${courseId}/modules/${module.id}`}
                          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                          Manage Lectures &rarr;
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(module)}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-md transition"
                        aria-label="Edit module"
                        disabled={isReordering || deletingModuleId === module.id}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingModuleId(module.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        aria-label="Delete module"
                        disabled={isReordering || deletingModuleId === module.id}
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
              <p className="text-sm text-gray-500 mb-4">This course has no modules yet.</p>
              <button
                onClick={() => setIsAddingMode(true)}
                className="inline-flex items-center gap-2 bg-white border shadow-sm text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
              >
                <Plus className="w-4 h-4" />
                Add your first module to start structuring the course
              </button>
            </div>
          )}

          {/* Add Module Form */}
          {isAddingMode && (
            <div className="border rounded-md bg-white p-4">
              <h3 className="text-lg font-semibold mb-4">Add New Module</h3>
              <form onSubmit={handleSubmit(handleAddModule)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
                  <input
                    type="text"
                    {...register('title')}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="e.g., Introduction to the Course"
                    disabled={isCreating}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="What will students learn in this module?"
                    disabled={isCreating}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
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
                          disabled={isCreating}
                        />
                        <button
                          type="button"
                          onClick={() => removeObj(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                          disabled={isCreating}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t mt-4">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Module'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isCreating}
                    className="bg-white border text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingModuleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Module</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this module? This action cannot be undone and will remove the module from your course structure.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingModuleId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteModule}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
