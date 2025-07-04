import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Bell, MessageCircle, Calendar, FlaskConical, Heart, Settings } from 'lucide-react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    testResults: true,
    cycleReminders: true,
    healthTips: false,
    promotions: false,
  });

  const [recentNotifications] = useState([
    {
      id: 1,
      title: 'Appointment Reminder',
      message: 'Your consultation with Dr. Sarah Wilson is tomorrow at 2:00 PM',
      time: '2 hours ago',
      type: 'appointment',
      read: false,
    },
    {
      id: 2,
      title: 'Test Results Available',
      message: 'Your STI panel results are now available to view',
      time: '1 day ago',
      type: 'test',
      read: true,
    },
    {
      id: 3,
      title: 'Cycle Reminder',
      message: 'Your period is expected to start in 3 days',
      time: '2 days ago',
      type: 'cycle',
      read: true,
    },
    {
      id: 4,
      title: 'Health Tip',
      message: 'Stay hydrated! Drinking water helps regulate your cycle',
      time: '3 days ago',
      type: 'health',
      read: true,
    },
  ]);

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar size={20} color="#F8BBD9" />;
      case 'test': return <FlaskConical size={20} color="#B2DFDB" />;
      case 'cycle': return <Heart size={20} color="#E57373" />;
      case 'health': return <Bell size={20} color="#81C784" />;
      default: return <Bell size={20} color="#A0AEC0" />;
    }
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
              Notifications
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Notification Settings */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Notification Settings
            </Text>
            
            {/* General Settings */}
            <View className="mb-4">
              <Text className="text-healthcare-text font-medium mb-3">General</Text>
              
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center flex-1">
                  <Bell size={20} color="#F8BBD9" />
                  <Text className="text-healthcare-text ml-3">Push Notifications</Text>
                </View>
                <Switch
                  value={notifications.pushNotifications}
                  onValueChange={() => toggleNotification('pushNotifications')}
                  trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                  thumbColor={notifications.pushNotifications ? '#FFFFFF' : '#A0AEC0'}
                />
              </View>

              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center flex-1">
                  <MessageCircle size={20} color="#F8BBD9" />
                  <Text className="text-healthcare-text ml-3">Email Notifications</Text>
                </View>
                <Switch
                  value={notifications.emailNotifications}
                  onValueChange={() => toggleNotification('emailNotifications')}
                  trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                  thumbColor={notifications.emailNotifications ? '#FFFFFF' : '#A0AEC0'}
                />
              </View>

              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center flex-1">
                  <MessageCircle size={20} color="#F8BBD9" />
                  <Text className="text-healthcare-text ml-3">SMS Notifications</Text>
                </View>
                <Switch
                  value={notifications.smsNotifications}
                  onValueChange={() => toggleNotification('smsNotifications')}
                  trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                  thumbColor={notifications.smsNotifications ? '#FFFFFF' : '#A0AEC0'}
                />
              </View>
            </View>

            {/* Specific Notifications */}
            <View>
              <Text className="text-healthcare-text font-medium mb-3">Specific Notifications</Text>
              
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center flex-1">
                  <Calendar size={20} color="#B2DFDB" />
                  <Text className="text-healthcare-text ml-3">Appointment Reminders</Text>
                </View>
                <Switch
                  value={notifications.appointmentReminders}
                  onValueChange={() => toggleNotification('appointmentReminders')}
                  trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                  thumbColor={notifications.appointmentReminders ? '#FFFFFF' : '#A0AEC0'}
                />
              </View>

              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center flex-1">
                  <FlaskConical size={20} color="#B2DFDB" />
                  <Text className="text-healthcare-text ml-3">Test Results</Text>
                </View>
                <Switch
                  value={notifications.testResults}
                  onValueChange={() => toggleNotification('testResults')}
                  trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                  thumbColor={notifications.testResults ? '#FFFFFF' : '#A0AEC0'}
                />
              </View>

              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center flex-1">
                  <Heart size={20} color="#E57373" />
                  <Text className="text-healthcare-text ml-3">Cycle Reminders</Text>
                </View>
                <Switch
                  value={notifications.cycleReminders}
                  onValueChange={() => toggleNotification('cycleReminders')}
                  trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                  thumbColor={notifications.cycleReminders ? '#FFFFFF' : '#A0AEC0'}
                />
              </View>

              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center flex-1">
                  <Bell size={20} color="#81C784" />
                  <Text className="text-healthcare-text ml-3">Health Tips</Text>
                </View>
                <Switch
                  value={notifications.healthTips}
                  onValueChange={() => toggleNotification('healthTips')}
                  trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                  thumbColor={notifications.healthTips ? '#FFFFFF' : '#A0AEC0'}
                />
              </View>

              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center flex-1">
                  <Settings size={20} color="#A0AEC0" />
                  <Text className="text-healthcare-text ml-3">Promotions</Text>
                </View>
                <Switch
                  value={notifications.promotions}
                  onValueChange={() => toggleNotification('promotions')}
                  trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                  thumbColor={notifications.promotions ? '#FFFFFF' : '#A0AEC0'}
                />
              </View>
            </View>
          </Card>

          {/* Recent Notifications */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Recent Notifications
            </Text>
            
            {recentNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                className={`flex-row items-start py-3 ${
                  notification.id < recentNotifications.length ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="mr-3 mt-1">
                  {getNotificationIcon(notification.type)}
                </View>
                
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className={`font-medium ${
                      notification.read ? 'text-healthcare-text/70' : 'text-healthcare-text'
                    }`}>
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View className="w-2 h-2 bg-healthcare-primary rounded-full" />
                    )}
                  </View>
                  
                  <Text className="text-healthcare-text/60 text-sm mb-1">
                    {notification.message}
                  </Text>
                  
                  <Text className="text-healthcare-text/50 text-xs">
                    {notification.time}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Action Buttons */}
          <View className="pb-6 gap-3">
            <Button title="Mark All as Read" variant="outline" />
            <Button title="Clear All Notifications" variant="outline" />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}