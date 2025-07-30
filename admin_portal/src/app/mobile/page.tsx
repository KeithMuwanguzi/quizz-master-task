"use client";

import { useState } from 'react';
import { User } from '@/lib/types';
import MobileLogin from '@/components/MobileLogin';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut, User as UserIcon, Shield, GraduationCap } from 'lucide-react';

export default function MobilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setError('');
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
    setUser(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError('');
    } catch (error: any) {
      setError('Sign out failed: ' + error.message);
    }
  };

  if (!user) {
    return (
      <div>
        {error && (
          <div className="fixed top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            {error}
          </div>
        )}
        <MobileLogin 
          onLoginSuccess={handleLoginSuccess}
          onLoginError={handleLoginError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{user.name}</h1>
                <div className="flex items-center space-x-1">
                  {user.role === 'admin' ? (
                    <>
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Admin</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-600">Student</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome to the Mobile App</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="text-gray-900 capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="text-gray-900 text-xs">{user.uid}</span>
            </div>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="text-green-800 font-medium mb-2">Admin Access</h3>
            <p className="text-green-700 text-sm">
              You have administrative privileges and can access all features of the app.
            </p>
          </div>
        )}

        {user.role === 'student' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <h3 className="text-purple-800 font-medium mb-2">Student Access</h3>
            <p className="text-purple-700 text-sm">
              You can take quizzes and view your results.
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium mb-2">Mobile App Features</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Secure authentication</li>
            <li>• Role-based access control</li>
            <li>• Quiz taking (for students)</li>
            <li>• Results viewing</li>
            {user.role === 'admin' && <li>• Administrative functions</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}