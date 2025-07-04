import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Camera } from 'lucide-react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1995-03-15',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: 'John Wilson - +1 (555) 987-6543',
    medicalHistory: 'No known allergies. Previous surgery: Appendectomy (2018)',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1000);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft size={24} color="#2C3E50" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-healthcare-text">
              Edit Profile
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Profile Photo */}
          <Card className="mb-6 items-center py-6">
            <View className="relative">
              <View className="w-24 h-24 bg-healthcare-primary rounded-full items-center justify-center">
                <Text className="text-white text-3xl font-bold">SW</Text>
              </View>
              <TouchableOpacity className="absolute -bottom-2 -right-2 bg-healthcare-accent rounded-full p-2">
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-healthcare-text/70 mt-3">Tap to change photo</Text>
          </Card>

          {/* Personal Information */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Personal Information
            </Text>
            
            <Input
              label="Full Name"
              value={formData.fullName}
              onChangeText={(value) => updateField('fullName', value)}
              leftIcon={<User size={20} color="#A0AEC0" />}
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              leftIcon={<Mail size={20} color="#A0AEC0" />}
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
              leftIcon={<Phone size={20} color="#A0AEC0" />}
            />

            <Input
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChangeText={(value) => updateField('dateOfBirth', value)}
              leftIcon={<Calendar size={20} color="#A0AEC0" />}
            />
          </Card>

          {/* Address Information */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Address Information
            </Text>
            
            <Input
              label="Address"
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              multiline
              numberOfLines={3}
              leftIcon={<MapPin size={20} color="#A0AEC0" />}
            />
          </Card>

          {/* Emergency Contact */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Emergency Contact
            </Text>
            
            <Input
              label="Emergency Contact"
              value={formData.emergencyContact}
              onChangeText={(value) => updateField('emergencyContact', value)}
              placeholder="Name - Phone Number"
              leftIcon={<Phone size={20} color="#A0AEC0" />}
            />
          </Card>

          {/* Medical History */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Medical History
            </Text>
            
            <Input
              label="Medical History & Allergies"
              value={formData.medicalHistory}
              onChangeText={(value) => updateField('medicalHistory', value)}
              multiline
              numberOfLines={4}
              placeholder="List any allergies, medications, or medical conditions..."
            />
          </Card>

          {/* Save Button */}
          <View className="pb-6">
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              size="large"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}