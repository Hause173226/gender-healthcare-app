import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { useToast } from "@/hooks/useToast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mail, Lock, User, Phone } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "Female" as "Male" | "Female" | "Other",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: formData.gender,
        role: "Customer",
      });

      router.replace("/(auth)/login");
    } catch (error) {
      // Error is already handled in AuthContext
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
        <ScrollView className="flex-1 px-6">
          <View className="py-8">
            <Text className="text-3xl font-bold text-healthcare-text text-center mb-2">
              Create Account
            </Text>
            <Text className="text-lg text-healthcare-primary text-center mb-6">
              Join our healthcare community
            </Text>

            <Card className="mb-8">
              <Input
                label="Full Name *"
                value={formData.name}
                onChangeText={(value) =>
                  setFormData({ ...formData, name: value })
                }
                placeholder="Enter your full name"
                leftIcon={<User size={20} color="#A0AEC0" />}
              />

              <Input
                label="Email *"
                value={formData.email}
                onChangeText={(value) =>
                  setFormData({ ...formData, email: value })
                }
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={20} color="#A0AEC0" />}
              />

              <Input
                label="Phone Number"
                value={formData.phone}
                onChangeText={(value) =>
                  setFormData({ ...formData, phone: value })
                }
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                leftIcon={<Phone size={20} color="#A0AEC0" />}
              />

              <Input
                label="Password *"
                value={formData.password}
                onChangeText={(value) =>
                  setFormData({ ...formData, password: value })
                }
                placeholder="Enter your password"
                secureTextEntry
                leftIcon={<Lock size={20} color="#A0AEC0" />}
              />

              <Input
                label="Confirm Password *"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  setFormData({ ...formData, confirmPassword: value })
                }
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
              onPress={() => router.push("/(auth)/login")}
            >
              <Text className="text-healthcare-text text-center">
                Already have an account?{" "}
                <Text className="text-healthcare-primary font-semibold">
                  Sign In
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
