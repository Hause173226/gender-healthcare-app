import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, FlaskConical, Download, Eye, Calendar, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Clock } from 'lucide-react-native';

export default function TestResultsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'pending'>('all');

  const testResults = [
    {
      id: 1,
      testName: 'Comprehensive STI Panel',
      date: '2024-12-15',
      status: 'completed',
      result: 'negative',
      doctor: 'Dr. Sarah Wilson',
      notes: 'All tests came back negative. Continue regular testing as recommended.',
      components: [
        { name: 'Chlamydia', result: 'Negative', normal: true },
        { name: 'Gonorrhea', result: 'Negative', normal: true },
        { name: 'Syphilis', result: 'Negative', normal: true },
        { name: 'HIV', result: 'Negative', normal: true },
      ],
    },
    {
      id: 2,
      testName: 'Hormone Panel',
      date: '2024-12-10',
      status: 'completed',
      result: 'normal',
      doctor: 'Dr. Emma Johnson',
      notes: 'Hormone levels are within normal range. No action required.',
      components: [
        { name: 'Estrogen', result: '150 pg/mL', normal: true },
        { name: 'Progesterone', result: '8.2 ng/mL', normal: true },
        { name: 'FSH', result: '6.1 mIU/mL', normal: true },
        { name: 'LH', result: '4.8 mIU/mL', normal: true },
      ],
    },
    {
      id: 3,
      testName: 'Basic Blood Work',
      date: '2024-12-20',
      status: 'pending',
      result: null,
      doctor: 'Dr. Michael Chen',
      notes: null,
      components: null,
    },
    {
      id: 4,
      testName: 'Vitamin D Test',
      date: '2024-12-05',
      status: 'completed',
      result: 'low',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Vitamin D levels are below normal. Recommend supplementation.',
      components: [
        { name: 'Vitamin D (25-OH)', result: '18 ng/mL', normal: false },
      ],
    },
  ];

  const filteredResults = testResults.filter(result => {
    if (activeTab === 'all') return true;
    if (activeTab === 'recent') return new Date(result.date) > new Date('2024-12-10');
    if (activeTab === 'pending') return result.status === 'pending';
    return true;
  });

  const getStatusIcon = (status: string, result?: string) => {
    if (status === 'pending') return <Clock size={20} color="#FFB74D" />;
    if (result === 'negative' || result === 'normal') return <CheckCircle size={20} color="#81C784" />;
    if (result === 'low' || result === 'high') return <AlertTriangle size={20} color="#FFB74D" />;
    return <FlaskConical size={20} color="#A0AEC0" />;
  };

  const getStatusColor = (status: string, result?: string) => {
    if (status === 'pending') return 'bg-healthcare-warning/20 text-healthcare-warning';
    if (result === 'negative' || result === 'normal') return 'bg-healthcare-success/20 text-healthcare-success';
    if (result === 'low' || result === 'high') return 'bg-healthcare-warning/20 text-healthcare-warning';
    return 'bg-gray-200 text-gray-600';
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
              Test Results
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">
                {testResults.filter(t => t.status === 'completed').length}
              </Text>
              <Text className="text-healthcare-text/70 text-sm">Completed</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">
                {testResults.filter(t => t.status === 'pending').length}
              </Text>
              <Text className="text-healthcare-text/70 text-sm">Pending</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">
                {testResults.filter(t => t.result === 'normal' || t.result === 'negative').length}
              </Text>
              <Text className="text-healthcare-text/70 text-sm">Normal</Text>
            </Card>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'recent', label: 'Recent' },
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

        {/* Test Results List */}
        <ScrollView className="flex-1 px-6">
          {filteredResults.map((test) => (
            <Card key={test.id} className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  {getStatusIcon(test.status, test.result)}
                  <View className="ml-3">
                    <Text className="text-healthcare-text font-semibold">
                      {test.testName}
                    </Text>
                    <Text className="text-healthcare-text/60 text-sm">
                      {test.doctor}
                    </Text>
                  </View>
                </View>
                
                <View className={`px-2 py-1 rounded-full ${getStatusColor(test.status, test.result)}`}>
                  <Text className="text-xs font-medium capitalize">
                    {test.status === 'pending' ? 'Pending' : test.result}
                  </Text>
                </View>
              </View>

              {/* Date */}
              <View className="flex-row items-center mb-3">
                <Calendar size={16} color="#A0AEC0" />
                <Text className="text-healthcare-text/60 ml-2 text-sm">
                  Test Date: {test.date}
                </Text>
              </View>

              {/* Test Components (for completed tests) */}
              {test.components && (
                <View className="mb-3">
                  <Text className="text-healthcare-text font-medium text-sm mb-2">Results:</Text>
                  {test.components.map((component, index) => (
                    <View key={index} className="flex-row items-center justify-between py-1">
                      <Text className="text-healthcare-text text-sm">{component.name}</Text>
                      <View className="flex-row items-center">
                        <Text className={`text-sm mr-2 ${
                          component.normal ? 'text-healthcare-success' : 'text-healthcare-warning'
                        }`}>
                          {component.result}
                        </Text>
                        {component.normal ? (
                          <CheckCircle size={14} color="#81C784" />
                        ) : (
                          <AlertTriangle size={14} color="#FFB74D" />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Notes */}
              {test.notes && (
                <View className="mb-3">
                  <Text className="text-healthcare-text font-medium text-sm">Doctor's Notes:</Text>
                  <Text className="text-healthcare-text/70 text-sm">{test.notes}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                {test.status === 'completed' ? (
                  <View className="flex-row gap-2 flex-1">
                    <Button title="View Details" size="small" className="flex-1" />
                    <TouchableOpacity className="bg-healthcare-secondary/30 rounded-lg px-3 py-2 flex-row items-center">
                      <Download size={16} color="#F8BBD9" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Button title="Check Status" size="small" className="flex-1" />
                )}
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}