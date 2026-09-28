import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCourseSchema } from '@codequest/shared';
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateCourse } from '../hooks/useCourses';

export function CreateCourse() {
  const navigate = useNavigate();
  const { mutateAsync: createCourse, isPending } = useCreateCourse();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      difficulty: 'BEGINNER',
      language: 'English',
      prerequisites: [''],
      learningObjectives: [''],
      skills: [''],
    }
  });

  const { fields: prereqFields, append: appendPrereq, remove: removePrereq } = useFieldArray({ control, name: 'prerequisites' as never });
  const { fields: objFields, append: appendObj, remove: removeObj } = useFieldArray({ control, name: 'learningObjectives' as never });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: 'skills' as never });

  const onSubmit = async (data: any) => {
    try {
      setSubmitError(null);
      await createCourse(data);
      navigate('/creator/courses');
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create course. Persistence provider may be unavailable.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link to="/creator/courses" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create New Course</h1>
          <p className="text-sm text-gray-500 mt-1">Design the curriculum and basic information for your new course.</p>
        </div>
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
          <p className="font-medium">Error submitting course</p>
          <p className="text-sm mt-1">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-8 rounded-lg shadow-sm border">
        {/* Basic Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Course Title *</label>
            <input 
              {...register('title')} 
              placeholder="e.g. Advanced TypeScript Patterns"
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input 
              {...register('tagline')} 
              placeholder="A short catchy phrase"
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
            {errors.shortDescription && <p className="text-sm text-destructive mt-1">{errors.shortDescription.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Description *</label>
            <textarea 
              {...register('fullDescription')} 
              rows={5}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.fullDescription && <p className="text-sm text-destructive mt-1">{errors.fullDescription.message}</p>}
          </div>
        </section>

        {/* Classification */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Classification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <input {...register('category')} className="w-full px-3 py-2 border rounded-md" />
              {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
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
              {errors.difficulty && <p className="text-sm text-destructive mt-1">{errors.difficulty.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language *</label>
              <select {...register('language')} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
              {errors.language && <p className="text-sm text-destructive mt-1">{errors.language.message}</p>}
            </div>
          </div>
        </section>

        {/* Audience & Duration */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Audience & Duration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target Audience</label>
              <input {...register('targetAudience')} placeholder="e.g. Frontend Developers" className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Duration</label>
              <input {...register('duration')} placeholder="e.g. 5 hours" className="w-full px-3 py-2 border rounded-md" />
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
            <input {...register('thumbnailUrl')} type="url" placeholder="https://..." className="w-full px-3 py-2 border rounded-md" />
            {errors.thumbnailUrl && <p className="text-sm text-destructive mt-1">{errors.thumbnailUrl.message}</p>}
          </div>
        </section>

        <div className="pt-4 border-t flex justify-end gap-3">
          <Link to="/creator/courses" className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors font-medium">
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Creating...' : 'Create Course'}
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
