'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QuizResult, Quiz, User } from '@/lib/types';

interface ResultWithDetails extends QuizResult {
  quizTitle?: string;
  userName?: string;
}

export default function Results() {
  const [results, setResults] = useState<ResultWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      // Fetch results
      const resultsQuery = query(
        collection(db, 'results'),
        orderBy('completedAt', 'desc')
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      const resultsData = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizResult));

      // Fetch quizzes and users for additional details
      const [quizzesSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'quizzes')),
        getDocs(collection(db, 'users'))
      ]);

      const quizzes = new Map<string, Quiz>();
      quizzesSnapshot.docs.forEach(doc => {
        quizzes.set(doc.id, { id: doc.id, ...doc.data() } as Quiz);
      });

      const users = new Map<string, User>();
      usersSnapshot.docs.forEach(doc => {
        users.set(doc.id, { uid: doc.id, ...doc.data() } as User);
      });

      // Combine data
      const resultsWithDetails: ResultWithDetails[] = resultsData.map(result => ({
        ...result,
        quizTitle: quizzes.get(result.quizId)?.title || 'Unknown Quiz',
        userName: users.get(result.userId)?.name || 'Unknown User'
      }));

      setResults(resultsWithDetails);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Quiz Results</h1>
          <p className="mt-2 text-sm text-gray-700">
            View all quiz results and student performance.
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results</h3>
          <p className="mt-1 text-sm text-gray-500">
            No quiz results available yet.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Quiz
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result) => {
                      const percentage = (result.score / result.totalQuestions) * 100;
                      const isGoodScore = percentage >= 70;
                      
                      return (
                        <tr key={result.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.userName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {result.quizTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.score}/{result.totalQuestions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                isGoodScore
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(result.completedAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}