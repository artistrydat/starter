import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { View, Alert } from 'react-native';

import { Button } from '@/src/components/Button';
import { LoginForm } from '@/src/components/LoginForm';
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

  return (
    <View className="flex-1 justify-center p-4">
      <LoginForm onSubmit={handleLogin} onForgotPassword={handleForgotPassword} />
      <View className="mt-4">
        <Button
          theme="secondary"
          size="lg"
          title="Don't have an account? Sign up"
          onPress={() => router.replace('/signup')}
        />
      </View>
    </View>
  );
};

export default LoginScreen;
