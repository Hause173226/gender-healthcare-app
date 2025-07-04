import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CycleCalendar } from '@/components/CycleCalendar';
import { Plus, TrendingUp, Droplets, Heart } from 'lucide-react-native';

export default function CycleScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>();
  
  // Mock data
  const periodDates = [
    '2024-12-01', '2024-12-02', '2024-12-03', '2024-12-04', '2024-12-05'
  ];
  const fertilityDates = [
    '2024-12-12', '2024-12-13', '2024-12-14', '2024-12-15', '2024-12-16'
  ];
  const ovulationDate = '2024-12-14';

  const cycleStats = [
    {
      title: 'Cycle Length',
      value: '28 days',
      icon: TrendingUp,
      color: '#F8BBD9',
    },
    {
      title: 'Period Length',
      value: '5 days',
      icon: Droplets,
      color: '#E57373',
    },
    {
      title: 'Next Period',
      value: 'Dec 29',
      icon: Heart,
      color: '#81C784',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-healthcare-text">
                Cycle Tracker
              </Text>
              <Text className="text-healthcare-text/70 mt-1">
                Day 14 of your cycle
              </Text>
            </View>
            <TouchableOpacity 
              className="bg-healthcare-primary rounded-full p-3"
              onPress={() => router.push('/(tabs-customer)/create-cycle')}
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cycle Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between">
            {cycleStats.map((stat, index) => (
              <Card key={index} className="flex-1 mx-1 items-center py-4">
                <stat.icon size={24} color={stat.color} />
                <Text className="text-healthcare-text font-semibold mt-2">
                  {stat.value}
                </Text>
                <Text className="text-healthcare-text/70 text-sm text-center">
                  {stat.title}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Calendar */}
        <View className="px-6 mb-6">
          <CycleCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            periodDates={periodDates}
            fertilityDates={fertilityDates}
            ovulationDate={ovulationDate}
          />
        </View>

        {/* Insights */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Today's Insights
          </Text>
          <Card className="bg-healthcare-secondary/20">
            <View className="flex-row items-center">
              <Heart size={32} color="#F8BBD9" />
              <View className="flex-1 ml-4">
                <Text className="text-healthcare-text font-semibold">
                  Ovulation Expected
                </Text>
                <Text className="text-healthcare-text/70">
                  Your fertility window is today. Consider taking a pregnancy test if you're trying to conceive.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Quick Actions
          </Text>
          <View className="gap-3">
            <Button 
              title="Log Period Start" 
              onPress={() => router.push('/(tabs-customer)/create-cycle')}
            />
            <Button title="Record Symptoms" variant="outline" />
            <Button title="Set Reminders" variant="outline" />
          </View>
        </View>

        {/* Predictions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Predictions
          </Text>
          <Card>
            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-healthcare-text">Next ovulation</Text>
                <Text className="text-healthcare-primary font-semibold">Jan 11</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-healthcare-text">Next period</Text>
                <Text className="text-healthcare-primary font-semibold">Dec 29</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-healthcare-text">Fertility window</Text>
                <Text className="text-healthcare-primary font-semibold">Jan 9-13</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}