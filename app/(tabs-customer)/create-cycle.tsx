import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar, Clock, Droplets, Heart, ArrowLeft } from 'lucide-react-native';

export default function CreateCycleScreen() {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const flowOptions = [
    { value: 'light', label: 'Light', color: '#FFB74D', icon: '💧' },
    { value: 'medium', label: 'Medium', color: '#F8BBD9', icon: '💧💧' },
    { value: 'heavy', label: 'Heavy', color: '#E57373', icon: '💧💧💧' },
  ];

  const symptomOptions = [
    'Cramps', 'Bloating', 'Mood swings', 'Headache', 
    'Fatigue', 'Breast tenderness', 'Acne', 'Food cravings'
  ];

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    if (!startDate) {
      Alert.alert('Error', 'Please select a start date');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Period logged successfully!', [
        { text: 'OK', onPress: () => router.back() }
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
              Log Period
            </Text>
          </View>
          <Text className="text-healthcare-text/70">
            Track your menstrual cycle for better health insights
          </Text>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Start Date */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Period Start Date
            </Text>
            <TouchableOpacity className="flex-row items-center p-4 border border-gray-300 rounded-lg">
              <Calendar size={20} color="#F8BBD9" />
              <Text className="text-healthcare-text ml-3 flex-1">
                {startDate || 'Select start date'}
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Flow Intensity */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Flow Intensity
            </Text>
            <View className="flex-row justify-between">
              {flowOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setFlow(option.value as any)}
                  className={`flex-1 mx-1 p-4 rounded-lg border-2 items-center ${
                    flow === option.value 
                      ? 'border-healthcare-primary bg-healthcare-primary/10' 
                      : 'border-gray-200'
                  }`}
                >
                  <Text className="text-2xl mb-2">{option.icon}</Text>
                  <Text className={`font-medium ${
                    flow === option.value ? 'text-healthcare-primary' : 'text-healthcare-text'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Symptoms */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Symptoms (Optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {symptomOptions.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  onPress={() => toggleSymptom(symptom)}
                  className={`px-3 py-2 rounded-full border ${
                    symptoms.includes(symptom)
                      ? 'bg-healthcare-primary border-healthcare-primary'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text className={`text-sm ${
                    symptoms.includes(symptom) ? 'text-white' : 'text-healthcare-text'
                  }`}>
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Notes */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Additional Notes
            </Text>
            <Input
              placeholder="Any additional notes about your period..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              className="h-24"
            />
          </Card>

          {/* Quick Tips */}
          <Card className="mb-6 bg-healthcare-secondary/20">
            <View className="flex-row items-start">
              <Heart size={24} color="#F8BBD9" className="mt-1" />
              <View className="flex-1 ml-3">
                <Text className="text-healthcare-text font-semibold mb-2">
                  Tracking Tips
                </Text>
                <Text className="text-healthcare-text/70 text-sm">
                  • Log your period on the first day of bleeding{'\n'}
                  • Track symptoms to identify patterns{'\n'}
                  • Regular tracking helps predict your next cycle
                </Text>
              </View>
            </View>
          </Card>

          {/* Save Button */}
          <View className="pb-6">
            <Button
              title="Save Period Log"
              onPress={handleSave}
              loading={loading}
              size="large"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}