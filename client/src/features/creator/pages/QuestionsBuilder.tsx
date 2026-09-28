import { useState, useEffect } from 'react';
import { useQuizQuestions, useCreateQuizQuestion, useUpdateQuizQuestion, useDeleteQuizQuestion, useReorderQuizQuestions } from '../hooks/useQuizzes';
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quizQuestionSchema } from '@codequest/shared';

export function QuestionsBuilder({ quizId }: { quizId: string }) {
  const { data: questions, isLoading: isQuestionsLoading } = useQuizQuestions(quizId);
  
  const { mutateAsync: createQuestion, isPending: isCreating } = useCreateQuizQuestion(quizId);
  const { mutateAsync: updateQuestion, isPending: isUpdating } = useUpdateQuizQuestion(quizId);
  const { mutateAsync: deleteQuestion, isPending: isDeleting } = useDeleteQuizQuestion(quizId);
  const { mutateAsync: reorderQuestions, isPending: isReordering } = useReorderQuizQuestions(quizId);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  
  const { register, control, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(quizQuestionSchema),
    defaultValues: {
      type: 'MCQ' as const,
      question: '',
      code: '',
      language: 'javascript',
      options: [
        { id: crypto.randomUUID(), text: '' },
        { id: crypto.randomUUID(), text: '' }
      ],
      correctOptionId: '',
      explanation: '',
      xp: 10,
    }
  });

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: "options"
  });

  const questionType = watch('type');

  useEffect(() => {
    if (questionType === 'TRUE_FALSE') {
      const trueId = crypto.randomUUID();
      const falseId = crypto.randomUUID();
      setValue('options', [
        { id: trueId, text: 'True' },
        { id: falseId, text: 'False' }
      ]);
      setValue('correctOptionId', '');
    } else if ((questionType === 'MCQ' || questionType === 'PREDICT_OUTPUT') && optionFields.length === 0) {
      setValue('options', [
        { id: crypto.randomUUID(), text: '' },
        { id: crypto.randomUUID(), text: '' }
      ]);
      setValue('correctOptionId', '');
    }
  }, [questionType, setValue, optionFields.length]);

  const handleAddQuestion = async (data: any) => {
    await createQuestion(data);
    setIsAddingMode(false);
    reset();
  };

  const handleUpdateQuestion = async (questionId: string, data: any) => {
    await updateQuestion({ questionId, data });
    setEditingQuestionId(null);
    reset();
  };

  const handleStartEdit = (q: any) => {
    reset({
      type: q.type,
      question: q.question,
      code: q.code || '',
      language: q.language || 'javascript',
      options: q.options,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      xp: q.xp,
    });
    setEditingQuestionId(q.id);
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setIsAddingMode(false);
    reset();
  };

  const handleDeleteQuestion = async () => {
    if (deletingQuestionId) {
      await deleteQuestion(deletingQuestionId);
      setDeletingQuestionId(null);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!questions || index === 0) return;
    const orderedIds = [...questions.map(q => q.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index - 1];
    orderedIds[index - 1] = temp;
    await reorderQuestions(orderedIds);
  };

  const handleMoveDown = async (index: number) => {
    if (!questions || index === questions.length - 1) return;
    const orderedIds = [...questions.map(q => q.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index + 1];
    orderedIds[index + 1] = temp;
    await reorderQuestions(orderedIds);
  };

  const renderQuestionForm = (isCreatingAction: boolean, submitHandler: any) => (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      
      <div className="grid grid-cols-2 gap-4 border-b pb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
            disabled={isCreatingAction ? isCreating : isUpdating}
          >
            <option value="MCQ">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="PREDICT_OUTPUT">Predict Output</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">XP Reward</label>
          <input
            type="number"
            {...register('xp', { valueAsNumber: true })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
            disabled={isCreatingAction ? isCreating : isUpdating}
            min="1"
          />
          {errors.xp && <p className="text-red-500 text-xs mt-1">{errors.xp.message as string}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
        <textarea
          {...register('question')}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
          disabled={isCreatingAction ? isCreating : isUpdating}
        />
        {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question.message as string}</p>}
      </div>

      {questionType === 'PREDICT_OUTPUT' && (
        <div className="space-y-4 bg-gray-50 p-4 border rounded-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programming Language</label>
            <input
              type="text"
              {...register('language')}
              placeholder="e.g. javascript, python"
              className="w-1/2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm"
              disabled={isCreatingAction ? isCreating : isUpdating}
            />
            {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language.message as string}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code Snippet</label>
            <textarea
              {...register('code')}
              rows={5}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm bg-gray-900 text-gray-100"
              disabled={isCreatingAction ? isCreating : isUpdating}
              placeholder="Code for the learner to predict..."
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message as string}</p>}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Options</label>
        {errors.options?.root && <p className="text-red-500 text-sm">{errors.options.root.message}</p>}
        
        {optionFields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded border">
            <input
              type="radio"
              {...register('correctOptionId')}
              value={field.id}
              className="w-4 h-4 text-primary"
            />
            <div className="flex-1">
              <input type="hidden" {...register(`options.${index}.id`)} />
              {questionType === 'TRUE_FALSE' ? (
                <input
                  type="text"
                  {...register(`options.${index}.text`)}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600 outline-none"
                />
              ) : (
                <input
                  type="text"
                  {...register(`options.${index}.text`)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder={`Option ${index + 1}`}
                />
              )}
              {errors.options?.[index] && (errors.options[index] as any)?.text && <p className="text-red-500 text-xs mt-1">{(errors.options[index] as any)?.text?.message as string}</p>}
            </div>
            {(questionType === 'MCQ' || questionType === 'PREDICT_OUTPUT') && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={optionFields.length <= 2}
                className="p-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {errors.correctOptionId && <p className="text-red-500 text-sm">{errors.correctOptionId.message as string}</p>}
        
        {(questionType === 'MCQ' || questionType === 'PREDICT_OUTPUT') && (
          <button
            type="button"
            onClick={() => appendOption({ id: crypto.randomUUID(), text: '' })}
            className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50 mt-2"
          >
            + Add Option
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
        <p className="text-xs text-gray-500 mb-2">Explain why the selected answer is correct.</p>
        <textarea
          {...register('explanation')}
          rows={2}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
          disabled={isCreatingAction ? isCreating : isUpdating}
        />
        {errors.explanation && <p className="text-red-500 text-sm mt-1">{errors.explanation.message as string}</p>}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button
          type="submit"
          disabled={isCreatingAction ? isCreating : isUpdating}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
        >
          {(isCreatingAction ? isCreating : isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Question'}
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

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
        {!isAddingMode && !editingQuestionId && (
          <button
            onClick={() => {
              reset({
                type: 'MCQ',
                question: '',
                options: [
                  { id: crypto.randomUUID(), text: '' },
                  { id: crypto.randomUUID(), text: '' }
                ],
                correctOptionId: '',
                explanation: '',
                xp: 10,
              });
              setIsAddingMode(true);
            }}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        )}
      </div>

      {isQuestionsLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : questions && questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((q, index) => (
            <div key={q.id} className="border rounded bg-gray-50 p-4">
              {editingQuestionId === q.id ? (
                <div className="bg-white p-4 rounded border">
                  {renderQuestionForm(false, (data: any) => handleUpdateQuestion(q.id, data))}
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <button onClick={() => handleMoveUp(index)} disabled={index === 0 || isReordering} className="text-gray-400 hover:text-gray-900 disabled:opacity-30"><ChevronUp className="w-4 h-4"/></button>
                    <button onClick={() => handleMoveDown(index)} disabled={index === questions.length - 1 || isReordering} className="text-gray-400 hover:text-gray-900 disabled:opacity-30"><ChevronDown className="w-4 h-4"/></button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {q.type === 'MCQ' ? 'Multiple Choice' : q.type === 'PREDICT_OUTPUT' ? 'Predict Output' : 'True / False'}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{q.xp} XP</span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm mb-3">{index + 1}. {q.question}</p>
                    {q.type === 'PREDICT_OUTPUT' && q.code && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-500 uppercase font-semibold">{q.language}</span>
                        <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto mt-1 font-mono">
                          {q.code}
                        </pre>
                      </div>
                    )}
                    <div className="space-y-1 pl-4 border-l-2 border-gray-200">
                      {q.options.map(opt => (
                        <div key={opt.id} className={`text-sm ${opt.id === q.correctOptionId ? 'font-semibold text-green-700 flex items-center gap-2' : 'text-gray-600'}`}>
                          {opt.id === q.correctOptionId && <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>}
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleStartEdit(q)} className="p-1.5 text-gray-500 hover:text-primary rounded"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => setDeletingQuestionId(q.id)} className="p-1.5 text-gray-500 hover:text-red-500 rounded"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !isAddingMode && (
        <p className="text-sm text-gray-500 italic py-4">No questions added yet.</p>
      )}

      {isAddingMode && (
        <div className="bg-white p-4 rounded border mt-4">
          <h4 className="font-medium mb-4 border-b pb-2">New Question</h4>
          {renderQuestionForm(true, handleAddQuestion)}
        </div>
      )}

      {deletingQuestionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Question</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this question? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingQuestionId(null)} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleDeleteQuestion} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
