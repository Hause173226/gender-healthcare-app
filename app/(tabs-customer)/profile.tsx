import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Calendar, MessageCircle, FlaskConical, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  
  const profileStats = [
    {
      title: 'Consultations',
      value: '12',
      icon: MessageCircle,
      color: '#F8BBD9',
    },
    {
      title: 'Tests Taken',
      value: '8',
      icon: FlaskConical,
      color: '#B2DFDB',
    },
    {
      title: 'Cycle Days',
      value: '180',
      icon: Calendar,
      color: '#E1F5FE',
    },
  ];

  const menuItems = [
    {
      title: 'Personal Information',
      icon: User,
      action: () => router.push('/(tabs-customer)/edit-profile'),
    },
    {
      title: 'Consultation History',
      icon: MessageCircle,
      action: () => router.push('/(tabs-customer)/consultation-history'),
    },
    {
      title: 'Test Results',
      icon: FlaskConical,
      action: () => router.push('/(tabs-customer)/test-results'),
    },
    {
      title: 'Notifications',
      icon: Bell,
      action: () => router.push('/(tabs-customer)/notifications'),
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      action: () => router.push('/(tabs-customer)/privacy-security'),
    },
    {
      title: 'Settings',
      icon: Settings,
      action: () => router.push('/(tabs-customer)/settings'),
    },
    {
      title: 'Help & Support',
      icon: HelpCircle,
      action: () => router.push('/(tabs-customer)/help-support'),
    },
  ];

  const handleSignOut = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            // Clear any stored user data here if needed
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="px-6 pt-6 pb-4">
          <Card className="items-center py-6">
            <View className="w-20 h-20 bg-healthcare-primary rounded-full items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">SW</Text>
            </View>
            <Text className="text-xl font-bold text-healthcare-text">
              Sarah Wilson
            </Text>
            <Text className="text-healthcare-text/70 mb-4">
              sarah.wilson@email.com
            </Text>
            <Button 
              title="Edit Profile" 
              variant="outline" 
              size="small" 
              onPress={() => router.push('/(tabs-customer)/edit-profile')}
            />
          </Card>
        </View>

        {/* Profile Stats */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Your Activity
          </Text>
          <View className="flex-row justify-between">
            {profileStats.map((stat, index) => (
              <Card key={index} className="flex-1 mx-1 items-center py-4">
                <stat.icon size={24} color={stat.color} />
                <Text className="text-2xl font-bold text-healthcare-text mt-2">
                  {stat.value}
                </Text>
                <Text className="text-healthcare-text/70 text-sm text-center">
                  {stat.title}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Account
          </Text>
          <Card className="p-0">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center px-4 py-4 ${
                  index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                onPress={item.action}
              >
                <item.icon size={20} color="#A0AEC0" />
                <Text className="text-healthcare-text ml-3 flex-1">
                  {item.title}
                </Text>
                <Text className="text-healthcare-text/40">›</Text>
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Recent Activity */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Recent Activity
          </Text>
          <View className="gap-3">
            <Card className="flex-row items-center py-3">
              <MessageCircle size={20} color="#F8BBD9" />
              <View className="ml-3 flex-1">
                <Text className="text-healthcare-text font-medium">
                  Consultation completed
                </Text>
                <Text className="text-healthcare-text/60 text-sm">
                  Dr. Sarah Wilson - 2 hours ago
                </Text>
              </View>
            </Card>
            
            <Card className="flex-row items-center py-3">
              <FlaskConical size={20} color="#B2DFDB" />
              <View className="ml-3 flex-1">
                <Text className="text-healthcare-text font-medium">
                  Test results available
                </Text>
                <Text className="text-healthcare-text/60 text-sm">
                  STI Panel - Yesterday
                </Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Logout */}
        <View className="px-6 pb-6">
          <TouchableOpacity 
            className="flex-row items-center justify-center py-4 border border-healthcare-danger rounded-lg"
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#E57373" />
            <Text className="text-healthcare-danger font-semibold ml-2">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}