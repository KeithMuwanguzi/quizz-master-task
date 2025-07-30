'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question } from '@/lib/types';

export default function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentOptions, setCurrentOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    if (currentQuestion.trim() && currentOptions.every(option => option.trim())) {
      const newQuestion: Question = {
        question: currentQuestion.trim(),
        options: currentOptions.map(option => option.trim()),
        correctAnswer
      };
      setQuestions([...questions, newQuestion]);
      setCurrentQuestion('');
      setCurrentOptions(['', '', '', '']);
      setCorrectAnswer(0);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || questions.length === 0) {
      alert('Please fill in all fields and add at least one question.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'quizzes'), {
        title: title.trim(),
        description: description.trim(),
        questions,
        createdAt: Date.now()
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setQuestions([]);
      setCurrentQuestion('');
      setCurrentOptions(['', '', '', '']);
      setCorrectAnswer(0);
      
      alert('Quiz created successfully!');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Create New Quiz</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create a new quiz with multiple choice questions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Quiz Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about the quiz.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter quiz title"
                    required
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter quiz description"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Add Question</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add multiple choice questions to your quiz.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question
                  </label>
                  <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter your question"
                  />
                </div>
                
                {currentOptions.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700">
                      Option {index + 1}
                      {index === correctAnswer && (
                        <span className="text-green-600 ml-2">(Correct Answer)</span>
                      )}
                    </label>
                    <div className="mt-1 flex">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentOptions];
                          newOptions[index] = e.target.value;
                          setCurrentOptions(newOptions);
                        }}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder={`Enter option ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => setCorrectAnswer(index)}
                        className={`ml-2 px-3 py-2 text-sm font-medium rounded-md ${
                          index === correctAnswer
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Questions ({questions.length})
            </h3>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {index + 1}. {question.question}
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <li
                            key={optionIndex}
                            className={`text-sm ${
                              optionIndex === question.correctAnswer
                                ? 'text-green-600 font-medium'
                                : 'text-gray-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                            {optionIndex === question.correctAnswer && ' ✓'}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="ml-4 text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}