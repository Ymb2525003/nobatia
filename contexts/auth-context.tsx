"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FirebaseError } from 'firebase/app';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserData {
  uid: string;
  email: string;
  name: string;
  isAdmin?: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const userDataToSave: UserData = {
        uid: newUser.uid,
        email: newUser.email!,
        name,
        isAdmin: false,
        createdAt: new Date(),
      };

      console.log('Registration: created Firebase Auth user', {
        uid: newUser.uid,
        email: newUser.email,
      });
      console.log('Registration: saving user document', userDataToSave);

      await setDoc(doc(db, 'users', newUser.uid), userDataToSave);

      console.log('Registration: user document saved successfully');
      setUserData(userDataToSave);
    } catch (error: unknown) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        if (error.message.includes('auth/configuration-not-found')) {
          throw new Error(
            'Registration failed: Firebase Auth is not configured for this project. Please enable Email/Password sign-in in the Firebase Console and verify the authDomain/projectId settings.'
          );
        }
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed: unknown error');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof FirebaseError) {
        if ([
          'auth/wrong-password',
          'auth/user-not-found',
          'auth/invalid-email',
          'auth/user-disabled',
        ].includes(error.code)) {
          throw new Error('Hi, the login information is incorrect. Please check your email and password and try again.');
        }
      }
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: unknown error');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}