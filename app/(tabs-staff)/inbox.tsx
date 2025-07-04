import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, MessageCircle, Clock, Send } from 'lucide-react-native';

export default function InboxScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  const patientChats = [
    {
      id: 1,
      patientName: 'Sarah Wilson',
      lastMessage: 'Thank you for the consultation yesterday. I have a follow-up question about...',
      timestamp: '2 min ago',
      unreadCount: 2,
      priority: 'high',
    },
    {
      id: 2,
      patientName: 'Emma Johnson',
      lastMessage: 'Could you explain the test results in more detail?',
      timestamp: '1 hour ago',
      unreadCount: 1,
      priority: 'medium',
    },
    {
      id: 3,
      patientName: 'Michael Chen',
      lastMessage: 'The medication is working well, feeling much better.',
      timestamp: '3 hours ago',
      unreadCount: 0,
      priority: 'low',
    },
  ];

  const messages = [
    {
      id: 1,
      text: 'Hello Dr. Wilson, I have some questions about my recent test results.',
      sender: 'patient',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      text: 'Hi Sarah! I\'d be happy to help. What specific questions do you have?',
      sender: 'doctor',
      timestamp: '10:32 AM',
    },
    {
      id: 3,
      text: 'The results show everything is normal, but I wanted to understand what the numbers mean.',
      sender: 'patient',
      timestamp: '10:35 AM',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-healthcare-text mb-4">
            Patient Inbox
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

        {/* Stats */}
        <View className="px-6 mb-4">
          <View className="flex-row gap-3">
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">12</Text>
              <Text className="text-healthcare-text/70 text-sm">Unread</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">34</Text>
              <Text className="text-healthcare-text/70 text-sm">Total</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">2.5h</Text>
              <Text className="text-healthcare-text/70 text-sm">Avg Response</Text>
            </Card>
          </View>
        </View>

        {!selectedChat ? (
          /* Chat List */
          <View className="flex-1 px-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Recent Conversations
            </Text>
            
            <ScrollView className="flex-1">
              {patientChats.map((chat) => (
                <TouchableOpacity 
                  key={chat.id} 
                  className="mb-3"
                  onPress={() => setSelectedChat(chat.id)}
                >
                  <Card className="flex-row items-center p-4">
                    <View className="relative">
                      <View className="w-12 h-12 bg-healthcare-accent rounded-full items-center justify-center">
                        <Text className="text-white font-semibold">
                          {chat.patientName.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      {chat.priority === 'high' && (
                        <View className="absolute -top-1 -right-1 w-4 h-4 bg-healthcare-danger rounded-full" />
                      )}
                    </View>
                    
                    <View className="flex-1 ml-4">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-healthcare-text font-semibold">
                          {chat.patientName}
                        </Text>
                        <Text className="text-healthcare-text/50 text-xs">
                          {chat.timestamp}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center justify-between">
                        <Text className="text-healthcare-text/60 text-sm flex-1" numberOfLines={1}>
                          {chat.lastMessage}
                        </Text>
                        {chat.unreadCount > 0 && (
                          <View className="bg-healthcare-accent rounded-full w-5 h-5 items-center justify-center ml-2">
                            <Text className="text-white text-xs font-bold">
                              {chat.unreadCount}
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
        ) : (
          /* Chat View */
          <View className="flex-1">
            {/* Chat Header */}
            <View className="px-6 pb-4">
              <Card className="flex-row items-center justify-between py-3">
                <TouchableOpacity onPress={() => setSelectedChat(null)}>
                  <Text className="text-healthcare-primary">← Back</Text>
                </TouchableOpacity>
                <Text className="text-healthcare-text font-semibold">
                  {patientChats.find(c => c.id === selectedChat)?.patientName}
                </Text>
                <View />
              </Card>
            </View>

            {/* Messages */}
            <ScrollView className="flex-1 px-6">
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={`mb-4 flex-row ${
                    message.sender === 'doctor' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <View
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === 'doctor'
                        ? 'bg-healthcare-accent'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <Text
                      className={`${
                        message.sender === 'doctor' ? 'text-white' : 'text-healthcare-text'
                      }`}
                    >
                      {message.text}
                    </Text>
                    <Text
                      className={`text-xs mt-1 ${
                        message.sender === 'doctor' ? 'text-white/70' : 'text-healthcare-text/50'
                      }`}
                    >
                      {message.timestamp}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Message Input */}
            <View className="px-6 pb-6">
              <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4 py-3">
                <TextInput
                  className="flex-1 text-healthcare-text"
                  placeholder="Type your response..."
                  placeholderTextColor="#A0AEC0"
                  multiline
                />
                <TouchableOpacity className="ml-3">
                  <Send size={20} color="#B2DFDB" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}