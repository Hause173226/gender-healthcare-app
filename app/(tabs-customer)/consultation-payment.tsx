import React from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { consultationScheduleService } from '@/services/consultationScheduleService';
import { consultationBookingService, BookingStatus } from '@/services/consultationBookingService';

import dayjs from 'dayjs';

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

  const handlePayment = async () => {
    try {
      if (!scheduleId || !customerId || !date || !startTime) {
        Alert.alert('❌ Thiếu thông tin', 'Không đủ dữ liệu để thanh toán.');
        return;
      }

      const bookingPayload = {
        customerId: customerId as string,
        scheduleId: scheduleId as string,
        bookingDate: dayjs(`${date}T${startTime}`).toDate(),
status: 'confirmed' as BookingStatus,
      };

      const newBooking = await consultationBookingService.createBooking(bookingPayload);
      await consultationScheduleService.updateSchedule(scheduleId as string, {
        status: 'booked',
      });

      Alert.alert('✅ Thành công', 'Thanh toán và đặt lịch thành công!');
      router.replace('/(tabs-customer)/consultation-history');
    } catch (err: any) {
      console.error('❌ Lỗi khi thanh toán:', err?.response?.data || err.message);
      Alert.alert('❌ Lỗi', 'Không thể hoàn tất thanh toán.');
    }
  };

  return (
    <View className="flex-1 p-4 bg-white justify-center">
      <Text className="text-xl font-bold text-center mb-4">Xác nhận thanh toán</Text>

      <View className="bg-gray-100 rounded-lg p-4 mb-6">
        <Text className="text-base mb-2">👤 Tư vấn viên: <Text className="font-semibold">{doctorName}</Text></Text>
        <Text className="text-base mb-2">📅 Ngày: <Text className="font-semibold">{date}</Text></Text>
        <Text className="text-base mb-2">⏰ Khung giờ: <Text className="font-semibold">{slotTime}</Text></Text>
        <Text className="text-base mb-2">💵 Giá: <Text className="font-semibold">{price}.000 VND</Text></Text>
      </View>

      <TouchableOpacity
        className="bg-blue-600 py-3 rounded-lg"
        onPress={handlePayment}
      >
        <Text className="text-white text-center text-lg font-medium">
          Thanh toán {price}.000 VND
        </Text>
      </TouchableOpacity>
    </View>
  );
}
