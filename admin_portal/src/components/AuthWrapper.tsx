'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/lib/types';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';

export default function AuthWrapper() {
  const [firebaseUser, loading, error] = useAuthState(auth);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            if (userData.role === 'admin') {
              setUser(userData);
            } else {
              // Not an admin, sign out
              auth.signOut();
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      setUserLoading(false);
    };

    if (!loading) {
      fetchUserData();
    }
  }, [firebaseUser, loading]);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  return user ? <Dashboard user={user} /> : <LoginForm />;
}