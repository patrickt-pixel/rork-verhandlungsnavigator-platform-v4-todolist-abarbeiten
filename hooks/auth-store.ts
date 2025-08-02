import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { User, UserRole } from '@/types';
import { router } from 'expo-router';
import { AuthService, ProfileService } from '@/lib/supabase-service';
import { MOCK_MODE } from '@/lib/supabase';
import { mockUsers } from '@/lib/mock-data';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (MOCK_MODE) {
          // Mock mode - load from AsyncStorage
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } else {
          // Supabase mode - check current session
          const { user: authUser } = await AuthService.getCurrentUser();
          
          if (authUser) {
            const { data: profile } = await ProfileService.getProfile(authUser.id);
            if (profile) {
              await AsyncStorage.setItem('user', JSON.stringify(profile));
              setUser(profile);
            }
          }
          
          // Listen for auth state changes
          const { data: { subscription } } = AuthService.onAuthStateChange(async (authUser) => {
            if (authUser) {
              const { data: profile } = await ProfileService.getProfile(authUser.id);
              if (profile) {
                await AsyncStorage.setItem('user', JSON.stringify(profile));
                setUser(profile);
              }
            } else {
              await AsyncStorage.removeItem('user');
              setUser(null);
            }
          });
          
          return () => subscription.unsubscribe();
        }
      } catch (err) {
        console.error('Failed to load user from storage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let loggedInUser: User;
      
      if (MOCK_MODE) {
        // Mock mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const foundUser = mockUsers.find(u => u.email === email);
        
        if (!foundUser) {
          throw new Error('Invalid email or password');
        }
        
        loggedInUser = foundUser;
        
        await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      } else {
        // Supabase mode
        const { user: authUser, error: authError } = await AuthService.signIn(email, password);
        
        if (authError) {
          throw new Error(authError.message);
        }
        
        if (!authUser) {
          throw new Error('Authentication failed');
        }
        
        // Get user profile
        const { data: profile, error: profileError } = await ProfileService.getProfile(authUser.id);
        
        if (profileError || !profile) {
          throw new Error('Failed to load user profile');
        }
        
        loggedInUser = profile;
        await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }
      
      // Navigate based on role
      if (loggedInUser.role === 'client') {
        router.replace('/(tabs)');
      } else if (loggedInUser.role === 'consultant') {
        router.replace('/(tabs)/consultant-dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let newUser: User;
      
      if (MOCK_MODE) {
        // Mock mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user already exists
        if (mockUsers.some(u => u.email === email)) {
          throw new Error('Email already in use');
        }
        
        // Create new user
        newUser = {
          id: `${mockUsers.length + 1}`,
          email,
          name,
          role,
          createdAt: new Date().toISOString(),
        };
        
        // In mock mode, just store locally
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
      } else {
        // Supabase mode
        const { user: authUser, error: authError } = await AuthService.signUp(email, password, { name, role: role === 'admin' ? 'client' as const : role });
        
        if (authError) {
          throw new Error(authError.message);
        }
        
        if (!authUser) {
          throw new Error('Registration failed');
        }
        
        // Get user profile (will be created by trigger)
        const { data: profile, error: profileError } = await ProfileService.getProfile(authUser.id);
        
        if (profileError || !profile) {
          throw new Error('Failed to create user profile');
        }
        
        newUser = profile;
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
      }
      
      // Navigate based on role
      if (role === 'client') {
        router.replace('/(tabs)');
      } else if (role === 'consultant') {
        router.replace('/(tabs)/consultant-dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (!MOCK_MODE) {
        await AuthService.signOut();
      }
      
      await AsyncStorage.removeItem('user');
      setUser(null);
      router.replace('/auth/login');
    } catch (err) {
      console.error('Failed to logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      let updatedUser: User;
      
      if (MOCK_MODE) {
        // Mock mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        updatedUser = { ...user, ...updates };
        
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        // Supabase mode
        const result = await ProfileService.updateProfile(user.id, updates);
        const { data: profile, error: profileError } = result;
        
        if (profileError) {
          throw new Error(profileError.message);
        }
        
        if (!profile) {
          throw new Error('Failed to update profile');
        }
        
        updatedUser = profile;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update profile');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };
});