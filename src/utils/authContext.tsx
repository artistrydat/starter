import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen, useRouter } from 'expo-router';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';

import { supabase, getSessionWithRetry } from './supabaseClient';

type AuthState = {
  [x: string]: any;
  isLoggedIn: boolean;
  isReady: boolean;
  hasCompletedOnboarding: boolean;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const authStorageKey = 'auth-key';

export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isReady: false,
  hasCompletedOnboarding: false,
  logIn: async (email: string, password: string): Promise<void> => Promise.resolve(),
  logOut: async (): Promise<void> => Promise.resolve(),
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const router = useRouter();

  const storeAuthState = async (newState: { isLoggedIn: boolean }) => {
    try {
      const jsonValue = JSON.stringify(newState);
      await AsyncStorage.setItem(authStorageKey, jsonValue);
    } catch (error) {
      console.log('Error saving', error);
    }
  };

  const logIn = async (email: string, password: string) => {
    try {
      await SplashScreen.preventAutoHideAsync();
      await new Promise((resolve) => setTimeout(resolve, 500));

      let session;
      if (password) {
        // Normal login with password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        session = data.session;
      } else {
        // Get existing session with improved retry mechanism
        const { session: existingSession, error } = await getSessionWithRetry();
        if (error) throw error;
        session = existingSession;
      }

      if (!session) {
        console.error('No valid session found after all attempts');
        throw new Error('No session found');
      }

      setIsLoggedIn(true);
      storeAuthState({ isLoggedIn: true });

      // Check onboarding status from both user metadata and profile
      const onboardingCompleted = session.user?.user_metadata?.onboarding_completed === true;
      setHasCompletedOnboarding(onboardingCompleted);

      await SplashScreen.hideAsync();

      // Navigate based on onboarding status
      if (!onboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/(protected)/(tabs)/(home)');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      await SplashScreen.hideAsync();
      throw error;
    }
  };

  const logOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsLoggedIn(false);
      setHasCompletedOnboarding(false);
      storeAuthState({ isLoggedIn: false });
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const getAuthFromSupabase = async () => {
      try {
        // Use the improved session retrieval method
        const { session, error } = await getSessionWithRetry();
        await new Promise((res) => setTimeout(() => res(null), 500));

        if (session) {
          setIsLoggedIn(true);
          storeAuthState({ isLoggedIn: true });

          // Check onboarding status
          const onboardingCompleted = session.user?.user_metadata?.onboarding_completed === true;
          setHasCompletedOnboarding(onboardingCompleted);
        } else {
          // If no session from Supabase, try fallback to AsyncStorage
          const value = await AsyncStorage.getItem(authStorageKey);
          if (value !== null) {
            const auth = JSON.parse(value);
            // Only set isLoggedIn if we're certain the session is valid
            // This prevents a false logged-in state that would later cause auth errors
            if (auth.isLoggedIn) {
              // Verify if we actually have a valid session before setting isLoggedIn
              const { session: verifySession } = await getSessionWithRetry(1);
              setIsLoggedIn(!!verifySession);
            }
          }
        }
      } catch (error) {
        console.log('Error fetching auth state', error);
        // On error, default to logged out for safety
        setIsLoggedIn(false);
      }
      setIsReady(true);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_IN' && session) {
        setIsLoggedIn(true);
        storeAuthState({ isLoggedIn: true });
        // Check onboarding status on auth state change
        const onboardingCompleted = session.user?.user_metadata?.onboarding_completed === true;
        setHasCompletedOnboarding(onboardingCompleted);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setHasCompletedOnboarding(false);
        storeAuthState({ isLoggedIn: false });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Handle token refresh events
        setIsLoggedIn(true);
        storeAuthState({ isLoggedIn: true });
        // Re-check onboarding status when token refreshes
        const onboardingCompleted = session.user?.user_metadata?.onboarding_completed === true;
        setHasCompletedOnboarding(onboardingCompleted);
      } else if (event === 'USER_UPDATED' && session) {
        // Handle user update events
        const onboardingCompleted = session.user?.user_metadata?.onboarding_completed === true;
        setHasCompletedOnboarding(onboardingCompleted);
      }
    });

    getAuthFromSupabase();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return (
    <AuthContext.Provider
      value={{
        isReady,
        isLoggedIn,
        hasCompletedOnboarding,
        logIn,
        logOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
