import { useState } from 'react';
import { useProjectMilestones, useCreateProjectMilestone, useUpdateProjectMilestone, useDeleteProjectMilestone, useReorderProjectMilestones } from '../hooks/useProjects';
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectMilestoneSchema } from '@codequest/shared';

export function MilestonesBuilder({ projectId }: { projectId: string }) {
  const { data: milestones, isLoading: isMilestonesLoading } = useProjectMilestones(projectId);
  
  const { mutateAsync: createMilestone, isPending: isCreating } = useCreateProjectMilestone(projectId);
  const { mutateAsync: updateMilestone, isPending: isUpdating } = useUpdateProjectMilestone(projectId);
  const { mutateAsync: deleteMilestone, isPending: isDeleting } = useDeleteProjectMilestone(projectId);
  const { mutateAsync: reorderMilestones, isPending: isReordering } = useReorderProjectMilestones(projectId);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createProjectMilestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      xp: 50,
    }
  });

  const handleAddMilestone = async (data: any) => {
    await createMilestone(data);
    setIsAddingMode(false);
    reset();
  };

  const handleUpdateMilestone = async (milestoneId: string, data: any) => {
    await updateMilestone({ milestoneId, data });
    setEditingMilestoneId(null);
    reset();
  };

  const handleStartEdit = (m: any) => {
    reset({
      title: m.title,
      description: m.description,
      xp: m.xp,
    });
    setEditingMilestoneId(m.id);
  };

  const handleCancelEdit = () => {
    setEditingMilestoneId(null);
    setIsAddingMode(false);
    reset();
  };

  const handleDeleteMilestone = async () => {
    if (deletingMilestoneId) {
      await deleteMilestone(deletingMilestoneId);
      setDeletingMilestoneId(null);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!milestones || index === 0) return;
    const orderedIds = [...milestones.map(m => m.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index - 1];
    orderedIds[index - 1] = temp;
    await reorderMilestones(orderedIds);
  };

  const handleMoveDown = async (index: number) => {
    if (!milestones || index === milestones.length - 1) return;
    const orderedIds = [...milestones.map(m => m.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index + 1];
    orderedIds[index + 1] = temp;
    await reorderMilestones(orderedIds);
  };

  const renderMilestoneForm = (isCreatingAction: boolean, submitHandler: any) => (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Title</label>
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
          {(isCreatingAction ? isCreating : isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Milestone'}
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
    <div className="space-y-4 border-t pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
        {!isAddingMode && !editingMilestoneId && (
          <button
            onClick={() => {
              reset({ title: '', description: '', xp: 50 });
              setIsAddingMode(true);
            }}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
        )}
      </div>

      {isMilestonesLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : milestones && milestones.length > 0 ? (
        <div className="space-y-3">
          {milestones.map((m, index) => (
            <div key={m.id} className="border rounded bg-gray-50 p-4">
              {editingMilestoneId === m.id ? (
                <div className="bg-white p-4 rounded border">
                  {renderMilestoneForm(false, (data: any) => handleUpdateMilestone(m.id, data))}
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <button onClick={() => handleMoveUp(index)} disabled={index === 0 || isReordering} className="text-gray-400 hover:text-gray-900 disabled:opacity-30"><ChevronUp className="w-4 h-4"/></button>
                    <button onClick={() => handleMoveDown(index)} disabled={index === milestones.length - 1 || isReordering} className="text-gray-400 hover:text-gray-900 disabled:opacity-30"><ChevronDown className="w-4 h-4"/></button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 font-medium">{m.xp} XP</span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm mb-1">{index + 1}. {m.title}</p>
                    <p className="text-sm text-gray-600">{m.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleStartEdit(m)} className="p-1.5 text-gray-500 hover:text-primary rounded"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => setDeletingMilestoneId(m.id)} className="p-1.5 text-gray-500 hover:text-red-500 rounded"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !isAddingMode && (
        <p className="text-sm text-gray-500 italic py-4">No milestones added yet.</p>
      )}

      {isAddingMode && (
        <div className="bg-white p-4 rounded border mt-4">
          <h4 className="font-medium mb-4 border-b pb-2">New Milestone</h4>
          {renderMilestoneForm(true, handleAddMilestone)}
        </div>
      )}

      {deletingMilestoneId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Milestone</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this milestone? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingMilestoneId(null)} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleDeleteMilestone} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
