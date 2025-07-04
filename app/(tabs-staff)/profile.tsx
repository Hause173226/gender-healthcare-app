import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Calendar, MessageCircle, Star, Award, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';

export default function StaffProfileScreen() {
  const router = useRouter();
  
  const profileStats = [
    {
      title: 'Consultations',
      value: '156',
      icon: MessageCircle,
      color: '#B2DFDB',
    },
    {
      title: 'Average Rating',
      value: '4.9',
      icon: Star,
      color: '#81C784',
    },
    {
      title: 'This Month',
      value: '24',
      icon: Calendar,
      color: '#E1F5FE',
    },
  ];

  const certifications = [
    'Certified Sexual Health Counselor',
    'Reproductive Health Specialist',
    'Women\'s Health Certificate',
  ];

  const menuItems = [
    {
      title: 'Personal Information',
      icon: User,
      action: () => {},
    },
    {
      title: 'Professional Details',
      icon: Award,
      action: () => {},
    },
    {
      title: 'Availability Settings',
      icon: Calendar,
      action: () => {},
    },
    {
      title: 'Notifications',
      icon: Bell,
      action: () => {},
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      action: () => {},
    },
    {
      title: 'Settings',
      icon: Settings,
      action: () => {},
    },
    {
      title: 'Help & Support',
      icon: HelpCircle,
      action: () => {},
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
            <View className="w-20 h-20 bg-healthcare-accent rounded-full items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">DW</Text>
            </View>
            <Text className="text-xl font-bold text-healthcare-text">
              Dr. Sarah Wilson
            </Text>
            <Text className="text-healthcare-text/70 mb-2">
              Reproductive Health Specialist
            </Text>
            <View className="flex-row items-center mb-4">
              <Star size={16} color="#81C784" />
              <Text className="text-healthcare-text ml-1">4.9 (156 reviews)</Text>
            </View>
            <Button 
              title="Edit Profile" 
              variant="outline" 
              size="small" 
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Professional Stats */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Professional Summary
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

        {/* Certifications */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Certifications
          </Text>
          <Card>
            {certifications.map((cert, index) => (
              <View
                key={index}
                className={`flex-row items-center py-3 ${
                  index < certifications.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <Award size={20} color="#B2DFDB" />
                <Text className="text-healthcare-text ml-3 flex-1">
                  {cert}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Menu Items */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Account Settings
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

        {/* Recent Reviews */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Recent Patient Feedback
          </Text>
          <View className="gap-3">
            <Card>
              <View className="flex-row items-center mb-2">
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} color="#81C784" fill="#81C784" />
                  ))}
                </View>
                <Text className="text-healthcare-text/60 text-sm ml-2">2 days ago</Text>
              </View>
              <Text className="text-healthcare-text">
                "Dr. Wilson was very professional and made me feel comfortable discussing sensitive topics."
              </Text>
            </Card>
            
            <Card>
              <View className="flex-row items-center mb-2">
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} color="#81C784" fill="#81C784" />
                  ))}
                </View>
                <Text className="text-healthcare-text/60 text-sm ml-2">1 week ago</Text>
              </View>
              <Text className="text-healthcare-text">
                "Excellent consultation. Clear explanations and very helpful advice."
              </Text>
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