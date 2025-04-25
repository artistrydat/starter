import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { View, Alert, Image, Pressable } from 'react-native';

import { LoginForm } from '@/src/components/auth';
import { AppText, Button } from '@/src/components/ui';
import { AuthContext } from '@/src/utils/authContext';

const LoginScreen = () => {
  const router = useRouter();
  const { logIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      await logIn(email, password);
      // Navigation is handled in AuthContext after successful login
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    Alert.alert('Coming Soon', 'Forgot password functionality will be implemented soon.');
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign in
    Alert.alert('Coming Soon', 'Google sign in will be implemented soon.');
  };

  return (
    <View className="flex-1 justify-between bg-white p-5">
      <View className="mt-10 items-center">
        <Image
          source={require('@/assets/splash-icon.png')}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </View>

      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onGoogleSignIn={handleGoogleSignIn}
      />

      <View className="mb-5 mt-4 items-center">
        <AppText size="sm">
          Don't have an account?{' '}
          <Pressable onPress={() => router.replace('/signup')}>
            <AppText size="sm" color="primary">
              Sign Up here
            </AppText>
          </Pressable>
        </AppText>
      </View>
    </View>
  );
};

export default LoginScreen;
