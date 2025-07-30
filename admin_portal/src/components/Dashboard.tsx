'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/lib/types';
import QuizList from './QuizList';
import CreateQuiz from './CreateQuiz';
import Results from './Results';
import UserManagement from './UserManagement';

interface DashboardProps {
  user: User;
}

type Tab = 'quizzes' | 'create' | 'results' | 'users';

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('quizzes');

  const handleSignOut = () => {
    signOut(auth);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'quizzes':
        return <QuizList />;
      case 'create':
        return <CreateQuiz />;
      case 'results':
        return <Results />;
      case 'users':
        return <UserManagement currentUser={user} />;
      default:
        return <QuizList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Quiz Admin</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className={`${
                    activeTab === 'quizzes'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  Quizzes
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`${
                    activeTab === 'create'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  Create Quiz
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`${
                    activeTab === 'results'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  Results
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`${
                    activeTab === 'users'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  Users
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Hello, {user.name}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}