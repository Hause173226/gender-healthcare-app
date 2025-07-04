import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FlaskConical, Clock, CircleCheck as CheckCircle, Calendar, DollarSign } from 'lucide-react-native';

export default function TestsScreen() {
  const [activeTab, setActiveTab] = useState<'available' | 'booked' | 'results'>('available');

  const availableTests = [
    {
      id: 1,
      name: 'Comprehensive STI Panel',
      description: 'Tests for Chlamydia, Gonorrhea, Syphilis, HIV, and more',
      price: 150,
      duration: '30 minutes',
      turnaround: '2-3 days',
    },
    {
      id: 2,
      name: 'Basic STI Screening',
      description: 'Tests for common STIs including Chlamydia and Gonorrhea',
      price: 80,
      duration: '15 minutes',
      turnaround: '24 hours',
    },
    {
      id: 3,
      name: 'HIV Test',
      description: 'Rapid HIV antibody test',
      price: 45,
      duration: '10 minutes',
      turnaround: '20 minutes',
    },
  ];

  const bookedTests = [
    {
      id: 1,
      testName: 'Comprehensive STI Panel',
      date: 'Dec 22, 2024',
      time: '2:00 PM',
      status: 'scheduled' as const,
    },
    {
      id: 2,
      testName: 'HIV Test',
      date: 'Dec 18, 2024',
      time: '10:30 AM',
      status: 'completed' as const,
    },
  ];

  const testResults = [
    {
      id: 1,
      testName: 'Basic STI Screening',
      date: 'Dec 15, 2024',
      status: 'negative' as const,
      details: 'All tests came back negative. No further action required.',
    },
    {
      id: 2,
      testName: 'HIV Test',
      date: 'Dec 10, 2024',
      status: 'negative' as const,
      details: 'HIV antibody test negative. Continue regular testing as recommended.',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'available':
        return (
          <View className="gap-4">
            {availableTests.map((test) => (
              <Card key={test.id} className="mb-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-healthcare-text mb-1">
                      {test.name}
                    </Text>
                    <Text className="text-healthcare-text/70 mb-3">
                      {test.description}
                    </Text>
                  </View>
                  <View className="bg-healthcare-primary rounded-lg px-3 py-1">
                    <Text className="text-white font-semibold">${test.price}</Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <Clock size={16} color="#A0AEC0" />
                    <Text className="text-healthcare-text/60 ml-1 text-sm">
                      {test.duration}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <FlaskConical size={16} color="#A0AEC0" />
                    <Text className="text-healthcare-text/60 ml-1 text-sm">
                      Results in {test.turnaround}
                    </Text>
                  </View>
                </View>
                
                <Button title="Book Test" />
              </Card>
            ))}
          </View>
        );

      case 'booked':
        return (
          <View className="gap-4">
            {bookedTests.map((booking) => (
              <Card key={booking.id} className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-semibold text-healthcare-text">
                    {booking.testName}
                  </Text>
                  <View className={`px-3 py-1 rounded-full ${
                    booking.status === 'scheduled' 
                      ? 'bg-healthcare-warning/20' 
                      : 'bg-healthcare-success/20'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      booking.status === 'scheduled' 
                        ? 'text-healthcare-warning' 
                        : 'text-healthcare-success'
                    }`}>
                      {booking.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-4">
                  <Calendar size={16} color="#F8BBD9" />
                  <Text className="text-healthcare-text ml-2">
                    {booking.date} at {booking.time}
                  </Text>
                </View>
                
                {booking.status === 'scheduled' && (
                  <View className="flex-row gap-2">
                    <Button title="Reschedule" variant="outline" size="small" className="flex-1" />
                    <Button title="Cancel" variant="outline" size="small" className="flex-1" />
                  </View>
                )}
              </Card>
            ))}
          </View>
        );

      case 'results':
        return (
          <View className="gap-4">
            {testResults.map((result) => (
              <Card key={result.id} className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-semibold text-healthcare-text">
                    {result.testName}
                  </Text>
                  <View className="flex-row items-center">
                    <CheckCircle size={20} color="#81C784" />
                    <Text className="text-healthcare-success font-semibold ml-1">
                      {result.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-healthcare-text/70 text-sm mb-3">
                  Test Date: {result.date}
                </Text>
                
                <Text className="text-healthcare-text mb-4">
                  {result.details}
                </Text>
                
                <Button title="Download Report" variant="outline" size="small" />
              </Card>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-healthcare-text">
            STI Testing
          </Text>
          <Text className="text-healthcare-text/70 mt-1">
            Book tests and view your results
          </Text>
        </View>

        {/* Tabs */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {[
              { key: 'available', label: 'Available' },
              { key: 'booked', label: 'Booked' },
              { key: 'results', label: 'Results' },
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
                <Text className={`text-center font-medium ${
                  activeTab === tab.key 
                    ? 'text-healthcare-primary' 
                    : 'text-healthcare-text/60'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6">
          {renderTabContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}