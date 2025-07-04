import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, MessageCircle, FlaskConical, BookOpen } from 'lucide-react-native';

export default function CustomerHomeScreen() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Track Cycle',
      icon: Calendar,
      color: '#F8BBD9',
      action: () => router.push('/(tabs-customer)/cycle'),
    },
    {
      title: 'Ask Question',
      icon: MessageCircle,
      color: '#E1F5FE',
      action: () => router.push('/(tabs-customer)/chat'),
    },
    {
      title: 'Book Test',
      icon: FlaskConical,
      color: '#B2DFDB',
      action: () => router.push('/(tabs-customer)/tests'),
    },
    {
      title: 'Health Tips',
      icon: BookOpen,
      color: '#81C784',
      action: () => {
        // Navigate to a health tips section or external resource
        console.log('Health Tips clicked');
      },
    },
  ];

  const healthArticles = [
    {
      id: 1,
      title: 'Understanding Your Menstrual Cycle',
      excerpt: 'Learn about the phases of your cycle and what to expect.',
      image: 'https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?auto=compress&cs=tinysrgb&w=400',
      readTime: '5 min read',
      action: () => {
        // Navigate to article detail or external link
        console.log('Article 1 clicked');
      },
    },
    {
      id: 2,
      title: 'Safe Sex Practices',
      excerpt: 'Essential information about protection and prevention.',
      image: 'https://images.pexels.com/photos/3985170/pexels-photo-3985170.jpeg?auto=compress&cs=tinysrgb&w=400',
      readTime: '3 min read',
      action: () => {
        // Navigate to article detail or external link
        console.log('Article 2 clicked');
      },
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-healthcare-text">
            Good morning, Sarah! 👋
          </Text>
          <Text className="text-healthcare-text/70 mt-1">
            How are you feeling today?
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className="w-[48%] mb-4"
                onPress={action.action}
                activeOpacity={0.7}
              >
                <Card className="items-center py-6">
                  <action.icon size={32} color={action.color} />
                  <Text className="text-healthcare-text font-medium mt-2">
                    {action.title}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cycle Overview */}
        <View className="px-6 mb-6">
          <Card className="bg-healthcare-primary/10">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-healthcare-text mb-1">
                  Cycle Day 14
                </Text>
                <Text className="text-healthcare-text/70 mb-3">
                  Ovulation predicted in 2 days
                </Text>
                <Button 
                  title="View Details" 
                  size="small" 
                  onPress={() => router.push('/(tabs-customer)/cycle')}
                />
              </View>
              <Calendar size={48} color="#F8BBD9" />
            </View>
          </Card>
        </View>

        {/* Health Articles */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Health Education
          </Text>
          {healthArticles.map((article) => (
            <TouchableOpacity 
              key={article.id} 
              className="mb-4"
              onPress={article.action}
              activeOpacity={0.7}
            >
              <Card className="overflow-hidden p-0">
                <View className="flex-row">
                  <Image
                    source={{ uri: article.image }}
                    className="w-24 h-24"
                    resizeMode="cover"
                  />
                  <View className="flex-1 p-4">
                    <Text className="text-healthcare-text font-semibold mb-1">
                      {article.title}
                    </Text>
                    <Text className="text-healthcare-text/70 text-sm mb-2">
                      {article.excerpt}
                    </Text>
                    <Text className="text-healthcare-primary text-xs">
                      {article.readTime}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Appointments */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Upcoming Appointments
          </Text>
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-healthcare-text font-semibold">
                  Consultation with Dr. Smith
                </Text>
                <Text className="text-healthcare-text/70">
                  Tomorrow, 2:00 PM
                </Text>
              </View>
              <Button 
                title="Join" 
                size="small" 
                onPress={() => router.push('/(tabs-customer)/chat-detail')}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}