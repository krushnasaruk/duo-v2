import { useState } from 'react';
import { useQuizzes, useCreateQuiz, useUpdateQuiz, useDeleteQuiz, useReorderQuizzes } from '../hooks/useQuizzes';
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createQuizSchema } from '@codequest/shared';
import { QuestionsBuilder } from './QuestionsBuilder';

export function QuizBuilder({ lectureId }: { lectureId: string }) {
  const { data: quizzes, isLoading: isQuizzesLoading } = useQuizzes(lectureId);
  
  const { mutateAsync: createQuiz, isPending: isCreating } = useCreateQuiz(lectureId);
  const { mutateAsync: updateQuiz, isPending: isUpdating } = useUpdateQuiz(lectureId);
  const { mutateAsync: deleteQuiz, isPending: isDeleting } = useDeleteQuiz(lectureId);
  const { mutateAsync: reorderQuizzes, isPending: isReordering } = useReorderQuizzes(lectureId);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: '',
      description: '',
    }
  });

  const handleAddQuiz = async (data: any) => {
    await createQuiz(data);
    setIsAddingMode(false);
    reset();
  };

  const handleUpdateQuiz = async (quizId: string, data: any) => {
    await updateQuiz({ quizId, data });
    setEditingQuizId(null);
    reset();
  };

  const handleStartEdit = (quiz: any) => {
    reset({
      title: quiz.title,
      description: quiz.description,
    });
    setEditingQuizId(quiz.id);
  };

  const handleCancelEdit = () => {
    setEditingQuizId(null);
    setIsAddingMode(false);
    reset();
  };

  const handleDeleteQuiz = async () => {
    if (deletingQuizId) {
      await deleteQuiz(deletingQuizId);
      setDeletingQuizId(null);
      if (expandedQuizId === deletingQuizId) {
        setExpandedQuizId(null);
      }
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!quizzes || index === 0) return;
    const orderedIds = [...quizzes.map(q => q.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index - 1];
    orderedIds[index - 1] = temp;
    await reorderQuizzes(orderedIds);
  };

  const handleMoveDown = async (index: number) => {
    if (!quizzes || index === quizzes.length - 1) return;
    const orderedIds = [...quizzes.map(q => q.id)];
    const temp = orderedIds[index];
    orderedIds[index] = orderedIds[index + 1];
    orderedIds[index + 1] = temp;
    await reorderQuizzes(orderedIds);
  };

  const renderQuizForm = (isCreatingAction: boolean, submitHandler: any) => (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
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
      
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isCreatingAction ? isCreating : isUpdating}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
        >
          {(isCreatingAction ? isCreating : isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Quiz'}
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
    <div className="space-y-6">
      {/* Quizzes Section */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quizzes</h2>
          {!isAddingMode && !editingQuizId && (
            <button
              onClick={() => {
                reset({ title: '', description: '' });
                setIsAddingMode(true);
              }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" />
              Add Quiz
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-4">
          {isQuizzesLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : quizzes && quizzes.length > 0 ? (
            quizzes.map((quiz, index) => (
              <div key={quiz.id} className="border rounded-md bg-gray-50 flex flex-col">
                {editingQuizId === quiz.id ? (
                  <div className="p-6 bg-white rounded-md border-b">
                    {renderQuizForm(false, (data: any) => handleUpdateQuiz(quiz.id, data))}
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
                          disabled={index === quizzes.length - 1 || isReordering}
                          className="text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          <span className="text-gray-500 mr-2">Quiz {index + 1}:</span>
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{quiz.questions.length} Question(s)</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedQuizId(expandedQuizId === quiz.id ? null : quiz.id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${expandedQuizId === quiz.id ? 'bg-primary text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}
                        >
                          {expandedQuizId === quiz.id ? 'Hide Questions' : 'Manage Questions'}
                        </button>
                        <button
                          onClick={() => handleStartEdit(quiz)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-md transition"
                          disabled={isReordering || deletingQuizId === quiz.id}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingQuizId(quiz.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          disabled={isReordering || deletingQuizId === quiz.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Questions Builder Section */}
                    {expandedQuizId === quiz.id && (
                      <div className="border-t bg-white p-6">
                        <QuestionsBuilder quizId={quiz.id} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : !isAddingMode && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-sm text-gray-500 mb-4">No quizzes in this lecture yet.</p>
              <button
                onClick={() => setIsAddingMode(true)}
                className="inline-flex items-center gap-2 bg-white border shadow-sm text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
              >
                <Plus className="w-4 h-4" />
                Add Quiz
              </button>
            </div>
          )}

          {/* Add Form */}
          {isAddingMode && (
            <div className="border rounded-md bg-white p-6 shadow-sm mt-4">
              <h3 className="text-lg font-semibold mb-6 border-b pb-2">Add New Quiz</h3>
              {renderQuizForm(true, handleAddQuiz)}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {deletingQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Quiz</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this quiz? All questions will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingQuizId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuiz}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
