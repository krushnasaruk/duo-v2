import { useState } from 'react';
import { useCodingCheckpoints, useCreateCodingCheckpoint, useUpdateCodingCheckpoint, useDeleteCodingCheckpoint, useReorderCodingCheckpoints } from '../hooks/useCheckpoints';
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Play } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCodingCheckpointSchema } from '@codequest/shared';
import type { CodingTestCaseInput, CodingHintInput } from '@codequest/shared';

export function CheckpointBuilder({ lectureId }: { lectureId: string }) {
  const { data: checkpoints, isLoading: isCheckpointsLoading } = useCodingCheckpoints(lectureId);
  
  const { mutateAsync: createCheckpoint, isPending: isCreating } = useCreateCodingCheckpoint(lectureId);
  const { mutateAsync: updateCheckpoint, isPending: isUpdating } = useUpdateCodingCheckpoint(lectureId);
  const { mutateAsync: deleteCheckpoint, isPending: isDeleting } = useDeleteCodingCheckpoint(lectureId);
  const { mutateAsync: reorderCheckpoints, isPending: isReordering } = useReorderCodingCheckpoints(lectureId);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingCheckpointId, setEditingCheckpointId] = useState<string | null>(null);
  const [deletingCheckpointId, setDeletingCheckpointId] = useState<string | null>(null);
  const [testRunMessage, setTestRunMessage] = useState<string | null>(null);
  
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createCodingCheckpointSchema),
    defaultValues: {
      title: '',
      instructions: '',
      language: 'python' as const,
      starterCode: '',
      xp: 10,
      maxAttempts: 3,
      mandatory: true,
      visibleTests: [] as CodingTestCaseInput[],
      hiddenTests: [] as CodingTestCaseInput[],
      hints: [] as CodingHintInput[]
    }
  });

  const { fields: visibleTestFields, append: appendVisible, remove: removeVisible } = useFieldArray({
    control,
    name: "visibleTests"
  });

  const { fields: hiddenTestFields, append: appendHidden, remove: removeHidden } = useFieldArray({
    control,
    name: "hiddenTests"
  });

  const { fields: hintFields, append: appendHint, remove: removeHint, move: moveHint } = useFieldArray({
    control,
    name: "hints"
  });

  const handleRunTests = () => {
    setTestRunMessage("Code execution is not configured in this development environment. The checkpoint can still be saved, but live test execution is unavailable.");
    setTimeout(() => setTestRunMessage(null), 8000);
  };

  const handleAddCheckpoint = async (data: any) => {
    // position is fixed in hints
    const cleanData = {
      ...data,
      hints: data.hints.map((h: any, i: number) => ({ ...h, position: i }))
    };
    await createCheckpoint(cleanData);
    setIsAddingMode(false);
    reset();
  };

  const handleUpdateCheckpoint = async (checkpointId: string, data: any) => {
    const cleanData = {
      ...data,
      hints: data.hints.map((h: any, i: number) => ({ ...h, position: i }))
    };
    await updateCheckpoint({ checkpointId, data: cleanData });
    setEditingCheckpointId(null);
    reset();
  };

  const handleStartEdit = (cp: any) => {
    reset({
      title: cp.title,
      instructions: cp.instructions,
      language: cp.language,
      starterCode: cp.starterCode,
      xp: cp.xp,
      maxAttempts: cp.maxAttempts,
      mandatory: cp.mandatory,
      visibleTests: cp.visibleTests,
      hiddenTests: cp.hiddenTests,
      hints: cp.hints,
    });
    setEditingCheckpointId(cp.id);
  };

  const handleCancelEdit = () => {
    setEditingCheckpointId(null);
    setIsAddingMode(false);
    reset();
  };

  const handleDeleteCheckpoint = async () => {
    if (deletingCheckpointId) {
      await deleteCheckpoint(deletingCheckpointId);
      setDeletingCheckpointId(null);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!checkpoints || index === 0) return;
    const orderedIds = [...checkpoints.map(c => c.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index - 1];
    orderedIds[index - 1] = temp;
    await reorderCheckpoints(orderedIds);
  };

  const handleMoveDown = async (index: number) => {
    if (!checkpoints || index === checkpoints.length - 1) return;
    const orderedIds = [...checkpoints.map(c => c.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index + 1];
    orderedIds[index + 1] = temp;
    await reorderCheckpoints(orderedIds);
  };

  const renderCheckpointForm = (isCreatingAction: boolean, submitHandler: any) => (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            {...register('title')}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
            disabled={isCreatingAction ? isCreating : isUpdating}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2">Instructions</h3>
        <div>
          <textarea
            {...register('instructions')}
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
            disabled={isCreatingAction ? isCreating : isUpdating}
            placeholder="Explain what the learner needs to do..."
          />
          {errors.instructions && <p className="text-red-500 text-sm mt-1">{errors.instructions.message as string}</p>}
        </div>
      </div>

      {/* Starter Code */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2 flex justify-between items-center">
          Starter Code
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Language: Python</span>
        </h3>
        <div>
          <textarea
            {...register('starterCode')}
            rows={6}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm bg-gray-900 text-gray-100"
            disabled={isCreatingAction ? isCreating : isUpdating}
            placeholder="def solution():&#10;    # Write your code here&#10;    pass"
          />
          {errors.starterCode && <p className="text-red-500 text-sm mt-1">{errors.starterCode.message as string}</p>}
        </div>
      </div>

      {/* Visible Tests */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2">Visible Tests</h3>
        <p className="text-xs text-gray-500">These tests will be shown to the learner.</p>
        {visibleTestFields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md bg-gray-50 relative group">
            <button type="button" onClick={() => removeVisible(index)} className="absolute right-2 top-2 p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
            <input type="hidden" {...register(`visibleTests.${index}.id`)} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Input</label>
                <textarea {...register(`visibleTests.${index}.input`)} rows={2} className="w-full px-2 py-1 border rounded text-sm font-mono outline-none" />
                {errors.visibleTests?.[index] && (errors.visibleTests[index] as any)?.input && <p className="text-red-500 text-xs mt-1">{(errors.visibleTests[index] as any)?.input?.message as string}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Expected Output</label>
                <textarea {...register(`visibleTests.${index}.expectedOutput`)} rows={2} className="w-full px-2 py-1 border rounded text-sm font-mono outline-none" />
                {errors.visibleTests?.[index] && (errors.visibleTests[index] as any)?.expectedOutput && <p className="text-red-500 text-xs mt-1">{(errors.visibleTests[index] as any)?.expectedOutput?.message as string}</p>}
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => appendVisible({ id: crypto.randomUUID(), input: '', expectedOutput: '' })} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">+ Add Visible Test</button>
      </div>

      {/* Hidden Tests */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2">Hidden Tests</h3>
        <p className="text-xs text-gray-500">These tests verify edge cases and are hidden from the learner.</p>
        {hiddenTestFields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md bg-gray-50 relative group">
            <button type="button" onClick={() => removeHidden(index)} className="absolute right-2 top-2 p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
            <input type="hidden" {...register(`hiddenTests.${index}.id`)} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Input</label>
                <textarea {...register(`hiddenTests.${index}.input`)} rows={2} className="w-full px-2 py-1 border rounded text-sm font-mono outline-none" />
                {errors.hiddenTests?.[index] && (errors.hiddenTests[index] as any)?.input && <p className="text-red-500 text-xs mt-1">{(errors.hiddenTests[index] as any)?.input?.message as string}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Expected Output</label>
                <textarea {...register(`hiddenTests.${index}.expectedOutput`)} rows={2} className="w-full px-2 py-1 border rounded text-sm font-mono outline-none" />
                {errors.hiddenTests?.[index] && (errors.hiddenTests[index] as any)?.expectedOutput && <p className="text-red-500 text-xs mt-1">{(errors.hiddenTests[index] as any)?.expectedOutput?.message as string}</p>}
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => appendHidden({ id: crypto.randomUUID(), input: '', expectedOutput: '' })} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">+ Add Hidden Test</button>
      </div>

      {/* Hints */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2">Hints</h3>
        {hintFields.map((field, index) => (
          <div key={field.id} className="p-3 border rounded-md bg-gray-50 flex items-start gap-3">
             <div className="flex flex-col items-center mt-1">
               <button type="button" onClick={() => moveHint(index, index - 1)} disabled={index === 0} className="text-gray-400 hover:text-gray-900 disabled:opacity-30"><ChevronUp className="w-4 h-4"/></button>
               <button type="button" onClick={() => moveHint(index, index + 1)} disabled={index === hintFields.length - 1} className="text-gray-400 hover:text-gray-900 disabled:opacity-30"><ChevronDown className="w-4 h-4"/></button>
             </div>
             <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hint {index + 1}</label>
                <input type="hidden" {...register(`hints.${index}.id`)} />
                <input type="hidden" {...register(`hints.${index}.position`, { valueAsNumber: true })} value={index} />
                <textarea {...register(`hints.${index}.content`)} rows={2} placeholder={`Hint ${index + 1} text...`} className="w-full px-2 py-1 border rounded text-sm outline-none" />
                {errors.hints?.[index] && (errors.hints[index] as any)?.content && <p className="text-red-500 text-xs mt-1">{(errors.hints[index] as any)?.content?.message as string}</p>}
             </div>
             <button type="button" onClick={() => removeHint(index)} className="p-1 text-red-500 hover:bg-red-50 rounded mt-6"><Trash2 className="w-4 h-4"/></button>
          </div>
        ))}
        <button type="button" onClick={() => appendHint({ id: crypto.randomUUID(), content: '', position: hintFields.length })} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">+ Add Hint</button>
      </div>

      {/* Scoring & Attempts */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2">Scoring & Attempts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">XP Reward</label>
             <input type="number" {...register('xp', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none" min="1" />
             {errors.xp && <p className="text-red-500 text-xs mt-1">{errors.xp.message as string}</p>}
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
             <input type="number" {...register('maxAttempts', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none" min="1" />
             {errors.maxAttempts && <p className="text-red-500 text-xs mt-1">{errors.maxAttempts.message as string}</p>}
           </div>
           <div className="flex items-center pt-6">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" {...register('mandatory')} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
               <span className="text-sm font-medium text-gray-700">Mandatory Checkpoint</span>
             </label>
           </div>
        </div>
      </div>

      {/* Test Checkpoint */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-3">
        <div className="flex justify-between items-center">
           <h3 className="font-semibold text-blue-900">Test Checkpoint</h3>
           <button type="button" onClick={handleRunTests} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
             <Play className="w-4 h-4" /> Run Tests
           </button>
        </div>
        {testRunMessage && (
           <div className="p-3 bg-red-100 text-red-800 text-sm rounded border border-red-200">
             {testRunMessage}
           </div>
        )}
      </div>

      <div className="flex gap-2 pt-6 border-t">
        <button
          type="submit"
          disabled={isCreatingAction ? isCreating : isUpdating}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
        >
          {(isCreatingAction ? isCreating : isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Checkpoint'}
        </button>
        <button
          type="button"
          onClick={handleCancelEdit}
          disabled={isCreatingAction ? isCreating : isUpdating}
          className="bg-white border text-gray-700 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Checkpoints Section */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Checkpoints</h2>
          {!isAddingMode && !editingCheckpointId && (
            <button
              onClick={() => {
                reset({
                  title: '',
                  instructions: '',
                  language: 'python',
                  starterCode: '',
                  xp: 10,
                  maxAttempts: 3,
                  mandatory: true,
                  visibleTests: [],
                  hiddenTests: [],
                  hints: []
                });
                setIsAddingMode(true);
              }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" />
              Add Coding Checkpoint
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-4">
          {isCheckpointsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : checkpoints && checkpoints.length > 0 ? (
            checkpoints.map((cp, index) => (
              <div key={cp.id} className="border rounded-md bg-gray-50 flex flex-col">
                {editingCheckpointId === cp.id ? (
                  <div className="p-6 bg-white rounded-md border-b">
                    {renderCheckpointForm(false, (data: any) => handleUpdateCheckpoint(cp.id, data))}
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
                        disabled={index === checkpoints.length - 1 || isReordering}
                        className="text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                         <h3 className="font-semibold text-gray-900 text-lg">
                           <span className="text-gray-500 mr-2">Checkpoint {index + 1}:</span>
                           {cp.title}
                         </h3>
                         <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full uppercase tracking-wider">{cp.language}</span>
                         {cp.mandatory ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full uppercase tracking-wider">Mandatory</span>
                         ) : (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full uppercase tracking-wider">Optional</span>
                         )}
                      </div>
                      
                      <div className="mt-3 flex gap-6 text-sm text-gray-600">
                         <span><strong>XP:</strong> {cp.xp}</span>
                         <span><strong>Attempts:</strong> {cp.maxAttempts}</span>
                         <span><strong>Tests:</strong> {cp.visibleTests.length} Visible, {cp.hiddenTests.length} Hidden</span>
                         <span><strong>Hints:</strong> {cp.hints.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(cp)}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-md transition"
                        disabled={isReordering || deletingCheckpointId === cp.id}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCheckpointId(cp.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        disabled={isReordering || deletingCheckpointId === cp.id}
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
              <p className="text-sm text-gray-500 mb-4">No coding checkpoints yet.</p>
              <button
                onClick={() => setIsAddingMode(true)}
                className="inline-flex items-center gap-2 bg-white border shadow-sm text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
              >
                <Plus className="w-4 h-4" />
                Add Coding Checkpoint
              </button>
            </div>
          )}

          {/* Add Form */}
          {isAddingMode && (
            <div className="border rounded-md bg-white p-6 shadow-sm mt-4">
              <h3 className="text-lg font-semibold mb-6 border-b pb-2">Add New Coding Checkpoint</h3>
              {renderCheckpointForm(true, handleAddCheckpoint)}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {deletingCheckpointId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Checkpoint</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this checkpoint? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingCheckpointId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCheckpoint}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Checkpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
