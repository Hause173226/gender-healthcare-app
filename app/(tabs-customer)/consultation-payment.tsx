import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { consultationScheduleService } from '@/services/consultationScheduleService';
import { consultationBookingService, BookingStatus } from '@/services/consultationBookingService';
import { ArrowLeft } from 'lucide-react-native';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConsultationPaymentScreen() {
  const {
    scheduleId,
    doctorId,
    customerId,
    doctorName,
    slotTime,
    price,
    date,
    startTime,
  } = useLocalSearchParams();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!scheduleId || !customerId || !date || !startTime) {
      Alert.alert('❌ Missing Information', 'Insufficient data to proceed with payment.');
      return;
    }

    setLoading(true);
    try {
      const bookingPayload = {
        customerId: customerId as string,
        scheduleId: scheduleId as string,
        bookingDate: dayjs(`${date}T${startTime}`).toDate(),
        status: 'confirmed' as BookingStatus,
      };

      await consultationBookingService.createBooking(bookingPayload);
      await consultationScheduleService.updateSchedule(scheduleId as string, {
        status: 'booked',
      });

      router.replace('/(tabs-customer)/consultation-success');
    } catch (err: any) {
      Alert.alert('❌ Error', err?.response?.data?.message || 'Could not complete payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.replace('/(tabs-customer)/consultations')}
          className="pr-4"
        >
          <ArrowLeft size={24} color="#ec4899" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-pink-600">Payment Confirmation</Text>
      </View>

      {/* Nội dung */}
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <View className="flex-1 justify-center">
          {/* Thông tin thanh toán */}
          <View className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6 ">
            <Text className="text-lg font-bold text-pink-700 mb-4 text-center">
              Consultation with {doctorName}
            </Text>

            <View className="mb-2">
              <Text className="text-gray-500 text-sm">Transaction ID</Text>
              <Text className="text-base font-medium ">{scheduleId}</Text>
            </View>

            <View className="mb-2 ">
              <Text className="text-gray-500 text-sm">Date</Text>
              <Text className="text-base font-medium">
                {dayjs(date as string).format('DD/MM/YYYY')}
              </Text>
            </View>

            <View className="mb-2 ">
              <Text className="text-gray-500 text-sm">Time Slot</Text>
              <Text className="text-base font-medium">{slotTime}</Text>
            </View>

            <View className="border-t border-dashed border-gray-300 my-4 w-full" />

            <View className="">
              <Text className="text-gray-500">Total</Text>
              <Text className="text-3xl font-bold text-pink-600">{price}.000 VND</Text>
            </View>
          </View>
        </View>

        {/* Nút thanh toán ở cuối trang */}
        <TouchableOpacity
          disabled={loading}
          className={`py-4 rounded-lg ${loading ? 'bg-pink-300' : 'bg-pink-600'}`}
          onPress={handlePayment}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center text-lg font-bold">
              Pay {price}.000 VND
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
