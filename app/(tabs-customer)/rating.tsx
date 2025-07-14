
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, ArrowLeft } from 'lucide-react-native';
import { consultationBookingService } from '@/services/consultationBookingService';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RatingScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!bookingId) {
      Alert.alert('Error', 'Missing booking ID.');
      return;
    }

    try {

      const token = await AsyncStorage.getItem('token');
      await consultationBookingService.updateBooking(bookingId, { rating, feedback });
      Alert.alert('Thank you!', 'Your rating has been submitted.');
      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 403
          ? 'You are not allowed to rate this booking.'
          : 'Something went wrong. Please try again later.');
      Alert.alert('Error', message);
    }
  };

  return (

    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
<TouchableOpacity
  onPress={() =>
    router.replace({
      pathname: '/(tabs-customer)/booking-detail',
      params: { bookingId },
    })
  }
  className="pr-4"
>
            <ArrowLeft size={24} color="#ec4899" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-pink-500">Rate Consultation</Text>
        </View>

        {/* Main content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 120 }}
        >
          <Text className="text-2xl font-bold text-center text-gray-900 mb-6">
            How was your consultation?
          </Text>

          <Text className="text-base font-medium mb-2 text-gray-700">Satisfaction Level</Text>
          <View className="flex-row justify-center mb-6">
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => setRating(value)} className="mx-1">
                <Star
                  size={36}
                  color={value <= rating ? '#f472b6' : '#d1d5db'}
                  fill={value <= rating ? '#f472b6' : 'none'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-base font-medium mb-2 text-gray-700">Your Feedback</Text>
          <TextInput
            multiline
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Write something about your experience..."
            className="border border-gray-300 rounded-2xl p-4 h-32 text-base text-gray-800"
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Fixed submit button at bottom */}
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-2">
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-pink-500 py-4 rounded-full"
          >
            <Text className="text-white text-center text-lg font-semibold">Submit Rating</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>

  );
}
