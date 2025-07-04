import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, FlaskConical, User, Calendar, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function ResultsScreen() {
  const [activeTab, setActiveTab] = useState<'pending' | 'upload' | 'completed'>('pending');

  const pendingResults = [
    {
      id: 1,
      patientName: 'Sarah Wilson',
      testName: 'Comprehensive STI Panel',
      testDate: 'Dec 20, 2024',
      urgency: 'high',
    },
    {
      id: 2,
      patientName: 'Emma Johnson',
      testName: 'HIV Test',
      testDate: 'Dec 19, 2024',
      urgency: 'medium',
    },
    {
      id: 3,
      patientName: 'Michael Chen',
      testName: 'Basic STI Screening',
      testDate: 'Dec 18, 2024',
      urgency: 'low',
    },
  ];

  const completedResults = [
    {
      id: 1,
      patientName: 'Lisa Parker',
      testName: 'HIV Test',
      testDate: 'Dec 17, 2024',
      uploadDate: 'Dec 17, 2024',
      status: 'negative',
    },
    {
      id: 2,
      patientName: 'John Smith',
      testName: 'Comprehensive STI Panel',
      testDate: 'Dec 16, 2024',
      uploadDate: 'Dec 16, 2024',
      status: 'negative',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pending':
        return (
          <View className="gap-4">
            {pendingResults.map((result) => (
              <Card key={result.id}>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-healthcare-primary rounded-full items-center justify-center">
                      <User size={20} color="white" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-healthcare-text font-semibold">
                        {result.patientName}
                      </Text>
                      <Text className="text-healthcare-text/60 text-sm">
                        {result.testName}
                      </Text>
                    </View>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${
                    result.urgency === 'high' 
                      ? 'bg-healthcare-danger/20' 
                      : result.urgency === 'medium'
                      ? 'bg-healthcare-warning/20'
                      : 'bg-healthcare-success/20'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      result.urgency === 'high' 
                        ? 'text-healthcare-danger' 
                        : result.urgency === 'medium'
                        ? 'text-healthcare-warning'
                        : 'text-healthcare-success'
                    }`}>
                      {result.urgency} priority
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-4">
                  <Calendar size={16} color="#A0AEC0" />
                  <Text className="text-healthcare-text/60 ml-2 text-sm">
                    Test Date: {result.testDate}
                  </Text>
                </View>
                
                <Button title="Upload Results" />
              </Card>
            ))}
          </View>
        );

      case 'upload':
        return (
          <View className="gap-6">
            <Card>
              <Text className="text-lg font-semibold text-healthcare-text mb-4">
                Upload Test Results
              </Text>
              
              <Input
                label="Patient Name"
                placeholder="Search or select patient"
                leftIcon={<User size={20} color="#A0AEC0" />}
              />
              
              <Input
                label="Test Name"
                placeholder="Select test type"
                leftIcon={<FlaskConical size={20} color="#A0AEC0" />}
              />
              
              <View className="mb-4">
                <Text className="text-healthcare-text font-medium mb-2">Test Status</Text>
                <View className="flex-row gap-3">
                  {['Negative', 'Positive', 'Inconclusive'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      className="flex-1 py-3 border border-healthcare-primary rounded-lg items-center"
                    >
                      <Text className="text-healthcare-primary font-medium">{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <Input
                label="Additional Notes"
                placeholder="Enter any additional information..."
                multiline
                numberOfLines={4}
              />
              
              <TouchableOpacity className="border-2 border-dashed border-healthcare-primary rounded-lg py-8 items-center mb-4">
                <Upload size={32} color="#F8BBD9" />
                <Text className="text-healthcare-primary font-medium mt-2">
                  Upload Lab Report
                </Text>
                <Text className="text-healthcare-text/60 text-sm">
                  PDF, JPG, PNG up to 10MB
                </Text>
              </TouchableOpacity>
              
              <Button title="Upload Results" />
            </Card>
          </View>
        );

      case 'completed':
        return (
          <View className="gap-4">
            {completedResults.map((result) => (
              <Card key={result.id}>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-healthcare-success rounded-full items-center justify-center">
                      <CheckCircle size={20} color="white" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-healthcare-text font-semibold">
                        {result.patientName}
                      </Text>
                      <Text className="text-healthcare-text/60 text-sm">
                        {result.testName}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-healthcare-success/20 px-3 py-1 rounded-full">
                    <Text className="text-healthcare-success text-xs font-medium uppercase">
                      {result.status}
                    </Text>
                  </View>
                </View>
                
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-healthcare-text/60 text-sm">Test Date:</Text>
                    <Text className="text-healthcare-text text-sm">{result.testDate}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-healthcare-text/60 text-sm">Uploaded:</Text>
                    <Text className="text-healthcare-text text-sm">{result.uploadDate}</Text>
                  </View>
                </View>
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
            Test Results
          </Text>
          <Text className="text-healthcare-text/70 mt-1">
            Manage and upload patient test results
          </Text>
        </View>

        {/* Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">{pendingResults.length}</Text>
              <Text className="text-healthcare-text/70 text-sm">Pending</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">{completedResults.length}</Text>
              <Text className="text-healthcare-text/70 text-sm">Completed</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">24h</Text>
              <Text className="text-healthcare-text/70 text-sm">Avg Turnaround</Text>
            </Card>
          </View>
        </View>

        {/* Tabs */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'upload', label: 'Upload' },
              { key: 'completed', label: 'Completed' },
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
                    ? 'text-healthcare-accent' 
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