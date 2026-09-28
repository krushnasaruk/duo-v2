import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCourseSchema } from '@codequest/shared';
import { Plus, Trash2, Loader2, ArrowLeft, Eye } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCourse, useUpdateCourse } from '../hooks/useCourses';
import { useAutosave } from '../hooks/useAutosave';

export function EditCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading: isCourseLoading, error: courseError } = useCourse(courseId!);
  const { mutateAsync: updateCourse, isPending } = useUpdateCourse(courseId!);
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const methods = useForm({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: '',
      shortDescription: '',
      fullDescription: '',
      tagline: '',
      category: '',
      subcategory: '',
      difficulty: 'BEGINNER',
      language: 'English',
      targetAudience: '',
      duration: '',
      prerequisites: [''],
      learningObjectives: [''],
      skills: [''],
      thumbnailUrl: ''
    }
  });

  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = methods;

  const { fields: prereqFields, append: appendPrereq, remove: removePrereq } = useFieldArray({ control, name: 'prerequisites' as never });
  const { fields: objFields, append: appendObj, remove: removeObj } = useFieldArray({ control, name: 'learningObjectives' as never });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: 'skills' as never });
  const { fields: glossaryFields, append: appendGlossary, remove: removeGlossary } = useFieldArray({ control, name: 'glossary' as never });

  // Load course data into form
  useEffect(() => {
    if (course) {
      reset({
        title: course.title || '',
        shortDescription: course.shortDescription || '',
        fullDescription: course.fullDescription || '',
        tagline: course.tagline || '',
        category: course.category || '',
        subcategory: course.subcategory || '',
        difficulty: (course.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED") || 'BEGINNER',
        language: course.language || 'English',
        targetAudience: course.targetAudience || '',
        duration: course.duration || '',
        prerequisites: course.prerequisites?.length ? course.prerequisites : [''],
        learningObjectives: course.learningObjectives?.length ? course.learningObjectives : [''],
        skills: course.skills?.length ? course.skills : [''],
        glossary: course.glossary || [],
        thumbnailUrl: course.thumbnailUrl || ''
      });
    }
  }, [course, reset]);

  const onSubmit = async (data: any) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      await updateCourse(data);
      setSubmitSuccess(true);
      setLastSaved(new Date());
      
      // Navigate back to course list as requested
      setTimeout(() => navigate('/creator/courses'), 500);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to update course. Persistence provider may be unavailable.');
    }
  };

  const onAutosave = async (data: any) => {
    try {
      await updateCourse(data);
      setLastSaved(new Date());
      setSubmitError(null);
    } catch (error: any) {
      setSubmitError(error.message || 'Autosave failed.');
    }
  };

  useAutosave(methods, onAutosave, 3000);

  if (isCourseLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading course details...</p>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 text-red-800 rounded-md border border-red-200">
        <h2 className="text-lg font-semibold mb-2">Error Loading Course</h2>
        <p>{courseError?.message || 'Course not found or persistence provider is down.'}</p>
        <Link to="/creator/courses" className="mt-4 inline-block text-red-700 hover:underline">
          &larr; Back to My Courses
        </Link>
      </div>
    );
  }

  const isLocked = course?.status === 'PENDING_REVIEW' || course?.status === 'PUBLISHED';
  const isReady = course?.status === 'READY_FOR_REVIEW';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/creator/courses" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Course</h1>
            <p className="text-sm text-gray-500 mt-1">Status: <span className="font-medium px-2 py-0.5 rounded-full bg-gray-100">{course.status}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/creator/courses/${course.id}/preview`}
            className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview & Validate
          </Link>
          <Link 
            to={`/creator/courses/${course.id}/builder`}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition"
          >
            Open Course Builder
          </Link>
        </div>
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

      {submitError && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
          <p className="font-medium">Error updating course</p>
          <p className="text-sm mt-1">{submitError}</p>
        </div>
      )}

      {submitSuccess && (
        <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200">
          <p className="font-medium">Course updated successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 bg-white p-6 md:p-8 rounded-lg shadow-sm border ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* Basic Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Course Title *</label>
            <input 
              {...register('title')} 
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input 
              {...register('tagline')} 
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Description *</label>
            <textarea 
              {...register('shortDescription')} 
              rows={2}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.shortDescription && <p className="text-sm text-destructive mt-1">{errors.shortDescription.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Description *</label>
            <textarea 
              {...register('fullDescription')} 
              rows={5}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.fullDescription && <p className="text-sm text-destructive mt-1">{errors.fullDescription.message as string}</p>}
          </div>
        </section>

        {/* Classification */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Classification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <input {...register('category')} className="w-full px-3 py-2 border rounded-md" />
              {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subcategory</label>
              <input {...register('subcategory')} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty *</label>
              <select {...register('difficulty')} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language *</label>
              <select {...register('language')} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>
        </section>

        {/* Audience & Duration */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Audience & Duration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target Audience</label>
              <input {...register('targetAudience')} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Duration</label>
              <input {...register('duration')} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
        </section>

        {/* Arrays: Objectives, Skills, Prerequisites */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Curriculum Details</h2>
          
          <FieldArraySection 
            title="Learning Objectives" 
            fields={objFields} 
            register={register} 
            name="learningObjectives" 
            append={() => appendObj('')} 
            remove={removeObj} 
          />

          <FieldArraySection 
            title="Skills Taught" 
            fields={skillFields} 
            register={register} 
            name="skills" 
            append={() => appendSkill('')} 
            remove={removeSkill} 
          />

          <FieldArraySection 
            title="Prerequisites" 
            fields={prereqFields} 
            register={register} 
            name="prerequisites" 
            append={() => appendPrereq('')} 
            remove={removePrereq} 
          />
        </section>

        {/* Media */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Media</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
            <input {...register('thumbnailUrl')} type="url" className="w-full px-3 py-2 border rounded-md" />
            {errors.thumbnailUrl && <p className="text-sm text-destructive mt-1">{errors.thumbnailUrl.message as string}</p>}
          </div>
        </section>

        {/* Glossary */}
        <section className="bg-white border rounded-lg p-6 shadow-sm mt-8">
          <div className="flex items-center justify-between mb-6 border-b pb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Course Glossary</h2>
              <p className="text-sm text-gray-500 mt-1">Define key terms and concepts for this course.</p>
            </div>
            <button
              type="button"
              onClick={() => appendGlossary({ id: crypto.randomUUID(), term: '', definition: '', relatedTerms: [] })}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Term
            </button>
          </div>
          
          {glossaryFields.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No glossary terms added.</p>
          ) : (
            <div className="space-y-4">
              {glossaryFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-md bg-gray-50 relative">
                  <div className="absolute top-4 right-4">
                     <button type="button" onClick={() => removeGlossary(index)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Term</label>
                      <input
                        {...register(`glossary.${index}.term`)}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="e.g. Recursion"
                      />
                      {errors.glossary?.[index] && (errors.glossary[index] as any)?.term && <p className="text-red-500 text-xs mt-1">{(errors.glossary[index] as any)?.term?.message as string}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Definition</label>
                      <textarea
                        {...register(`glossary.${index}.definition`)}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="A function that calls itself."
                      />
                      {errors.glossary?.[index] && (errors.glossary[index] as any)?.definition && <p className="text-red-500 text-xs mt-1">{(errors.glossary[index] as any)?.definition?.message as string}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="pt-4 border-t flex justify-end gap-3 items-center">
          {lastSaved && <span className="text-sm text-gray-500 mr-4">Last saved: {lastSaved.toLocaleTimeString()}</span>}
          <Link to="/creator/courses" className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors font-medium">
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isPending || !isDirty}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldArraySection({ title, fields, register, name, append, remove }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium">{title}</label>
        <button type="button" onClick={append} className="text-xs flex items-center gap-1 text-primary hover:underline">
          <Plus className="w-3 h-3" /> Add item
        </button>
      </div>
      <div className="space-y-2">
        {fields.map((field: any, index: number) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`${name}.${index}`)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              placeholder={`Enter ${title.toLowerCase()}...`}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-gray-500 italic">No items added.</p>
        )}
      </div>
    </div>
  );
}
