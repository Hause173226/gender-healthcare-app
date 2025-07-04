import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Filter, TrendingUp } from 'lucide-react-native';

export default function FeedbackManagementScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'positive' | 'negative' | 'pending'>('all');

  const feedbacks = [
    {
      id: 1,
      patientName: 'Sarah Wilson',
      rating: 5,
      comment: 'Dr. Wilson was very professional and made me feel comfortable discussing sensitive topics. Highly recommend!',
      date: '2024-12-20',
      status: 'published',
      type: 'positive',
      consultation: 'Reproductive Health Consultation',
    },
    {
      id: 2,
      patientName: 'Emma Johnson',
      rating: 4,
      comment: 'Good consultation overall, but the waiting time was a bit long. The doctor was knowledgeable though.',
      date: '2024-12-19',
      status: 'pending',
      type: 'positive',
      consultation: 'STI Testing Consultation',
    },
    {
      id: 3,
      patientName: 'Michael Chen',
      rating: 2,
      comment: 'The consultation felt rushed and I didn\'t get all my questions answered. Could be improved.',
      date: '2024-12-18',
      status: 'pending',
      type: 'negative',
      consultation: 'General Health Check',
    },
  ];

  const stats = {
    averageRating: 4.2,
    totalFeedbacks: 156,
    positivePercentage: 85,
    pendingReviews: 12,
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return feedback.status === 'pending';
    return feedback.type === activeTab;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color="#FFB74D"
        fill={index < rating ? "#FFB74D" : "transparent"}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-healthcare-success/20 text-healthcare-success';
      case 'pending': return 'bg-healthcare-warning/20 text-healthcare-warning';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-healthcare-text mb-4">
            Patient Feedback
          </Text>
          
          {/* Stats Overview */}
          <View className="flex-row gap-3 mb-6">
            <Card className="flex-1 items-center py-3">
              <View className="flex-row items-center mb-1">
                <Star size={20} color="#FFB74D" fill="#FFB74D" />
                <Text className="text-lg font-bold text-healthcare-text ml-1">
                  {stats.averageRating}
                </Text>
              </View>
              <Text className="text-healthcare-text/70 text-sm">Avg Rating</Text>
            </Card>
            
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">
                {stats.totalFeedbacks}
              </Text>
              <Text className="text-healthcare-text/70 text-sm">Total Reviews</Text>
            </Card>
            
            <Card className="flex-1 items-center py-3">
              <View className="flex-row items-center mb-1">
                <TrendingUp size={16} color="#81C784" />
                <Text className="text-lg font-bold text-healthcare-text ml-1">
                  {stats.positivePercentage}%
                </Text>
              </View>
              <Text className="text-healthcare-text/70 text-sm">Positive</Text>
            </Card>
          </View>

          {/* Filter Tabs */}
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'positive', label: 'Positive' },
              { key: 'negative', label: 'Negative' },
              { key: 'pending', label: 'Pending' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                className={`flex-1 py-2 rounded-md ${
                  activeTab === tab.key 
                    ? 'bg-white shadow-sm' 
                    : ''
                }`}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text className={`text-center font-medium text-sm ${
                  activeTab === tab.key 
                    ? 'text-healthcare-accent' 
                    : 'text-healthcare-text/60'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedback List */}
        <ScrollView className="flex-1 px-6">
          {filteredFeedbacks.map((feedback) => (
            <Card key={feedback.id} className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-healthcare-primary rounded-full items-center justify-center">
                    <Text className="text-white font-semibold">
                      {feedback.patientName.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View className="ml-3">
                    <Text className="text-healthcare-text font-semibold">
                      {feedback.patientName}
                    </Text>
                    <Text className="text-healthcare-text/60 text-sm">
                      {feedback.consultation}
                    </Text>
                  </View>
                </View>
                
                <View className={`px-2 py-1 rounded-full ${getStatusColor(feedback.status)}`}>
                  <Text className="text-xs font-medium capitalize">
                    {feedback.status}
                  </Text>
                </View>
              </View>

              {/* Rating */}
              <View className="flex-row items-center mb-3">
                <View className="flex-row">
                  {renderStars(feedback.rating)}
                </View>
                <Text className="text-healthcare-text ml-2 font-medium">
                  {feedback.rating}/5
                </Text>
                <Text className="text-healthcare-text/60 text-sm ml-auto">
                  {feedback.date}
                </Text>
              </View>

              {/* Comment */}
              <Text className="text-healthcare-text mb-4">
                {feedback.comment}
              </Text>

              {/* Actions */}
              {feedback.status === 'pending' && (
                <View className="flex-row gap-2">
                  <Button title="Approve" size="small" className="flex-1" />
                  <Button title="Respond" variant="outline" size="small" className="flex-1" />
                </View>
              )}

              {feedback.status === 'published' && (
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <ThumbsUp size={16} color="#81C784" />
                    <Text className="text-healthcare-text/60 text-sm ml-1">
                      Helpful feedback
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Text className="text-healthcare-primary text-sm">
                      View Response
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}