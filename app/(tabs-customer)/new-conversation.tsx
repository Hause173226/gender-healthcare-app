import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, MessageCircle, Star, Clock, Video, MapPin } from 'lucide-react-native';

export default function NewConversationScreen() {
  const router = useRouter();
  const [selectedAdvisor, setSelectedAdvisor] = useState<number | null>(null);
  const [consultationType, setConsultationType] = useState<'online' | 'in-person'>('online');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const advisors = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      specialty: 'Reproductive Health',
      rating: 4.9,
      experience: '8 years',
      avatar: 'SW',
      available: true,
      nextSlot: 'Today 2:00 PM',
    },
    {
      id: 2,
      name: 'Dr. Emma Johnson',
      specialty: 'Sexual Health',
      rating: 4.8,
      experience: '6 years',
      avatar: 'EJ',
      available: true,
      nextSlot: 'Tomorrow 10:00 AM',
    },
    {
      id: 3,
      name: 'Dr. Michael Chen',
      specialty: 'General Health',
      rating: 4.7,
      experience: '10 years',
      avatar: 'MC',
      available: false,
      nextSlot: 'Dec 23 3:00 PM',
    },
  ];

  const quickTopics = [
    'Menstrual cycle questions',
    'Birth control consultation',
    'STI testing advice',
    'Pregnancy concerns',
    'General health check',
  ];

  const handleStartConversation = async () => {
    if (!selectedAdvisor) {
      Alert.alert('Error', 'Please select an advisor');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your question or concern');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Conversation started! You will be redirected to the chat.', [
        { text: 'OK', onPress: () => router.push('/(tabs-customer)/chat-detail') }
      ]);
    }, 1000);
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
              Start New Conversation
            </Text>
          </View>
          <Text className="text-healthcare-text/70">
            Connect with our healthcare professionals
          </Text>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Consultation Type */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Consultation Type
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setConsultationType('online')}
                className={`flex-1 p-4 rounded-lg border-2 flex-row items-center justify-center ${
                  consultationType === 'online'
                    ? 'border-healthcare-primary bg-healthcare-primary/10'
                    : 'border-gray-200'
                }`}
              >
                <Video size={20} color={consultationType === 'online' ? '#F8BBD9' : '#A0AEC0'} />
                <Text className={`ml-2 font-medium ${
                  consultationType === 'online' ? 'text-healthcare-primary' : 'text-healthcare-text'
                }`}>
                  Online
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setConsultationType('in-person')}
                className={`flex-1 p-4 rounded-lg border-2 flex-row items-center justify-center ${
                  consultationType === 'in-person'
                    ? 'border-healthcare-primary bg-healthcare-primary/10'
                    : 'border-gray-200'
                }`}
              >
                <MapPin size={20} color={consultationType === 'in-person' ? '#F8BBD9' : '#A0AEC0'} />
                <Text className={`ml-2 font-medium ${
                  consultationType === 'in-person' ? 'text-healthcare-primary' : 'text-healthcare-text'
                }`}>
                  In-Person
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Select Advisor */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Choose Your Advisor
            </Text>
            <View className="gap-3">
              {advisors.map((advisor) => (
                <TouchableOpacity
                  key={advisor.id}
                  onPress={() => setSelectedAdvisor(advisor.id)}
                  className={`p-4 rounded-lg border-2 ${
                    selectedAdvisor === advisor.id
                      ? 'border-healthcare-primary bg-healthcare-primary/10'
                      : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-healthcare-accent rounded-full items-center justify-center">
                      <Text className="text-white font-semibold">{advisor.avatar}</Text>
                    </View>
                    
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-healthcare-text font-semibold">
                          {advisor.name}
                        </Text>
                        <View className={`px-2 py-1 rounded-full ${
                          advisor.available ? 'bg-healthcare-success/20' : 'bg-gray-200'
                        }`}>
                          <Text className={`text-xs font-medium ${
                            advisor.available ? 'text-healthcare-success' : 'text-gray-600'
                          }`}>
                            {advisor.available ? 'Available' : 'Busy'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-healthcare-text/70 text-sm mb-1">
                        {advisor.specialty} • {advisor.experience}
                      </Text>
                      
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Star size={14} color="#FFB74D" fill="#FFB74D" />
                          <Text className="text-healthcare-text text-sm ml-1">
                            {advisor.rating}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Clock size={14} color="#A0AEC0" />
                          <Text className="text-healthcare-text/60 text-sm ml-1">
                            {advisor.nextSlot}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Quick Topics */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Quick Topics
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {quickTopics.map((topic, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setMessage(topic)}
                  className="px-3 py-2 bg-healthcare-secondary/30 rounded-full"
                >
                  <Text className="text-healthcare-text text-sm">{topic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Message */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Your Question or Concern
            </Text>
            <Input
              placeholder="Describe your question or health concern..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              className="h-24"
            />
          </Card>

          {/* Start Button */}
          <View className="pb-6">
            <Button
              title="Start Conversation"
              onPress={handleStartConversation}
              loading={loading}
              size="large"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}