import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from './types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'student';
}

export class AuthService {
  /**
   * Sign in user with email and password
   */
  static async signIn(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data() as User;
      return userData;
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Create a new user account (admin only)
   */
  static async createUser(userData: CreateUserData, createdBy: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const newUser: User = {
        uid: userCredential.user.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role
      };

      // Save user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...newUser,
        createdAt: Date.now(),
        createdBy
      });

      return newUser;
    } catch (error: any) {
      throw new Error(`User creation failed: ${error.message}`);
    }
  }

  /**
   * Get user profile by UID
   */
  static async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        return null;
      }

      return userDoc.data() as User;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  /**
   * Check if user has admin privileges
   */
  static async isAdmin(uid: string): Promise<boolean> {
    const user = await this.getUserProfile(uid);
    return user?.role === 'admin';
  }

  /**
   * Validate user credentials for mobile app
   */
  static async validateMobileLogin(credentials: LoginCredentials): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      const user = await this.signIn(credentials);
      return {
        success: true,
        user
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}