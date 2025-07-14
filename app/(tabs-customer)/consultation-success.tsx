import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConsultationSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
      <CheckCircle size={80} color="#10b981" />
      <Text className="text-2xl font-bold text-green-600 mt-4">Payment Successful</Text>
      <Text className="text-center text-gray-600 mt-2 mb-6">
        Your consultation has been booked successfully.
      </Text>
     <TouchableOpacity
  onPress={() =>
    router.replace({
      pathname: '/(tabs-customer)/consultation-history',
      params: { highlightId: 'ID_CỦA_BOOKING_VỪA_TẠO' }, // Thay thế bằng id thực tế
    })
  }
  className="bg-pink-600 px-6 py-3 rounded-xl"
>
  <Text className="text-white font-semibold text-lg">View Booking</Text>
</TouchableOpacity>

    </SafeAreaView>
  );
}
