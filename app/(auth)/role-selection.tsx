import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, UserCheck } from 'lucide-react-native';

export default function RoleSelectionScreen() {
  const selectRole = (role: 'customer' | 'staff') => {
    // Store role selection and navigate to main app
    router.replace(`/(tabs-${role})`);
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-healthcare-text text-center mb-2">
          Welcome to
        </Text>
        <Text className="text-3xl font-bold text-healthcare-primary text-center mb-8">
          Gender Healthcare
        </Text>
        
        <Text className="text-lg text-healthcare-text text-center mb-12">
          Please select your role to continue
        </Text>

        <View className="gap-6">
          <Card className="border-2 border-healthcare-primary/20">
            <View className="items-center py-6">
              <Users size={64} color="#F8BBD9" className="mb-4" />
              <Text className="text-xl font-bold text-healthcare-text mb-2">
                I'm a Customer
              </Text>
              <Text className="text-healthcare-text text-center mb-6 leading-5">
                Access healthcare services, track your cycle, book consultations
              </Text>
              <Button
                title="Continue as Customer"
                onPress={() => selectRole('customer')}
                size="large"
              />
            </View>
          </Card>

          <Card className="border-2 border-healthcare-accent/20">
            <View className="items-center py-6">
              <UserCheck size={64} color="#B2DFDB" className="mb-4" />
              <Text className="text-xl font-bold text-healthcare-text mb-2">
                I'm Healthcare Staff
              </Text>
              <Text className="text-healthcare-text text-center mb-6 leading-5">
                Manage consultations, communicate with patients, upload results
              </Text>
              <Button
                title="Continue as Staff"
                onPress={() => selectRole('staff')}
                variant="secondary"
                size="large"
              />
            </View>
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
}