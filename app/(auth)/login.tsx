import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mail, Lock, Info } from 'lucide-react-native';

// Demo accounts
const DEMO_ACCOUNTS = {
  'customer@demo.com': {
    password: '123456',
    role: 'customer',
    name: 'Sarah Wilson'
  },
  'staff@demo.com': {
    password: '123456',
    role: 'staff',
    name: 'Dr. Emma Johnson'
  },
  'admin@demo.com': {
    password: 'admin123',
    role: 'staff',
    name: 'Dr. Michael Chen'
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    
    // Check demo accounts
    const account = DEMO_ACCOUNTS[email.toLowerCase() as keyof typeof DEMO_ACCOUNTS];
    
    if (account && account.password === password) {
      // Successful login
      setTimeout(() => {
        setLoading(false);
        // Navigate directly to the appropriate tab based on role
        if (account.role === 'customer') {
          router.replace('/(tabs-customer)');
        } else if (account.role === 'staff') {
          router.replace('/(tabs-staff)');
        }
      }, 1000);
    } else if (email && password) {
      // Invalid credentials
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Đăng nhập thất bại',
          'Email hoặc mật khẩu không đúng. Vui lòng thử lại với tài khoản demo.',
          [{ text: 'OK' }]
        );
      }, 1000);
    } else {
      // Empty fields
      setLoading(false);
      Alert.alert(
        'Thông tin thiếu',
        'Vui lòng nhập email và mật khẩu.',
        [{ text: 'OK' }]
      );
    }
  };

  const fillDemoAccount = (accountType: 'customer' | 'staff') => {
    if (accountType === 'customer') {
      setEmail('customer@demo.com');
      setPassword('123456');
    } else {
      setEmail('staff@demo.com');
      setPassword('123456');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-healthcare-text text-center mb-2">
          Welcome Back
        </Text>
        <Text className="text-lg text-healthcare-primary text-center mb-6">
          Sign in to your account
        </Text>

        {/* Demo Info Card */}
        <Card className="mb-6 bg-healthcare-secondary/20">
          <View className="flex-row items-center mb-2">
            <Info size={20} color="#F8BBD9" />
            <Text className="text-base font-semibold text-healthcare-text ml-2">
              Demo Accounts
            </Text>
          </View>
          <Text className="text-healthcare-text mb-3 text-sm">
            Sử dụng tài khoản demo để trải nghiệm ứng dụng:
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              className="flex-1 bg-healthcare-primary py-2 px-3 rounded-md items-center"
              onPress={() => fillDemoAccount('customer')}
            >
              <Text className="text-white text-xs font-medium">Customer Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-healthcare-accent py-2 px-3 rounded-md items-center"
              onPress={() => fillDemoAccount('staff')}
            >
              <Text className="text-white text-xs font-medium">Staff Demo</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card className="mb-8">
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color="#A0AEC0" />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            leftIcon={<Lock size={20} color="#A0AEC0" />}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            size="large"
          />

          <TouchableOpacity className="mt-4">
            <Text className="text-healthcare-primary text-center">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </Card>

        <TouchableOpacity 
          className="mt-8"
          onPress={() => router.push('/(auth)/register')}
        >
          <Text className="text-healthcare-text text-center">
            Don't have an account?{' '}
            <Text className="text-healthcare-primary font-semibold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}