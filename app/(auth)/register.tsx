import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mail, Lock, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    // Simulate registration
    setTimeout(() => {
      setLoading(false);
      router.replace('/(auth)/role-selection');
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-healthcare-text text-center mb-2">
          Create Account
        </Text>
        <Text className="text-lg text-healthcare-primary text-center mb-12">
          Join our healthcare community
        </Text>

        <Card className="mb-8">
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            leftIcon={<User size={20} color="#A0AEC0" />}
          />

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
            placeholder="Create a password"
            secureTextEntry
            leftIcon={<Lock size={20} color="#A0AEC0" />}
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            leftIcon={<Lock size={20} color="#A0AEC0" />}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            size="large"
          />
        </Card>

        <TouchableOpacity 
          className="mt-8"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-healthcare-text text-center">
            Already have an account?{' '}
            <Text className="text-healthcare-primary font-semibold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}