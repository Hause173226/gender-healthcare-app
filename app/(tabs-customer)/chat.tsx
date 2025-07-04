import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Search, MessageCircle, Clock } from 'lucide-react-native';

export default function ChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: 1,
      advisorName: 'Dr. Sarah Wilson',
      specialty: 'Reproductive Health',
      lastMessage: 'Based on your symptoms, I recommend...',
      timestamp: '2 min ago',
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 2,
      advisorName: 'Dr. Emma Johnson',
      specialty: 'Sexual Health',
      lastMessage: 'Your test results look normal',
      timestamp: '1 hour ago',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 3,
      advisorName: 'Dr. Michael Chen',
      specialty: 'General Health',
      lastMessage: 'Thank you for the update',
      timestamp: '1 day ago',
      unreadCount: 0,
      isOnline: true,
    },
  ];

  const quickQuestions = [
    'How can I track my fertility?',
    'What are normal period symptoms?',
    'STI testing recommendations',
    'Birth control options',
  ];

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-healthcare-text mb-4">
            Q&A Chat
          </Text>
          
          {/* Search */}
          <View className="relative">
            <Search size={20} color="#A0AEC0" className="absolute left-3 top-3 z-10" />
            <TextInput
              className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3"
              placeholder="Search conversations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>

        {/* Quick Questions */}
        <View className="px-6 mb-4">
          <Text className="text-lg font-semibold text-healthcare-text mb-3">
            Quick Questions
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {quickQuestions.map((question, index) => (
                <TouchableOpacity key={index}>
                  <Card className="px-4 py-2">
                    <Text className="text-healthcare-text text-sm">{question}</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Conversations */}
        <View className="flex-1 px-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Recent Conversations
          </Text>
          
          <ScrollView className="flex-1">
            {conversations.map((conversation) => (
              <TouchableOpacity 
                key={conversation.id} 
                className="mb-3"
                onPress={() => router.push('/(tabs-customer)/chat-detail')}
              >
                <Card className="flex-row items-center p-4">
                  <View className="relative">
                    <View className="w-12 h-12 bg-healthcare-primary rounded-full items-center justify-center">
                      <Text className="text-white font-semibold">
                        {conversation.advisorName.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    {conversation.isOnline && (
                      <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-healthcare-success rounded-full border-2 border-white" />
                    )}
                  </View>
                  
                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-healthcare-text font-semibold">
                        {conversation.advisorName}
                      </Text>
                      <Text className="text-healthcare-text/50 text-xs">
                        {conversation.timestamp}
                      </Text>
                    </View>
                    
                    <Text className="text-healthcare-text/70 text-sm mb-1">
                      {conversation.specialty}
                    </Text>
                    
                    <View className="flex-row items-center justify-between">
                      <Text className="text-healthcare-text/60 text-sm flex-1" numberOfLines={1}>
                        {conversation.lastMessage}
                      </Text>
                      {conversation.unreadCount > 0 && (
                        <View className="bg-healthcare-primary rounded-full w-5 h-5 items-center justify-center ml-2">
                          <Text className="text-white text-xs font-bold">
                            {conversation.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Start New Chat Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity 
            className="bg-healthcare-primary rounded-lg py-4 flex-row items-center justify-center"
            onPress={() => router.push('/(tabs-customer)/new-conversation')}
          >
            <MessageCircle size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              Start New Conversation
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}