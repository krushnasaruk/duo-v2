import { useState } from 'react';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, useReorderProjects } from '../hooks/useProjects';
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema } from '@codequest/shared';
import { MilestonesBuilder } from './MilestonesBuilder';

export function ProjectBuilder({ lectureId }: { lectureId: string }) {
  const { data: projects, isLoading: isProjectsLoading } = useProjects(lectureId);
  
  const { mutateAsync: createProject, isPending: isCreating } = useCreateProject(lectureId);
  const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateProject(lectureId);
  const { mutateAsync: deleteProject, isPending: isDeleting } = useDeleteProject(lectureId);
  const { mutateAsync: reorderProjects, isPending: isReordering } = useReorderProjects(lectureId);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      description: '',
      instructions: '',
      xp: 100,
    }
  });

  const handleAddProject = async (data: any) => {
    await createProject(data);
    setIsAddingMode(false);
    reset();
  };

  const handleUpdateProject = async (projectId: string, data: any) => {
    await updateProject({ projectId, data });
    setEditingProjectId(null);
    reset();
  };

  const handleStartEdit = (project: any) => {
    reset({
      title: project.title,
      description: project.description,
      instructions: project.instructions,
      xp: project.xp,
    });
    setEditingProjectId(project.id);
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setIsAddingMode(false);
    reset();
  };

  const handleDeleteProject = async () => {
    if (deletingProjectId) {
      await deleteProject(deletingProjectId);
      setDeletingProjectId(null);
      if (expandedProjectId === deletingProjectId) {
        setExpandedProjectId(null);
      }
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!projects || index === 0) return;
    const orderedIds = [...projects.map(p => p.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index - 1];
    orderedIds[index - 1] = temp;
    await reorderProjects(orderedIds);
  };

  const handleMoveDown = async (index: number) => {
    if (!projects || index === projects.length - 1) return;
    const orderedIds = [...projects.map(p => p.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index + 1];
    orderedIds[index + 1] = temp;
    await reorderProjects(orderedIds);
  };

  const renderProjectForm = (isCreatingAction: boolean, submitHandler: any) => (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
        <input
          type="text"
          {...register('title')}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
          disabled={isCreatingAction ? isCreating : isUpdating}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
          disabled={isCreatingAction ? isCreating : isUpdating}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
        <textarea
          {...register('instructions')}
          rows={4}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
          disabled={isCreatingAction ? isCreating : isUpdating}
          placeholder="Explain the steps the learner needs to take..."
        />
        {errors.instructions && <p className="text-red-500 text-sm mt-1">{errors.instructions.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">XP Reward</label>
        <input
          type="number"
          {...register('xp', { valueAsNumber: true })}
          className="w-1/3 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
          disabled={isCreatingAction ? isCreating : isUpdating}
          min="1"
        />
        {errors.xp && <p className="text-red-500 text-sm mt-1">{errors.xp.message as string}</p>}
      </div>
      
      <div className="flex gap-2 pt-2 border-t mt-4">
        <button
          type="submit"
          disabled={isCreatingAction ? isCreating : isUpdating}
          className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
        >
          {(isCreatingAction ? isCreating : isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Project'}
        </button>
        <button
          type="button"
          onClick={handleCancelEdit}
          disabled={isCreatingAction ? isCreating : isUpdating}
          className="mt-2 bg-white border text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Projects Section */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
          {!isAddingMode && !editingProjectId && (
            <button
              onClick={() => {
                reset({ title: '', description: '', instructions: '', xp: 100 });
                setIsAddingMode(true);
              }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-4">
          {isProjectsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : projects && projects.length > 0 ? (
            projects.map((project, index) => (
              <div key={project.id} className="border rounded-md bg-gray-50 flex flex-col">
                {editingProjectId === project.id ? (
                  <div className="p-6 bg-white rounded-md border-b">
                    {renderProjectForm(false, (data: any) => handleUpdateProject(project.id, data))}
                  </div>
                ) : (
                  <div className="flex flex-col">
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
                          disabled={index === projects.length - 1 || isReordering}
                          className="text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          <span className="text-gray-500 mr-2">Project {index + 1}:</span>
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        <div className="mt-3 flex gap-6 text-sm text-gray-600">
                          <span><strong>XP:</strong> {project.xp}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedProjectId(expandedProjectId === project.id ? null : project.id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${expandedProjectId === project.id ? 'bg-primary text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}
                        >
                          {expandedProjectId === project.id ? 'Hide Milestones' : 'Manage Milestones'}
                        </button>
                        <button
                          onClick={() => handleStartEdit(project)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-md transition"
                          disabled={isReordering || deletingProjectId === project.id}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProjectId(project.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          disabled={isReordering || deletingProjectId === project.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Milestones Builder Section */}
                    {expandedProjectId === project.id && (
                      <div className="border-t bg-white p-6">
                        <MilestonesBuilder projectId={project.id} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : !isAddingMode && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-sm text-gray-500 mb-4">No projects in this lecture yet.</p>
              <button
                onClick={() => setIsAddingMode(true)}
                className="inline-flex items-center gap-2 bg-white border shadow-sm text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>
          )}

          {/* Add Form */}
          {isAddingMode && (
            <div className="border rounded-md bg-white p-6 shadow-sm mt-4">
              <h3 className="text-lg font-semibold mb-6 border-b pb-2">Add New Project</h3>
              {renderProjectForm(true, handleAddProject)}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {deletingProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this project? All associated milestones will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingProjectId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
