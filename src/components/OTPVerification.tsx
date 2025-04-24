import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';

type OTPVerificationProps = {
  phoneNumber: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
  resendDelay?: number;
};

export default function OTPVerification({
  phoneNumber,
  onVerificationSuccess,
  onBack,
  resendDelay = 30,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(resendDelay);
  const [isResendActive, setIsResendActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !isResendActive) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsResendActive(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    setIsResendActive(false);
    setCountdown(resendDelay);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="w-full flex-1">
      <View className="space-y-6 p-6">
        <TouchableOpacity onPress={onBack} className="flex-row items-center space-x-2">
          <MaterialCommunityIcons name="arrow-left" size={24} color="rgba(255, 255, 255, 0.8)" />
          <AppText size="lg" color="secondary" weight="medium">
            Back
          </AppText>
        </TouchableOpacity>

        <AppText size="3xl" weight="bold" color="primary" align="center" className="mb-2">
          🔐 Verify Your Number
        </AppText>
        <AppText size="lg" color="secondary" align="center" className="mb-6">
          Enter the code we sent to {phoneNumber}
        </AppText>

        <View className="flex-row justify-between space-x-2">
          {otp.map((digit, index) => (
            <BlurView
              key={index}
              intensity={20}
              tint="dark"
              className="flex-1 overflow-hidden rounded-2xl border border-white/10">
              <TextInput
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="number-pad"
                className="px-2 py-4 text-center text-2xl font-bold text-white"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />
            </BlurView>
          ))}
        </View>

        <Button
          title="Verify"
          onPress={onVerificationSuccess}
          theme="primary"
          size="lg"
          disabled={otp.some((digit) => digit === '')}
        />

        <TouchableOpacity
          onPress={handleResendCode}
          disabled={!isResendActive}
          className="items-center py-2">
          <AppText
            size="sm"
            color={isResendActive ? 'accent' : 'tertiary'}
            weight={isResendActive ? 'medium' : 'normal'}
            align="center">
            {isResendActive ? 'Resend Code' : `Resend code in ${countdown}s`}
          </AppText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
