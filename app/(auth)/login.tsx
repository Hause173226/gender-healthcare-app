import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mail, Lock } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
      router.replace("/(tabs-customer)");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className="flex-1 bg-healthcare-light">
        <View className="flex-1 justify-center px-6">
          <Text className="text-3xl font-bold text-healthcare-text text-center mb-2">
            Welcome Back
          </Text>
          <Text className="text-lg text-healthcare-primary text-center mb-6">
            Sign in to your account
          </Text>

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
            onPress={() => router.push("/(auth)/register")}
          >
            <Text className="text-healthcare-text text-center">
              Don't have an account?{" "}
              <Text className="text-healthcare-primary font-semibold">
                Sign Up
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
