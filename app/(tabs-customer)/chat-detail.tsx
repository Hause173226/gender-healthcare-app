import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Send, Paperclip, Phone, Video, MoveVertical as MoreVertical } from 'lucide-react-native';

export default function ChatDetailScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello Dr. Wilson, I have some questions about my recent test results.',
      sender: 'patient',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      text: 'Hi Sarah! I\'d be happy to help. What specific questions do you have about your results?',
      sender: 'doctor',
      timestamp: '10:32 AM',
    },
    {
      id: 3,
      text: 'The results show everything is normal, but I wanted to understand what the numbers mean and if there\'s anything I should be monitoring.',
      sender: 'patient',
      timestamp: '10:35 AM',
    },
    {
      id: 4,
      text: 'That\'s a great question! Let me explain each result in detail. Your hormone levels are all within the normal range, which is excellent news.',
      sender: 'doctor',
      timestamp: '10:37 AM',
    },
  ]);

  const advisor = {
    name: 'Dr. Sarah Wilson',
    specialty: 'Reproductive Health',
    isOnline: true,
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'patient',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-3 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft size={24} color="#2C3E50" />
              </TouchableOpacity>
              
              <View className="flex-row items-center flex-1">
                <View className="relative">
                  <View className="w-10 h-10 bg-healthcare-accent rounded-full items-center justify-center">
                    <Text className="text-white font-semibold">SW</Text>
                  </View>
                  {advisor.isOnline && (
                    <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-healthcare-success rounded-full border-2 border-white" />
                  )}
                </View>
                
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text font-semibold">
                    {advisor.name}
                  </Text>
                  <Text className="text-healthcare-text/60 text-sm">
                    {advisor.specialty} • {advisor.isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View className="flex-row items-center gap-3">
              <TouchableOpacity className="p-2">
                <Phone size={20} color="#F8BBD9" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Video size={20} color="#F8BBD9" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <MoreVertical size={20} color="#A0AEC0" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView className="flex-1 px-6 py-4">
          {messages.map((msg) => (
            <View
              key={msg.id}
              className={`mb-4 flex-row ${
                msg.sender === 'patient' ? 'justify-end' : 'justify-start'
              }`}
            >
              <View
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.sender === 'patient'
                    ? 'bg-healthcare-primary'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  className={`${
                    msg.sender === 'patient' ? 'text-white' : 'text-healthcare-text'
                  }`}
                >
                  {msg.text}
                </Text>
                <Text
                  className={`text-xs mt-1 ${
                    msg.sender === 'patient' ? 'text-white/70' : 'text-healthcare-text/50'
                  }`}
                >
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <View className="px-6 pb-6 bg-white border-t border-gray-200">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mt-4">
            <TouchableOpacity className="mr-3">
              <Paperclip size={20} color="#A0AEC0" />
            </TouchableOpacity>
            
            <TextInput
              className="flex-1 text-healthcare-text"
              placeholder="Type your message..."
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="#A0AEC0"
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity 
              onPress={sendMessage}
              className="ml-3 bg-healthcare-primary rounded-full p-2"
            >
              <Send size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}